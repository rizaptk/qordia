
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
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

const feedbackSchema = z.object({
  feedback: z.string().min(20, "Please provide at least 20 characters of feedback."),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
    const firestore = useFirestore();
    const { user, tenant } = useAuthStore();
    const { toast } = useToast();

    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: { feedback: '' },
    });

    const onSubmit = async (data: FeedbackFormValues) => {
        if (!firestore || !user || !tenant) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not send feedback. User context is missing.' });
            return;
        }

        const newFeedbackTicket = {
            tenantId: tenant.id,
            tenantName: tenant.name,
            submittedByUid: user.uid,
            type: 'feedback' as const,
            subject: 'User Feedback Submission',
            message: data.feedback,
            priority: 'normal' as const,
            status: 'new' as const,
            createdAt: Timestamp.now(),
        };
        
        try {
            const ticketsRef = collection(firestore, 'support_tickets');
            await addDocumentNonBlocking(ticketsRef, newFeedbackTicket);
            toast({
                title: 'Feedback Sent!',
                description: 'Thank you for your feedback. We appreciate your input.',
            });
            form.reset();
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was a problem sending your feedback.' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Feedback Hub</CardTitle>
                            <CardDescription>
                                Have a suggestion or encountered something unexpected? Let us know. Your feedback helps us improve Qordia for everyone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="feedback"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Feedback</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us what you think..."
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
                                {form.formState.isSubmitting ? 'Sending...' : 'Send Feedback'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
