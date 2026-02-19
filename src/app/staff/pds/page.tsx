import { mockOrders } from "@/lib/data";
import { OrderTicket } from "@/components/pds/order-ticket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PDSPage() {
    const placedOrders = mockOrders.filter(o => o.status === 'Placed').sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
    const inProgressOrders = mockOrders.filter(o => o.status === 'In Progress').sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());;
    const readyOrders = mockOrders.filter(o => o.status === 'Ready').sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());;

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
