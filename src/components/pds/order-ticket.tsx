"use client";

import { useEffect, useState } from "react";
import type { Order, CartItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, ArrowRight } from "lucide-react";

function formatTime(date: Date) {
    const now = new Date();
    const diff = Math.round((now.getTime() - date.getTime()) / 1000); // difference in seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function OrderTicket({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState(initialOrder);
  const [time, setTime] = useState(formatTime(initialOrder.timestamp));

  useEffect(() => {
    const timer = setInterval(() => {
        setTime(formatTime(order.timestamp));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.timestamp]);

  const handleNextStatus = () => {
    setOrder(prev => {
      if (prev.status === 'Placed') return { ...prev, status: 'In Progress' };
      if (prev.status === 'In Progress') return { ...prev, status: 'Ready' };
      return prev;
    });
  };

  const getStatusColor = (status: Order['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch(status) {
        case 'Placed': return 'default';
        case 'In Progress': return 'secondary';
        case 'Ready': return 'outline';
        default: return 'default';
    }
  }

  const getButtonText = () => {
      if(order.status === 'Placed') return 'Start Preparing';
      if(order.status === 'In Progress') return 'Mark as Ready';
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
        {order.items.map((item, index) => (
            <div key={item.id}>
                <div>
                    <p className="font-semibold">{item.quantity}x {item.menuItem.name}</p>
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
        <Button onClick={handleNextStatus} className="w-full" disabled={order.status === 'Ready' || order.status === 'Completed'}>
            <span>{getButtonText()}</span>
            <ArrowRight className="w-4 h-4 ml-2"/>
        </Button>
      </CardFooter>
    </Card>
  );
}
