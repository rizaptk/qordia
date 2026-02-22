
"use client";

import { useMemo } from 'react';
import type { Order } from "@/lib/types";
import { OrderTicket } from "@/components/pds/order-ticket";
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';
import { Truck } from 'lucide-react';
import { useTableStore } from '@/stores/table-store';

type TableData = {
    id: string;
    tableNumber: string;
}

export default function RunnerPage() {
    const firestore = useFirestore();
    const { tenant, isLoading: isAuthLoading } = useAuthStore();
    const TENANT_ID = tenant?.id;

    const readyOrdersQuery = useMemoFirebase(() => 
        firestore && TENANT_ID
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`), 
            where('status', '==', 'Ready')
          )
        : null, 
        [firestore, TENANT_ID]
    );
    const { data: readyOrders, isLoading: isLoadingOrders } = useCollection<Order>(readyOrdersQuery);
    
    const { tables } = useTableStore();

    // const tablesRef = useMemoFirebase(() => 
    //     firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/tables`) : null, 
    //     [firestore, TENANT_ID]
    // );
    // const { data: tables, isLoading: isLoadingTables } = useCollection<TableData>(tablesRef);

    const { sortedReadyOrders, tableMap } = useMemo(() => {
        const sorted = readyOrders?.sort((a,b) => (b.orderedAt.seconds || 0) - (a.orderedAt.seconds || 0)) ?? [];
        const map = new Map(tables?.map(t => [t.id, t.tableNumber]));
        return { sortedReadyOrders: sorted, tableMap: map };
    }, [readyOrders, tables]);

    const isLoading = isLoadingOrders || isAuthLoading;

    if (isLoading || !TENANT_ID) {
        return <div className="text-center text-muted-foreground py-16">Loading ready orders...</div>
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Ready for Delivery</h1>
             {sortedReadyOrders.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {sortedReadyOrders.map(order => {
                        const tableNumberDisplay = order.tableId === 'Takeaway'
                            ? 'Takeaway'
                            : `Table ${tableMap.get(order.tableId) || order.tableId}`;
                        return <OrderTicket key={order.id} order={order} tenantId={TENANT_ID} tableNumber={tableNumberDisplay} />
                    })}
                </div>
             ) : (
                <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4">
                    <Truck className="w-16 h-16" />
                    <p className="text-lg">No orders are ready for delivery.</p>
                </div>
             )}
        </div>
    );
}
