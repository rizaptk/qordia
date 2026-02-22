
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Banknote } from 'lucide-react';

const openShiftSchema = z.object({
    openingFloat: z.coerce.number().min(0, "Opening float must be a non-negative number.").default(0),
});

type OpenShiftFormValues = z.infer<typeof openShiftSchema>;

type OpenShiftFormProps = {
    onShiftStart: (openingFloat: number) => Promise<void>;
};

export function OpenShiftForm({ onShiftStart }: OpenShiftFormProps) {
    const form = useForm<OpenShiftFormValues>({
        resolver: zodResolver(openShiftSchema),
        defaultValues: {
            openingFloat: 0,
        },
    });
    
    const handleSubmit = async (data: OpenShiftFormValues) => {
        await onShiftStart(data.openingFloat);
    };

    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <CardHeader>
                            <CardTitle>Start New Shift</CardTitle>
                            <CardDescription>Enter your starting cash balance to begin your shift.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="openingFloat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Opening Float / Starting Cash</FormLabel>
                                        <div className="relative">
                                            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="0.00" className="pl-10" {...field} />
                                            </FormControl>
                                        </div>
                                        <FormDescription>The amount of cash in your register at the beginning of the shift.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Starting...' : 'Start Shift'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
