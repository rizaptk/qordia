'use client';

import { useMemo, use } from 'react';
import type { Order, OrderItem } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, writeBatch, doc } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SettleBillPage({ params }: { params: Promise<{ tableId: string }> }) {
    const { tableId } = use(params);
    const firestore = useFirestore();
    const { tenant, isLoading: isAuthLoading } = useAuthStore();
    const { toast } = useToast();
    const router = useRouter();
    const TENANT_ID = tenant?.id;

    const tableOrdersQuery = useMemoFirebase(() => 
        firestore && TENANT_ID
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`), 
            where('tableId', '==', tableId),
            where('status', 'in', ['Placed', 'In Progress', 'Ready', 'Served'])
          )
        : null, 
        [firestore, TENANT_ID, tableId]
    );
    const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(tableOrdersQuery);

    const { billItems, totalAmount } = useMemo(() => {
        if (!orders) return { billItems: [], totalAmount: 0 };
        
        const allItems = orders.flatMap(o => o.items as OrderItem[]);
        const total = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        return { billItems: allItems, totalAmount: total };
    }, [orders]);

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
            toast({ title: 'Success', description: `Bill for Table ${tableId} has been settled.` });
            router.push('/staff/cashier');
        } catch (error) {
            console.error('Error settling bill:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not settle the bill.' });
        }
    };


    if (isLoadingOrders || isAuthLoading || !TENANT_ID) {
        return <div className="text-center text-muted-foreground py-16">Loading bill for Table {tableId}...</div>
    }

    return (
       <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-3xl">Bill for Table {tableId}</CardTitle>
                <CardDescription>Review all items and process payment.</CardDescription>
            </CardHeader>
            <CardContent>
                {billItems.length > 0 ? (
                    <ScrollArea className="h-96">
                        <div className="space-y-4">
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
            </CardContent>
            {billItems.length > 0 && (
                 <CardFooter className="flex-col items-stretch space-y-4 pt-4 border-t">
                    <div className="flex justify-between text-2xl font-bold">
                        <span>Total Due</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline">Cash</Button>
                        <Button variant="outline">Card</Button>
                        <Button variant="outline">QR Pay</Button>
                    </div>
                    <Button size="lg" onClick={handleSettleBill}>
                        Mark as Paid & Close Table
                    </Button>
                </CardFooter>
            )}
       </Card>
    );
}
