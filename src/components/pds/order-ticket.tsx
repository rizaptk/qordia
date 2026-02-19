"use client";

import { useEffect, useState } from "react";
import type { Order, OrderItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, ArrowRight, Check } from "lucide-react";
import { useFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

const TENANT_ID = 'qordiapro-tenant';

function formatTime(date: any) {
    if (!date) return '...';
    // Handle both Date objects and Firestore Timestamps
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : date;
    const now = new Date();
    const diff = Math.round((now.getTime() - dateObj.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function OrderTicket({ order }: { order: Order }) {
  const [time, setTime] = useState(formatTime(order.orderedAt));
  const { firestore } = useFirebase();

  useEffect(() => {
    const timer = setInterval(() => {
        setTime(formatTime(order.orderedAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.orderedAt]);

  const handleNextStatus = () => {
    if (!firestore) return;
    const orderRef = doc(firestore, `tenants/${TENANT_ID}/orders/${order.id}`);

    let nextStatus: Order['status'] | null = null;
    if (order.status === 'Placed') nextStatus = 'In Progress';
    if (order.status === 'In Progress') nextStatus = 'Ready';
    if (order.status === 'Ready') nextStatus = 'Served';
    
    if (nextStatus) {
        updateDocumentNonBlocking(orderRef, { status: nextStatus });
    }
  };

  const getButtonText = () => {
      if(order.status === 'Placed') return 'Start Preparing';
      if(order.status === 'In Progress') return 'Mark as Ready';
      if(order.status === 'Ready') return 'Mark as Served';
      return 'Completed';
  }

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-2xl">Table {order.tableId}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Clock className="w-4 h-4" />
                <span>{time}</span>
              </p>
            </div>
            <Badge className={
                `text-sm
                ${order.status === 'Placed' ? 'bg-primary/20 text-primary border-primary/50' : ''} 
                ${order.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50' : ''}
                ${order.status === 'Ready' ? 'bg-accent/20 text-accent border-accent/50' : ''}`
            }>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 overflow-y-auto">
        {(order.items as OrderItem[]).map((item, index) => (
            <div key={`${item.menuItemId}-${index}`}>
                <div>
                    <p className="font-semibold">{item.quantity}x {item.name}</p>
                    <div className="pl-4 text-sm text-muted-foreground">
                        {Object.entries(item.customizations).map(([key, value]) => (
                            <p key={key}>- {key}: {value}</p>
                        ))}
                        {item.specialNotes && <p className="text-amber-600 dark:text-amber-400">- Note: {item.specialNotes}</p>}
                    </div>
                </div>
                {index < order.items.length -1 && <Separator className="mt-3"/>}
            </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleNextStatus} className="w-full" disabled={order.status === 'Served' || order.status === 'Completed'}>
            <span>{getButtonText()}</span>
            {order.status !== 'Ready' ? <ArrowRight className="w-4 h-4 ml-2"/> : <Check className="w-4 h-4 ml-2"/>}
        </Button>
      </CardFooter>
    </Card>
  );
}
