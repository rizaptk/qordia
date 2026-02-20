"use client";

import { useMemo } from 'react';
import type { Order } from "@/lib/types";
import { OrderTicket } from "@/components/pds/order-ticket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';

const TENANT_ID = 'qordiapro-tenant';

export default function PDSPage() {
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => 
        firestore 
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`), 
            where('status', 'not-in', ['Completed', 'Served'])
          )
        : null, 
        [firestore]
    );
    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

    const { placedOrders, inProgressOrders, readyOrders } = useMemo(() => {
        const placed = orders?.filter(o => o.status === 'Placed').sort((a,b) => (a.orderedAt.seconds || 0) - (b.orderedAt.seconds || 0)) ?? [];
        const inProgress = orders?.filter(o => o.status === 'In Progress').sort((a,b) => (a.orderedAt.seconds || 0) - (b.orderedAt.seconds || 0)) ?? [];
        const ready = orders?.filter(o => o.status === 'Ready').sort((a,b) => (b.orderedAt.seconds || 0) - (a.orderedAt.seconds || 0)) ?? [];
        return { placedOrders: placed, inProgressOrders: inProgress, readyOrders: ready };
    }, [orders]);

    if (isLoading) {
        return <div className="text-center text-muted-foreground py-16">Loading orders...</div>
    }

    return (
        <Tabs defaultValue="new" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="new">New Orders ({placedOrders.length})</TabsTrigger>
                <TabsTrigger value="preparing">In Progress ({inProgressOrders.length})</TabsTrigger>
                <TabsTrigger value="ready">Ready ({readyOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="flex-grow">
                 {placedOrders.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {placedOrders.map(order => <OrderTicket key={order.id} order={order} />)}
                    </div>
                 ) : (
                    <div className="text-center text-muted-foreground py-16">No new orders.</div>
                 )}
            </TabsContent>
            <TabsContent value="preparing" className="flex-grow">
                {inProgressOrders.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {inProgressOrders.map(order => <OrderTicket key={order.id} order={order} />)}
                    </div>
                 ) : (
                    <div className="text-center text-muted-foreground py-16">No orders in progress.</div>
                 )}
            </TabsContent>
            <TabsContent value="ready" className="flex-grow">
                {readyOrders.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {readyOrders.map(order => <OrderTicket key={order.id} order={order} />)}
                    </div>
                 ) : (
                    <div className="text-center text-muted-foreground py-16">No orders are ready for pickup.</div>
                 )}
            </TabsContent>
        </Tabs>
    );
}
