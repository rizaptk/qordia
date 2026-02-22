
'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
    const firestore = useFirestore();
    const { user } = useAuthStore();

    const notificationsQuery = useMemoFirebase(() => 
        (firestore && user)
        ? query(
            collection(firestore, `users/${user.uid}/notifications`),
            orderBy('createdAt', 'desc')
          )
        : null, 
        [firestore, user]
    );
    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

    const unreadCount = useMemo(() => {
        return notifications?.filter(n => !n.isRead).length ?? 0;
    }, [notifications]);

    const handleMarkAsRead = (notificationId: string) => {
        if (!firestore || !user) return;
        const notifRef = doc(firestore, `users/${user.uid}/notifications`, notificationId);
        updateDocumentNonBlocking(notifRef, { isRead: true });
    }

    const handleDelete = (notificationId: string) => {
        if (!firestore || !user) return;
        const notifRef = doc(firestore, `users/${user.uid}/notifications`, notificationId);
        deleteDocumentNonBlocking(notifRef);
    }
    
    const renderNotificationContent = (notification: Notification) => (
        <div className="flex items-start gap-3 w-full">
            {!notification.isRead && <div className="mt-1 h-2 w-2 rounded-full bg-primary" />}
            <div className={cn("flex-grow space-y-1", notification.isRead ? "" : "pl-0")}>
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt.seconds * 1000), { addSuffix: true })}
                </p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDelete(notification.id);
                }}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications && notifications.length > 0 ? (
                        notifications.map(notification => (
                            <DropdownMenuItem 
                                key={notification.id} 
                                className="p-2 cursor-pointer focus:bg-accent/80" 
                                asChild
                                onSelect={() => handleMarkAsRead(notification.id)}
                            >
                                {notification.link ? (
                                    <Link href={notification.link} className="w-full">
                                        {renderNotificationContent(notification)}
                                    </Link>
                                ) : (
                                    <div className="w-full">
                                        {renderNotificationContent(notification)}
                                    </div>
                                )}
                            </DropdownMenuItem>
                        ))
                    ) : (
                         <div className="p-4 text-center text-sm text-muted-foreground">You have no notifications.</div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
