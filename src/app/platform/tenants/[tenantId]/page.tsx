
'use client';

import { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import type { Tenant, UserProfile, SubscriptionPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

const tenantFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  planId: z.string().optional(),
  subscriptionStatus: z.enum(['active', 'trialing', 'overdue', 'canceled']).optional(),
  nextBillingDate: z.date().optional(),
  priceOverride: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

export default function TenantDetailPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params);
  const firestore = useFirestore();
  const { toast } = useToast();

  const tenantRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'tenants', tenantId) : null,
    [firestore, tenantId]
  );
  const { data: tenant, isLoading: isLoadingTenant } = useDoc<Tenant>(tenantRef);

  const usersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users'), where('tenantId', '==', tenantId)) : null,
    [firestore, tenantId]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const plansRef = useMemoFirebase(() =>
    firestore ? collection(firestore, 'subscription_plans') : null,
    [firestore]
  );
  const { data: plans, isLoading: isLoadingPlans } = useCollection<SubscriptionPlan>(plansRef);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (tenant) {
      form.reset({
        name: tenant.name,
        planId: tenant.planId || '',
        subscriptionStatus: tenant.subscriptionStatus,
        nextBillingDate: tenant.nextBillingDate ? new Date(tenant.nextBillingDate.seconds * 1000) : undefined,
        priceOverride: tenant.priceOverride ?? '',
        notes: tenant.notes || '',
      });
    }
  }, [tenant, form]);

  const onUpdateTenant = (data: TenantFormValues) => {
    if (!firestore || !tenant) return;

    const updateData: any = {
        name: data.name,
        planId: data.planId || null,
        subscriptionStatus: data.subscriptionStatus || null,
        nextBillingDate: data.nextBillingDate ? Timestamp.fromDate(data.nextBillingDate) : null,
        priceOverride: data.priceOverride || null,
        notes: data.notes || '',
    }

    const tenantDocRef = doc(firestore, 'tenants', tenant.id);
    updateDocumentNonBlocking(tenantDocRef, updateData);
    toast({ title: 'Success', description: 'Tenant details updated.' });
  };
  
  const handleCancelSubscription = () => {
    if (!firestore || !tenant) return;
    const tenantDocRef = doc(firestore, 'tenants', tenant.id);
    updateDocumentNonBlocking(tenantDocRef, {
        subscriptionStatus: 'canceled',
    });
    toast({ title: 'Subscription Canceled', description: 'The tenant\'s subscription has been marked as canceled.' });
  };

  const isLoading = isLoadingTenant || isLoadingUsers || isLoadingPlans;

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onUpdateTenant)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
              <CardDescription>Edit tenant subscription details and overrides.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
              ) : tenant ? (
                <div className="space-y-6">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tenant Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField
                        control={form.control}
                        name="planId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Subscription Plan</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {plans?.map(plan => (
                                        <SelectItem key={plan.id} value={plan.id}>{plan.name} (${plan.price}/mo)</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="priceOverride"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price Override ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="e.g. 45.00" {...field} />
                                    </FormControl>
                                    <FormDescription className="text-xs">Leave blank to use plan's default price.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                        control={form.control}
                        name="subscriptionStatus"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Subscription Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue="trialing">
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="trialing">Trialing</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                    <SelectItem value="canceled">Canceled</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="nextBillingDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Next Billing Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date("1900-01-01")}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
              ) : (
                <p className="text-destructive">Tenant not found.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Billing Adjustments & Notes</CardTitle>
                <CardDescription>Record any manual credits, refunds, or other administrative notes here.</CardDescription>
            </CardHeader>
            <CardContent>
                 <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Administrative Notes</FormLabel>
                            <FormControl>
                                <Textarea rows={4} placeholder="e.g., 'Issued $20 credit for downtime on 2024-07-26.'" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save All Changes'}
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      
      <Card>
          <CardHeader>
          <CardTitle>Associated Users</CardTitle>
          <CardDescription>Staff members assigned to this tenant.</CardDescription>
          </CardHeader>
          <CardContent>
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {isLoadingUsers ? (
                  <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">Loading users...</TableCell>
                  </TableRow>
              ) : users && users.length > 0 ? (
                  users.map(user => (
                  <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                      </TableCell>
                  </TableRow>
                  ))
              ) : (
                  <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">No users found for this tenant.</TableCell>
                  </TableRow>
              )}
              </TableBody>
          </Table>
          </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Cancel Subscription
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will immediately set the tenant's subscription status to "canceled". They may lose access to paid features at the end of their billing cycle. This action can be reversed manually.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Nevermind</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription}>Yes, Cancel Subscription</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
