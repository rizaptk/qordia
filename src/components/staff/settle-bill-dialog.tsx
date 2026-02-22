'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Order, OrderItem } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, writeBatch, doc } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type TableBill } from '@/app/staff/cashier/page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SettleBillDialogProps = {
    bill: TableBill | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

export function SettleBillDialog({ bill, isOpen, onOpenChange }: SettleBillDialogProps) {
    const firestore = useFirestore();
    const { tenant } = useAuthStore();
    const { toast } = useToast();
    const TENANT_ID = tenant?.id;

    const [amountPaid, setAmountPaid] = useState<number | undefined>();

    const tableOrdersQuery = useMemoFirebase(() =>
        firestore && TENANT_ID && bill
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`),
            where('tableId', '==', bill.tableId),
            where('status', 'in', ['Placed', 'In Progress', 'Ready', 'Served'])
          )
        : null,
        [firestore, TENANT_ID, bill]
    );
    const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(tableOrdersQuery);

    const { billItems, totalAmount } = useMemo(() => {
        if (!orders) return { billItems: [], totalAmount: 0 };
        
        const allItems = orders.flatMap(o => o.items as OrderItem[]);
        const total = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        return { billItems: allItems, totalAmount: total };
    }, [orders]);
    
    const changeDue = useMemo(() => {
        if (amountPaid === undefined || amountPaid < totalAmount) return 0;
        return amountPaid - totalAmount;
    }, [amountPaid, totalAmount]);
    
    // Reset amount paid when dialog opens for a new bill
    useEffect(() => {
        if(isOpen) {
            setAmountPaid(undefined);
        }
    }, [isOpen, bill]);


    const handleSettleBill = async () => {
        if (!firestore || !TENANT_ID || !orders || orders.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'No orders to settle.' });
            return;
        }

        const batch = writeBatch(firestore);
        orders.forEach(order => {
            const orderRef = doc(firestore, `tenants/${TENANT_ID}/orders`, order.id);
            batch.update(orderRef, { status: 'Completed' });
        });

        try {
            await batch.commit();
            toast({ title: 'Success', description: `Bill for Table ${bill?.tableNumber} has been settled.` });
            onOpenChange(false);
        } catch (error) {
            console.error('Error settling bill:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not settle the bill.' });
        }
    };
    
    if (!bill) return null;

    return (
       <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-3xl">Bill for Table {bill.tableNumber}</DialogTitle>
                    <DialogDescription>Review all items and process payment.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isLoadingOrders ? (
                        <div className="text-center text-muted-foreground py-16">Loading bill...</div>
                    ) : billItems.length > 0 ? (
                        <ScrollArea className="h-64">
                            <div className="space-y-4 pr-6">
                                {billItems.map((item, index) => (
                                    <div key={`${item.menuItemId}-${index}`} className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{item.quantity}x {item.name}</p>
                                            <div className="text-sm text-muted-foreground">
                                            {Object.entries(item.customizations).map(([key, value]) => (
                                                <p key={key}>- {value}</p>
                                            ))}
                                            </div>
                                        </div>
                                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                         <div className="text-center text-muted-foreground py-16">
                            <p>No active orders for this table.</p>
                        </div>
                    )}
                </div>
                {billItems.length > 0 && (
                     <DialogFooter className="flex-col items-stretch space-y-4 pt-4 border-t sm:flex-col sm:space-x-0">
                        <div className="flex justify-between text-2xl font-bold">
                            <span>Total Due</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount-paid">Cash Received</Label>
                            <Input 
                                id="amount-paid"
                                type="number"
                                placeholder="0.00"
                                value={amountPaid ?? ''}
                                onChange={(e) => setAmountPaid(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                        </div>
                        
                        {(amountPaid !== undefined && amountPaid > 0) && (
                             <div className="flex justify-between text-xl font-semibold text-primary">
                                <span>Change Due</span>
                                <span>${changeDue.toFixed(2)}</span>
                            </div>
                        )}

                        <Button 
                            size="lg" 
                            onClick={handleSettleBill}
                            disabled={amountPaid === undefined || amountPaid < totalAmount}
                        >
                            Mark as Paid & Close Table
                        </Button>
                    </DialogFooter>
                )}
           </DialogContent>
       </Dialog>
    );
}
