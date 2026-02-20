
'use client';

import { useMemo } from 'react';
import type { Order } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Banknote } from 'lucide-react';

type TableBill = {
    tableId: string;
    totalAmount: number;
    orderCount: number;
}

export default function CashierPage() {
    const firestore = useFirestore();
    const { tenant, isLoading: isAuthLoading } = useAuthStore();
    const TENANT_ID = tenant?.id;

    const activeOrdersQuery = useMemoFirebase(() => 
        firestore && TENANT_ID
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`), 
            where('status', 'in', ['Placed', 'In Progress', 'Ready', 'Served'])
          )
        : null, 
        [firestore, TENANT_ID]
    );
    const { data: activeOrders, isLoading: isLoadingOrders } = useCollection<Order>(activeOrdersQuery);

    const openBills = useMemo(() => {
        if (!activeOrders) return [];
        const billsByTable = activeOrders.reduce((acc, order) => {
            if (!acc[order.tableId]) {
                acc[order.tableId] = {
                    tableId: order.tableId,
                    totalAmount: 0,
                    orderCount: 0,
                };
            }
            acc[order.tableId].totalAmount += order.totalAmount || 0;
            acc[order.tableId].orderCount += 1;
            return acc;
        }, {} as Record<string, TableBill>);

        return Object.values(billsByTable).sort((a,b) => a.tableId.localeCompare(b.tableId, undefined, {numeric: true}));
    }, [activeOrders]);

    if (isLoadingOrders || isAuthLoading || !TENANT_ID) {
        return <div className="text-center text-muted-foreground py-16">Loading open bills...</div>
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Open Bills</h1>
            {openBills.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {openBills.map(bill => (
                        <Card key={bill.tableId}>
                            <CardHeader>
                                <CardTitle>Table {bill.tableId}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${bill.totalAmount.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">{bill.orderCount} order(s)</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/staff/cashier/${bill.tableId}`}>View & Settle Bill</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                    <Banknote className="w-16 h-16" />
                    <p className="text-lg">No open bills right now.</p>
                </div>
            )}
        </div>
    );
}
