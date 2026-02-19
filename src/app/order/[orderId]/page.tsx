"use client";

import { use } from 'react';
import type { Order } from '@/lib/types';
import { OrderStatusTracker } from '@/components/order/order-status-tracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';


const TENANT_ID = 'qordiapro-tenant';

const statusMessages = {
  Placed: "We've received your order and will start preparing it soon.",
  'In Progress': "Our team is now preparing your items with care.",
  Ready: "Your order is ready for pickup at the counter!",
  Served: "Your order has been served. Enjoy!",
  Completed: "Thank you for your order! We hope you enjoy it.",
};

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const resolvedParams = use(params as any);
  const { firestore } = useFirebase();

  const orderRef = useMemoFirebase(
    () => (firestore ? doc(firestore, `tenants/${TENANT_ID}/orders`, resolvedParams.orderId) : null),
    [firestore, resolvedParams.orderId]
  );
  const { data: order, isLoading } = useDoc<Order>(orderRef);

  const currentStatus = order?.status ?? 'Placed';
  const message = statusMessages[currentStatus] ?? "We're processing your order.";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-center font-headline text-3xl">
            Order #{resolvedParams.orderId}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {isLoading ? (
            <div className="space-y-8 pt-6">
                <Skeleton className="h-16 w-full" />
                <div className="text-center bg-primary/10 p-4 rounded-lg">
                    <Skeleton className="h-6 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                </div>
            </div>
          ) : order ? (
            <>
              <OrderStatusTracker currentStatus={currentStatus} />
              <div className="text-center bg-primary/10 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-primary">Status: {currentStatus}</h3>
                <p className="text-muted-foreground">{message}</p>
              </div>
            </>
          ) : (
            <div className="text-center text-destructive p-4 rounded-lg bg-destructive/10">
                <h3 className="font-semibold text-lg">Order Not Found</h3>
                <p>We couldn't find an order with that ID. Please check the ID and try again.</p>
            </div>
          )}

          <div className="text-center">
            <Button asChild>
                <Link href="/menu/12">Place Another Order</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
