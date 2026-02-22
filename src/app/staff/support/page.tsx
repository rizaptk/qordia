
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { collection, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

const supportSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters long."),
  message: z.string().min(20, "Please provide a detailed description of your issue."),
});

type SupportFormValues = z.infer<typeof supportSchema>;

export default function PrioritySupportPage() {
    const firestore = useFirestore();
    const { user, tenant, hasPrioritySupportFeature, hasBasicSupportFeature } = useAuthStore();
    const { toast } = useToast();

    const form = useForm<SupportFormValues>({
        resolver: zodResolver(supportSchema),
        defaultValues: { subject: '', message: '' },
    });

    const canSubmitTicket = hasPrioritySupportFeature || hasBasicSupportFeature;

    const onSubmit = async (data: SupportFormValues) => {
        if (!firestore || !user || !tenant || !canSubmitTicket) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot submit ticket at this time.' });
            return;
        }

        const newTicket = {
            tenantId: tenant.id,
            tenantName: tenant.name,
            submittedByUid: user.uid,
            type: 'support' as const,
            subject: data.subject,
            message: data.message,
            priority: hasPrioritySupportFeature ? 'high' : 'normal' as const,
            status: 'new' as const,
            createdAt: Timestamp.now(),
        };
        
        try {
            const ticketsRef = collection(firestore, 'support_tickets');
            await addDocumentNonBlocking(ticketsRef, newTicket);
            toast({
                title: 'Ticket Submitted',
                description: 'Our support team will get back to you shortly.',
            });
            form.reset();
        } catch (error) {
            console.error("Error submitting support ticket:", error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was a problem submitting your ticket.' });
        }
    };
    
    if (!canSubmitTicket) {
        return (
             <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle>Support Unavailable</CardTitle>
                    <CardDescription>
                        Your current plan does not include access to our support channels.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Please upgrade your subscription to submit support tickets and get help from our team.</p>
                     <Button asChild>
                        <Link href="/staff/subscription">View Plans</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Support</CardTitle>
                            <CardDescription>
                                {hasPrioritySupportFeature
                                    ? "As a Pro subscriber, your ticket will be prioritized."
                                    : "Describe your issue, and our team will get back to you."
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Issue with menu item availability" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>How can we help?</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Please provide as much detail as possible..."
                                                rows={8}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                <Send className="mr-2 h-4 w-4" />
                                {form.formState.isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
