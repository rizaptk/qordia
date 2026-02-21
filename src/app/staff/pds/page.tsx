
"use client";

import { useMemo } from 'react';
import type { Order } from "@/lib/types";
import { OrderTicket } from "@/components/pds/order-ticket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';

type TableData = {
    id: string;
    tableNumber: string;
}

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

    const tablesRef = useMemoFirebase(() => 
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/tables`) : null, 
        [firestore, TENANT_ID]
    );
    const { data: tables, isLoading: isLoadingTables } = useCollection<TableData>(tablesRef);

    const { newOrders, inProgressOrders, readyOrders, tableMap } = useMemo(() => {
        const tableMap = new Map(tables?.map(t => [t.id, t.tableNumber]));
        const newOrds = orders?.filter(o => o.status === 'Placed' || o.status === 'Accepted').sort((a,b) => (a.orderedAt.seconds || 0) - (b.orderedAt.seconds || 0)) ?? [];
        const inProgress = orders?.filter(o => o.status === 'In Progress').sort((a,b) => (a.orderedAt.seconds || 0) - (b.orderedAt.seconds || 0)) ?? [];
        const ready = orders?.filter(o => o.status === 'Ready').sort((a,b) => (b.orderedAt.seconds || 0) - (a.orderedAt.seconds || 0)) ?? [];
        return { newOrders: newOrds, inProgressOrders: inProgress, readyOrders: ready, tableMap };
    }, [orders, tables]);

    const isLoading = isLoadingOrders || isAuthLoading || isLoadingTables;

    if (isLoading || !TENANT_ID) {
        return <div className="text-center text-muted-foreground py-16">Loading orders...</div>
    }
    
    const renderTickets = (ordersToRender: Order[], emptyMessage: string) => {
      if (ordersToRender.length > 0) {
        return (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {ordersToRender.map(order => {
              const tableNumberDisplay = order.tableId === 'Takeaway'
                ? 'Takeaway'
                : `Table ${tableMap.get(order.tableId) || order.tableId}`;
              return <OrderTicket key={order.id} order={order} tenantId={TENANT_ID} tableNumber={tableNumberDisplay} />;
            })}
          </div>
        );
      }
      return <div className="text-center text-muted-foreground py-16">{emptyMessage}</div>;
    };


    return (
        <Tabs defaultValue="new" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="new">New Orders ({newOrders.length})</TabsTrigger>
                <TabsTrigger value="preparing">In Progress ({inProgressOrders.length})</TabsTrigger>
                <TabsTrigger value="ready">Ready ({readyOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="flex-grow">
                 {renderTickets(newOrders, "No new orders.")}
            </TabsContent>
            <TabsContent value="preparing" className="flex-grow">
                {renderTickets(inProgressOrders, "No orders in progress.")}
            </TabsContent>
            <TabsContent value="ready" className="flex-grow">
                {renderTickets(readyOrders, "No orders are ready for pickup.")}
            </TabsContent>
        </Tabs>
    );
}
