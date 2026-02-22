
'use client';

import { useMemo, useState, DragEvent } from 'react';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, Timestamp, writeBatch } from 'firebase/firestore';
import type { SupportTicket } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Banknote, LifeBuoy, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TicketDetailDialog } from '@/components/platform/ticket-detail-dialog';

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


function TicketCard({ ticket, onSelect }: { ticket: SupportTicket; onSelect: () => void; }) {
    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('ticketId', ticket.id);
    };
    
    const isPaymentTicket = ticket.type === 'payment';
    const isFeedbackTicket = ticket.type === 'feedback';

    const Icon = isPaymentTicket ? Banknote : isFeedbackTicket ? MessageSquare : LifeBuoy;
    const iconColor = isPaymentTicket ? 'text-green-600' : isFeedbackTicket ? 'text-purple-600' : 'text-blue-600';


    return (
        <Card 
            draggable 
            onDragStart={handleDragStart}
            onClick={onSelect}
            className="mb-4 cursor-pointer active:cursor-grabbing hover:bg-muted/80 transition-colors"
        >
            <CardHeader className='pb-2'>
                <div className='flex justify-between items-start'>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Icon className={cn("h-5 w-5", iconColor)} />
                        {ticket.subject}
                    </CardTitle>
                    <Badge variant="outline" className={cn('capitalize', priorityStyles[ticket.priority])}>{ticket.priority}</Badge>
                </div>
                <p className='text-xs text-muted-foreground font-mono'>{ticket.tenantName}</p>
            </CardHeader>
            <CardContent>
                {isPaymentTicket && ticket.paymentDetails && (
                    <div className="mb-2 p-2 bg-muted rounded-md">
                        <p className="text-sm font-semibold">Payment for: {ticket.paymentDetails.planName}</p>
                        {ticket.attachmentUrl && (
                             <a href={ticket.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">View Attachment</a>
                        )}
                    </div>
                )}
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
    onTicketSelect,
}: { 
    status: Status, 
    tickets: SupportTicket[],
    onDrop: (status: Status, ticketId: string) => void,
    onTicketSelect: (ticket: SupportTicket) => void;
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
                    <TicketCard key={ticket.id} ticket={ticket} onSelect={() => onTicketSelect(ticket)} />
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
    const { toast } = useToast();
    const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(null);
    
    const ticketsRef = useMemoFirebase(() => 
        firestore ? collection(firestore, 'support_tickets') : null,
        [firestore]
    );
    const { data: allTickets, isLoading } = useCollection<SupportTicket>(ticketsRef);
    
    const priorityOrder: Record<SupportTicket['priority'], number> = {
        urgent: 1,
        high: 2,
        normal: 3,
    };

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
        // Sort tickets within each status group by priority then by creation date
        Object.values(grouped).forEach(group => {
            group.sort((a, b) => {
                const priorityDiff = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
                if (priorityDiff !== 0) return priorityDiff;
                return b.createdAt.seconds - a.createdAt.seconds;
            });
        });
        return grouped;
    }, [allTickets, priorityOrder]);

    const updateTicketStatus = async (ticket: SupportTicket, newStatus: Status) => {
        if (!firestore) return;
    
        const batch = writeBatch(firestore);
        const ticketRef = doc(firestore, 'support_tickets', ticket.id);
    
        const updateData: any = { status: newStatus };
        if (newStatus === 'resolved') {
          updateData.resolvedAt = Timestamp.now();
        }
        batch.update(ticketRef, updateData);
    
        if (newStatus === 'resolved' && ticket.type === 'payment' && ticket.paymentDetails) {
            const tenantRef = doc(firestore, 'tenants', ticket.tenantId);
            const nextBillingDate = new Date();
            nextBillingDate.setDate(nextBillingDate.getDate() + 30);
    
            batch.update(tenantRef, {
                subscriptionStatus: 'active',
                planId: ticket.paymentDetails.planId,
                nextBillingDate: Timestamp.fromDate(nextBillingDate),
                hasUsedTrial: true,
            });
            
            toast({
                title: 'Subscription Activated!',
                description: `${ticket.tenantName}'s plan has been successfully activated.`
            });
        }
    
        try {
            await batch.commit();

            if (newStatus === 'resolved' && ticket.type !== 'feedback') {
                const managerNotification = {
                    userId: ticket.submittedByUid,
                    title: `Ticket Resolved: "${ticket.subject}"`,
                    message: `Your support ticket has been marked as resolved by an administrator.`,
                    type: 'ticket' as const,
                    isRead: false,
                    link: `/staff/support`,
                    createdAt: Timestamp.now(),
                };
                const notificationsRef = collection(firestore, 'users', ticket.submittedByUid, 'notifications');
                addDocumentNonBlocking(notificationsRef, managerNotification);
            }
            setViewingTicket(null); // Close dialog on successful update
        } catch (error) {
            console.error("Error updating ticket status:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update the ticket status."
            });
        }
    };

    const handleTicketDrop = (newStatus: Status, ticketId: string) => {
        const ticket = allTickets?.find(t => t.id === ticketId);
        if (ticket) {
            updateTicketStatus(ticket, newStatus);
        }
    };


    if (isLoading) {
        return <div className="text-center text-muted-foreground p-8">Loading support tickets...</div>;
    }

    return (
        <>
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
                            onTicketSelect={setViewingTicket}
                        />
                    ))}
                </div>
            </div>
            <TicketDetailDialog 
                ticket={viewingTicket}
                isOpen={!!viewingTicket}
                onOpenChange={() => setViewingTicket(null)}
                onUpdateStatus={updateTicketStatus}
            />
        </>
    );
}
