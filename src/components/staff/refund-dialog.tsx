"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const refundSchema = z.object({
  refundType: z.enum(['full', 'partial']),
  refundAmount: z.coerce.number().optional(),
  reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
}).refine(data => {
    if (data.refundType === 'partial') {
        return data.refundAmount !== undefined && data.refundAmount > 0;
    }
    return true;
}, {
    message: "A partial refund requires a specific amount.",
    path: ['refundAmount'],
});

export type RefundFormValues = z.infer<typeof refundSchema>;

type RefundDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onConfirm: (data: RefundFormValues) => void;
};

export function RefundDialog({ isOpen, onOpenChange, order, onConfirm }: RefundDialogProps) {
  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      refundType: 'full',
      reason: '',
    },
  });

  const refundType = form.watch('refundType');

  useEffect(() => {
    if (order) {
      form.reset({
        refundType: 'full',
        reason: '',
        refundAmount: order.totalAmount,
      });
    }
  }, [order, form]);
  
  useEffect(() => {
    if (refundType === 'full' && order) {
        form.setValue('refundAmount', order.totalAmount);
    }
  }, [refundType, order, form]);


  const handleSubmit = (data: RefundFormValues) => {
    if (data.refundType === 'partial' && (!data.refundAmount || data.refundAmount > (order?.totalAmount || 0))) {
        form.setError('refundAmount', { type: 'manual', message: 'Amount cannot exceed the order total.' });
        return;
    }
    onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          {order && (
            <DialogDescription>
              Order ID: {order.id} | Total: ${order.totalAmount?.toFixed(2)}
            </DialogDescription>
          )}
        </DialogHeader>
        {order ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="refundType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Refund Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="full" />
                          </FormControl>
                          <FormLabel className="font-normal">Full Refund</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="partial" />
                          </FormControl>
                          <FormLabel className="font-normal">Partial Refund</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {refundType === 'partial' && (
                <FormField
                  control={form.control}
                  name="refundAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refund Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Refund</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Customer was unhappy with the item..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Processing...' : 'Confirm Refund'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>No order selected for refund.</AlertDescription>
            </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
