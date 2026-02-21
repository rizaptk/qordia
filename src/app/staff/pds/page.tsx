
"use client";

import { useMemo } from 'react';
import type { Order } from "@/lib/types";
import { OrderTicket } from "@/components/pds/order-ticket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';

export default function PDSPage() {
    const firestore = useFirestore();
    const { tenant, isLoading: isAuthLoading } = useAuthStore();
    const TENANT_ID = tenant?.id;

    const ordersQuery = useMemoFirebase(() => 
        firestore && TENANT_ID
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`), 
            where('status', 'not-in', ['Completed', 'Served', 'Refunded'])
          )
        : null, 
        [firestore, TENANT_ID]
    );
    const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

    const { newOrders, inProgressOrders, readyOrders } = useMemo(() => {
        const newOrds = orders?.filter(o => o.status === 'Placed' || o.status === 'Accepted').sort((a,b) => (a.orderedAt.seconds || 0) - (b.orderedAt.seconds || 0)) ?? [];
        const inProgress = orders?.filter(o => o.status === 'In Progress').sort((a,b) => (a.orderedAt.seconds || 0) - (b.orderedAt.seconds || 0)) ?? [];
        const ready = orders?.filter(o => o.status === 'Ready').sort((a,b) => (b.orderedAt.seconds || 0) - (a.orderedAt.seconds || 0)) ?? [];
        return { newOrders: newOrds, inProgressOrders: inProgress, readyOrders: ready };
    }, [orders]);

    if (isLoadingOrders || isAuthLoading || !TENANT_ID) {
        return <div className="text-center text-muted-foreground py-16">Loading orders...</div>
    }

    return (
        <Tabs defaultValue="new" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="new">New Orders ({newOrders.length})</TabsTrigger>
                <TabsTrigger value="preparing">In Progress ({inProgressOrders.length})</TabsTrigger>
                <TabsTrigger value="ready">Ready ({readyOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="flex-grow">
                 {newOrders.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {newOrders.map(order => <OrderTicket key={order.id} order={order} tenantId={TENANT_ID} />)}
                    </div>
                 ) : (
                    <div className="text-center text-muted-foreground py-16">No new orders.</div>
                 )}
            </TabsContent>
            <TabsContent value="preparing" className="flex-grow">
                {inProgressOrders.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {inProgressOrders.map(order => <OrderTicket key={order.id} order={order} tenantId={TENANT_ID} />)}
                    </div>
                 ) : (
                    <div className="text-center text-muted-foreground py-16">No orders in progress.</div>
                 )}
            </TabsContent>
            <TabsContent value="ready" className="flex-grow">
                {readyOrders.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {readyOrders.map(order => <OrderTicket key={order.id} order={order} tenantId={TENANT_ID} />)}
                    </div>
                 ) : (
                    <div className="text-center text-muted-foreground py-16">No orders are ready for pickup.</div>
                 )}
            </TabsContent>
        </Tabs>
    );
}
