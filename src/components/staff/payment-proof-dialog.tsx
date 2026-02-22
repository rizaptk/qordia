
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { collection, doc, Timestamp } from 'firebase/firestore';
import type { SubscriptionPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Info } from 'lucide-react';

const paymentProofSchema = z.object({
  message: z.string().optional(),
  attachmentUrl: z.string().url({ message: "Please enter a valid URL." }),
});

type PaymentProofFormValues = z.infer<typeof paymentProofSchema>;

type PaymentProofDialogProps = {
  plan: SubscriptionPlan | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PaymentProofDialog({ plan, isOpen, onOpenChange }: PaymentProofDialogProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user, tenant } = useAuthStore();
    const TENANT_ID = tenant?.id;

    const form = useForm<PaymentProofFormValues>({
        resolver: zodResolver(paymentProofSchema),
        defaultValues: { message: '', attachmentUrl: '' },
    });
    
    const onSubmit = async (data: PaymentProofFormValues) => {
        if (!firestore || !user || !TENANT_ID || !plan) {
            toast({ variant: 'destructive', title: 'Error', description: 'Missing required information to submit payment proof.' });
            return;
        }

        const ticketData = {
            tenantId: TENANT_ID,
            tenantName: tenant.name,
            submittedByUid: user.uid,
            type: 'payment' as const,
            subject: `Payment for ${plan.name} Plan`,
            message: data.message || `Payment proof for subscription to ${plan.name}.`,
            priority: 'high' as const,
            status: 'new' as const,
            createdAt: Timestamp.now(),
            attachmentUrl: data.attachmentUrl,
            paymentDetails: {
                planId: plan.id,
                planName: plan.name,
            },
        };

        try {
            const ticketsRef = collection(firestore, 'support_tickets');
            await addDocumentNonBlocking(ticketsRef, ticketData);
            
            const tenantRef = doc(firestore, 'tenants', TENANT_ID);
            updateDocumentNonBlocking(tenantRef, { subscriptionStatus: 'pending_payment' });

            toast({
                title: "Payment Proof Submitted",
                description: "Your payment is being verified. Your subscription will be activated shortly.",
            });
            onOpenChange(false);
            form.reset();

        } catch (error) {
            console.error("Error submitting payment proof:", error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit your payment proof. Please try again.' });
        }
    };

    if (!plan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Subscription: {plan.name}</DialogTitle>
                    <DialogDescription>To activate your subscription, please complete the payment and upload proof.</DialogDescription>
                </DialogHeader>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                        Please transfer <span className="font-bold">${plan.price.toFixed(2)}</span> to our bank account and upload a screenshot or document of the transaction receipt below.
                    </AlertDescription>
                </Alert>

                <Form {...form}>
                    <form id="payment-proof-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="attachmentUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proof of Payment (URL)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://your-image-host.com/receipt.png" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Please upload your receipt to an image hosting service (like imgur.com) and paste the direct URL here.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Optional Message</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Add any relevant details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" form="payment-proof-form" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

