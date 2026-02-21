
"use client"
import type { Order } from '@/lib/types';
import { Check, ChefHat, Coffee, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const statuses: { name: Order['status'], icon: React.ElementType }[] = [
    { name: 'Placed', icon: Check },
    { name: 'In Progress', icon: ChefHat },
    { name: 'Ready', icon: Coffee },
    { name: 'Completed', icon: PackageCheck },
];

type OrderStatusTrackerProps = {
    currentStatus: Order['status'];
}

export function OrderStatusTracker({ currentStatus }: OrderStatusTrackerProps) {
    const currentIndex = statuses.findIndex(s => s.name === currentStatus);

    return (
        <div className="relative w-full">
            <div className="absolute left-0 top-5 w-full h-1 bg-muted rounded-full">
                 <div 
                    className="h-1 bg-primary rounded-full transition-all duration-700 ease-out" 
                    style={{width: `${(currentIndex / (statuses.length - 1)) * 100}%`}}>
                </div>
            </div>
            <div className="relative flex justify-between">
                {statuses.map((status, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                        <div key={status.name} className="flex flex-col items-center text-center w-24">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10",
                                isActive ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                            )}>
                                {isCurrent && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
                                <status.icon className="h-5 w-5" />
                            </div>
                            <p className={cn(
                                "mt-2 text-sm font-medium",
                                isActive ? "text-foreground" : "text-muted-foreground"
                            )}>{status.name}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
