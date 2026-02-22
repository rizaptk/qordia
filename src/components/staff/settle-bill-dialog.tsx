
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';

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

    const totalAmount = useMemo(() => {
        if (!orders) return 0;
        return orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    }, [orders]);
    
    const handleSettleAll = async () => {
        if (!firestore || !TENANT_ID || !orders || orders.length === 0 || !bill) {
            toast({ variant: 'destructive', title: 'Error', description: 'No orders to settle.' });
            return;
        }

        const batch = writeBatch(firestore);
        
        orders.forEach(order => {
            const orderRef = doc(firestore, `tenants/${TENANT_ID}/orders`, order.id);
            batch.update(orderRef, { status: 'Completed' });
        });

        const tableRef = doc(firestore, `tenants/${TENANT_ID}/tables`, bill.tableId);
        batch.update(tableRef, { status: 'inactive' });

        try {
            await batch.commit();
            toast({ title: 'Success', description: `Entire bill for Table ${bill?.tableNumber} has been settled.` });
            onOpenChange(false);
        } catch (error) {
            console.error('Error settling bill:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not settle the bill.' });
        }
    };
    
    const handleSettleSingleOrder = async (orderToSettle: Order) => {
        if (!firestore || !TENANT_ID || !orders || !bill) return;

        const batch = writeBatch(firestore);
        const orderRef = doc(firestore, `tenants/${TENANT_ID}/orders`, orderToSettle.id);
        batch.update(orderRef, { status: 'Completed' });
        
        // If this is the last active order for the table, close the table session
        if (orders.length === 1) {
            const tableRef = doc(firestore, `tenants/${TENANT_ID}/tables`, bill.tableId);
            batch.update(tableRef, { status: 'inactive' });
        }

        try {
            await batch.commit();
            toast({ title: 'Order Paid', description: `Order #${orderToSettle.id.substring(0,5)} has been settled.` });
            // The dialog will automatically update as the paid order is removed from the query results.
            // If it was the last order, the dialog will close.
            if(orders.length === 1) {
                onOpenChange(false);
            }
        } catch (error) {
             console.error('Error settling single order:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not settle the order.' });
        }
    }
    
    if (!bill) return null;

    return (
       <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-3xl">Bill for Table {bill.tableNumber}</DialogTitle>
                    <DialogDescription>Settle the entire bill or pay for individual orders to split the payment.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {isLoadingOrders ? (
                        <div className="text-center text-muted-foreground py-16">Loading bill...</div>
                    ) : orders && orders.length > 0 ? (
                        <ScrollArea className="h-96">
                            <div className="space-y-4 pr-6">
                                {orders.map((order) => (
                                    <Card key={order.id} className="bg-muted/50">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-lg">Order #{order.id.substring(0, 5)}...</CardTitle>
                                                <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(order.orderedAt.seconds * 1000), { addSuffix: true })}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {(order.items as OrderItem[]).map((item, index) => (
                                                <div key={index} className="flex justify-between items-start text-sm">
                                                    <p>{item.quantity}x {item.name}</p>
                                                    <p className="font-medium">${(item.price).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                        <CardFooter className="flex justify-between items-center bg-muted p-3">
                                            <p className="font-bold">Order Total: ${(order.totalAmount || 0).toFixed(2)}</p>
                                            <Button size="sm" onClick={() => handleSettleSingleOrder(order)}>
                                                Pay This Order
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                         <div className="text-center text-muted-foreground py-16">
                            <p>No active orders for this table.</p>
                        </div>
                    )}
                </div>
                {orders && orders.length > 0 && (
                     <DialogFooter className="flex-col items-stretch space-y-4 pt-4 border-t sm:flex-col sm:space-x-0">
                        <Separator />
                        <div className="flex justify-between text-2xl font-bold">
                            <span>Total Due</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        <Button 
                            size="lg" 
                            onClick={handleSettleAll}
                        >
                            Pay Entire Bill & Close Table
                        </Button>
                    </DialogFooter>
                )}
           </DialogContent>
       </Dialog>
    );
}
