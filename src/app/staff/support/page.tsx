'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

const supportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  priority: z.enum(['normal', 'high', 'urgent']),
  message: z.string().min(20, 'Message must be at least 20 characters.'),
});
type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;

export default function PrioritySupportPage() {
    const { toast } = useToast();

    const form = useForm<SupportTicketFormValues>({
        resolver: zodResolver(supportTicketSchema),
        defaultValues: { subject: '', priority: 'normal', message: '' },
    });

    const onSubmit = (data: SupportTicketFormValues) => {
        // Placeholder for submission logic
        console.log('Support Ticket Submitted:', data);
        toast({
            title: 'Ticket Submitted',
            description: 'Our support team has received your request and will get back to you shortly.',
        });
        form.reset();
    };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Priority Support Request</CardTitle>
                <CardDescription>
                   Submit a ticket and our team will get back to you with priority.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Issue with payment processing" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priority Level</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a priority level" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Describe your issue</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Please provide as much detail as possible..." {...field} rows={8} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            <Send className="mr-2 h-4 w-4" />
                            {form.formState.isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
