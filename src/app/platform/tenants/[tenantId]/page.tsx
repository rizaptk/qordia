'use client';

import { use, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirebase, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import type { Tenant, UserProfile, SubscriptionPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const tenantFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  planId: z.string().optional(),
  subscriptionStatus: z.enum(['active', 'trialing', 'overdue', 'canceled']).optional(),
  nextBillingDate: z.date().optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

export default function TenantDetailPage({ params }: { params: { tenantId: string } }) {
  const resolvedParams = use(params);
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const tenantRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'tenants', resolvedParams.tenantId) : null,
    [firestore, resolvedParams.tenantId]
  );
  const { data: tenant, isLoading: isLoadingTenant } = useDoc<Tenant>(tenantRef);

  const usersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users'), where('tenantId', '==', resolvedParams.tenantId)) : null,
    [firestore, resolvedParams.tenantId]
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
      });
    }
  }, [tenant, form]);

  const onSubmit = (data: TenantFormValues) => {
    if (!firestore || !tenant) return;

    const updateData: any = {
        name: data.name,
        planId: data.planId || null,
        subscriptionStatus: data.subscriptionStatus || null,
        nextBillingDate: data.nextBillingDate ? Timestamp.fromDate(data.nextBillingDate) : null,
    }

    const tenantDocRef = doc(firestore, 'tenants', tenant.id);
    updateDocumentNonBlocking(tenantDocRef, updateData);
    toast({ title: 'Success', description: 'Tenant details updated.' });
  };

  const isLoading = isLoadingTenant || isLoadingUsers || isLoadingPlans;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Tenant</CardTitle>
          <CardDescription>Edit tenant details and subscription.</CardDescription>
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                    control={form.control}
                    name="planId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Subscription Plan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    name="subscriptionStatus"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Subscription Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          ) : (
            <p className="text-destructive">Tenant not found.</p>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
