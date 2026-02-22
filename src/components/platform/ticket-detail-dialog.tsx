
'use client';

import type { SupportTicket } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Banknote, LifeBuoy, MessageSquare, ArrowRight, Check } from 'lucide-react';

type TicketDetailDialogProps = {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (ticket: SupportTicket, newStatus: 'in-progress' | 'resolved') => void;
};

const priorityStyles: Record<SupportTicket['priority'], string> = {
    normal: 'bg-blue-500/20 text-blue-700 border-blue-500/50',
    high: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50',
    urgent: 'bg-red-500/20 text-red-700 border-red-500/50',
};

function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="font-semibold">{value}</div>
        </div>
    );
}

export function TicketDetailDialog({ ticket, isOpen, onOpenChange, onUpdateStatus }: TicketDetailDialogProps) {
    if (!ticket) return null;
    
    const isPaymentTicket = ticket.type === 'payment';
    const isFeedbackTicket = ticket.type === 'feedback';

    const Icon = isPaymentTicket ? Banknote : isFeedbackTicket ? MessageSquare : LifeBuoy;
    const iconColor = isPaymentTicket ? 'text-green-600' : isFeedbackTicket ? 'text-purple-600' : 'text-blue-600';


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icon className={cn("h-6 w-6", iconColor)} />
                        {ticket.subject}
                    </DialogTitle>
                    <DialogDescription>
                        Submitted by <span className="font-medium">{ticket.tenantName}</span> on {format(new Date(ticket.createdAt.seconds * 1000), 'PPp')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailRow label="Priority" value={<Badge variant="outline" className={cn('capitalize', priorityStyles[ticket.priority])}>{ticket.priority}</Badge>} />
                        <DetailRow label="Status" value={<Badge variant="secondary" className="capitalize">{ticket.status}</Badge>} />
                         <DetailRow label="Type" value={<Badge variant="outline" className="capitalize">{ticket.type}</Badge>} />
                    </div>
                    
                    <Separator />
                    
                    {isPaymentTicket && ticket.paymentDetails && (
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm font-semibold mb-2">Payment Details</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <DetailRow label="Plan" value={ticket.paymentDetails.planName} />
                                {ticket.attachmentUrl && <DetailRow label="Proof" value={<a href={ticket.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Attachment</a>} />}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <p className="text-sm text-muted-foreground">Message</p>
                        <p className="text-base whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <div className="flex items-center gap-2">
                         {ticket.status !== 'in-progress' && ticket.status !== 'resolved' && (
                            <Button variant="secondary" onClick={() => onUpdateStatus(ticket, 'in-progress')}>
                                <ArrowRight className="mr-2 h-4 w-4" /> Move to In Progress
                            </Button>
                        )}
                        {ticket.status !== 'resolved' && (
                            <Button variant="default" onClick={() => onUpdateStatus(ticket, 'resolved')}>
                                <Check className="mr-2 h-4 w-4" /> Resolve Ticket
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
