"use client";

import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { OrderStatusTracker } from '@/components/order/order-status-tracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const allStatuses: Order['status'][] = ['Placed', 'In Progress', 'Ready', 'Completed'];

const statusMessages = {
  Placed: "We've received your order and will start preparing it soon.",
  'In Progress': "Our team is now preparing your items with care.",
  Ready: "Your order is ready for pickup at the counter!",
  Completed: "Thank you for your order! We hope you enjoy it.",
};

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const [status, setStatus] = useState<Order['status']>('Placed');

  useEffect(() => {
    // Simulate status updates
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < allStatuses.length) {
        setStatus(allStatuses[currentIndex]);
      } else {
        clearInterval(interval);
      }
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-center font-headline text-3xl">
            Track Your Order
          </CardTitle>
          <p className="text-center text-muted-foreground">Order ID: {params.orderId}</p>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <OrderStatusTracker currentStatus={status} />
          <div className="text-center bg-primary/10 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-primary">Status: {status}</h3>
            <p className="text-muted-foreground">{statusMessages[status]}</p>
          </div>

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
