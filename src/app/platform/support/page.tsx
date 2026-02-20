'use client';

import { useMemo, useState, DragEvent } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import type { SupportTicket } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type Status = 'new' | 'in-progress' | 'resolved';

const TICKET_STATUSES: Status[] = ['new', 'in-progress', 'resolved'];

const statusLabels: Record<Status, string> = {
    new: 'New Tickets',
    'in-progress': 'In Progress',
    resolved: 'Resolved'
};

const priorityStyles: Record<SupportTicket['priority'], string> = {
    normal: 'bg-blue-500/20 text-blue-700 border-blue-500/50',
    high: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50',
    urgent: 'bg-red-500/20 text-red-700 border-red-500/50',
};


function TicketCard({ ticket }: { ticket: SupportTicket }) {
    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('ticketId', ticket.id);
    };

    return (
        <Card 
            draggable 
            onDragStart={handleDragStart}
            className="mb-4 cursor-grab active:cursor-grabbing"
        >
            <CardHeader className='pb-2'>
                <div className='flex justify-between items-start'>
                    <CardTitle className="text-base">{ticket.subject}</CardTitle>
                    <Badge variant="outline" className={cn('capitalize', priorityStyles[ticket.priority])}>{ticket.priority}</Badge>
                </div>
                <p className='text-xs text-muted-foreground font-mono'>{ticket.tenantName}</p>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{ticket.message}</p>
                <p className="text-xs text-muted-foreground mt-4">
                    {formatDistanceToNow(new Date(ticket.createdAt.seconds * 1000), { addSuffix: true })}
                </p>
            </CardContent>
        </Card>
    );
}

function StatusColumn({ 
    status, 
    tickets,
    onDrop,
}: { 
    status: Status, 
    tickets: SupportTicket[],
    onDrop: (status: Status, ticketId: string) => void,
}) {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const ticketId = e.dataTransfer.getData('ticketId');
        if (ticketId) {
            onDrop(status, ticketId);
        }
        setIsOver(false);
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "flex-1 bg-muted/50 rounded-lg p-4 transition-colors",
                isOver && "bg-primary/10"
            )}
        >
            <h2 className="text-lg font-semibold mb-4 capitalize">{statusLabels[status]} ({tickets.length})</h2>
            <div className="space-y-4">
                {tickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                ))}
                {tickets.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">No tickets here.</div>
                )}
            </div>
        </div>
    );
}


export default function SupportPage() {
    const firestore = useFirestore();
    
    const ticketsRef = useMemoFirebase(() => 
        firestore ? collection(firestore, 'support_tickets') : null,
        [firestore]
    );
    const { data: allTickets, isLoading } = useCollection<SupportTicket>(ticketsRef);

    const ticketsByStatus = useMemo(() => {
        const grouped: Record<Status, SupportTicket[]> = {
            new: [],
            'in-progress': [],
            resolved: []
        };
        allTickets?.forEach(ticket => {
            if (grouped[ticket.status]) {
                grouped[ticket.status].push(ticket);
            }
        });
        // Sort tickets within each status group
        Object.values(grouped).forEach(group => {
            group.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        });
        return grouped;
    }, [allTickets]);

    const handleTicketDrop = (newStatus: Status, ticketId: string) => {
        if (!firestore) return;
        const ticketRef = doc(firestore, 'support_tickets', ticketId);
        
        const updateData: { status: Status, resolvedAt?: Timestamp } = { status: newStatus };
        if (newStatus === 'resolved') {
            updateData.resolvedAt = Timestamp.now();
        }
        
        updateDocumentNonBlocking(ticketRef, updateData);
    };

    if (isLoading) {
        return <div className="text-center text-muted-foreground p-8">Loading support tickets...</div>;
    }

    return (
        <div className="flex flex-col h-full">
             <div className="mb-6">
                <h1 className="text-3xl font-bold">Support Ticket Board</h1>
                <p className="text-muted-foreground">Manage and resolve support requests from tenants.</p>
            </div>
            <div className="flex-grow flex gap-6">
                {TICKET_STATUSES.map(status => (
                    <StatusColumn 
                        key={status}
                        status={status}
                        tickets={ticketsByStatus[status]}
                        onDrop={handleTicketDrop}
                    />
                ))}
            </div>
        </div>
    );
}
