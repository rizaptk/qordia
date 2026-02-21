
"use client";

import { useEffect, useState } from "react";
import type { Order, OrderItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, ArrowRight, Check, Play } from "lucide-react";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";

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

const statusStyles: Record<Order['status'], string> = {
    Placed: 'bg-amber-500/20 text-amber-700 border-amber-500/50 dark:text-amber-400',
    Accepted: 'bg-blue-500/20 text-blue-700 border-blue-500/50 dark:text-blue-400',
    'In Progress': 'bg-primary/20 text-primary border-primary/50',
    Ready: 'bg-accent/20 text-accent-foreground border-accent/50',
    Served: 'bg-gray-500/20 text-gray-700 border-gray-500/50 dark:text-gray-400',
    Completed: 'bg-gray-500/20 text-gray-700 border-gray-500/50 dark:text-gray-400',
    Refunded: 'bg-red-500/20 text-red-700 border-red-500/50 dark:text-red-400',
};


export function OrderTicket({ order, tenantId }: { order: Order, tenantId: string }) {
  const [time, setTime] = useState(formatTime(order.orderedAt));
  const firestore = useFirestore();

  useEffect(() => {
    const timer = setInterval(() => {
        setTime(formatTime(order.orderedAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.orderedAt]);

  const handleNextStatus = () => {
    if (!firestore) return;
    const orderRef = doc(firestore, `tenants/${tenantId}/orders/${order.id}`);

    const statusFlow: Partial<Record<Order['status'], Order['status']>> = {
      'Placed': 'Accepted',
      'Accepted': 'In Progress',
      'In Progress': 'Ready',
      'Ready': 'Served',
    };
    
    const nextStatus = statusFlow[order.status];
    
    if (nextStatus) {
        updateDocumentNonBlocking(orderRef, { status: nextStatus });
    }
  };

  const getButtonAction = () => {
      switch(order.status) {
          case 'Placed': return { text: 'Accept Order', icon: Check };
          case 'Accepted': return { text: 'Start Preparing', icon: Play };
          case 'In Progress': return { text: 'Mark as Ready', icon: ArrowRight };
          case 'Ready': return { text: 'Mark as Served', icon: Check };
          default: return { text: 'Completed', icon: Check };
      }
  }

  const { text: buttonText, icon: ButtonIcon } = getButtonAction();

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
            <Badge className={cn('text-sm capitalize', statusStyles[order.status] || 'bg-gray-500/20 text-gray-700')}>
                {order.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 overflow-y-auto">
        {(order.items as OrderItem[]).map((item, index) => (
            <div key={`${item.menuItemId}-${index}`}>
                <div>
                    <p className="font-semibold">{item.quantity}x {item.name}</p>
                    {(Object.keys(item.customizations).length > 0 || item.specialNotes) && (
                         <div className="pl-4 mt-1 text-sm text-muted-foreground border-l-2 border-slate-300 dark:border-slate-700 ml-1">
                            <div className="pl-3 space-y-0.5">
                                {Object.entries(item.customizations).map(([key, value]) => (
                                    <p key={key}><span className="font-medium text-foreground">{key}:</span> {value}</p>
                                ))}
                                {item.specialNotes && <p className="font-medium text-amber-600 dark:text-amber-400">Note: {item.specialNotes}</p>}
                            </div>
                        </div>
                    )}
                </div>
                {index < order.items.length -1 && <Separator className="mt-3"/>}
            </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleNextStatus} className="w-full" disabled={order.status === 'Served' || order.status === 'Completed'}>
            <span>{buttonText}</span>
            <ButtonIcon className="w-4 h-4 ml-2"/>
        </Button>
      </CardFooter>
    </Card>
  );
}
