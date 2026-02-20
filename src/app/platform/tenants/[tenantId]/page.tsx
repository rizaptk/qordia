'use client';

import { use, useEffect, useState } from 'react';
import { useForm, useForm as useSubForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
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
import { CalendarIcon, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const tenantFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  planId: z.string().optional(),
  subscriptionStatus: z.enum(['active', 'trialing', 'overdue', 'canceled']).optional(),
  nextBillingDate: z.date().optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

const addUserSchema = z.object({
    uid: z.string().min(1, "User ID cannot be empty."),
    role: z.enum(['manager', 'barista', 'service', 'cashier']),
});
type AddUserFormValues = z.infer<typeof addUserSchema>;


export default function TenantDetailPage({ params }: { params: { tenantId: string } }) {
  const resolvedParams = use(params);
  const firestore = useFirestore();
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

  const addUserForm = useSubForm<AddUserFormValues>({
      resolver: zodResolver(addUserSchema),
      defaultValues: { uid: '', role: 'barista' }
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

  const onUpdateTenant = (data: TenantFormValues) => {
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
  
  const onAddUser = (data: AddUserFormValues) => {
      if (!firestore || !tenant) return;

      const userDocRef = doc(firestore, 'users', data.uid);
      updateDocumentNonBlocking(userDocRef, {
          tenantId: tenant.id,
          role: data.role
      });
      toast({
          title: "User Role Updated",
          description: `User ${data.uid} assigned as ${data.role}. NOTE: Custom claims must be set separately.`
      });
      addUserForm.reset();
  }

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
              <form onSubmit={form.handleSubmit(onUpdateTenant)} className="space-y-6">
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
      
      <div className="grid md:grid-cols-2 gap-6">
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

        <Card>
            <CardHeader>
                <CardTitle>Add Staff Member</CardTitle>
                <CardDescription>Assign an existing user to this tenant by their UID.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...addUserForm}>
                    <form onSubmit={addUserForm.handleSubmit(onAddUser)} className="space-y-4">
                        <FormField
                            control={addUserForm.control}
                            name="uid"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User ID (UID)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter the user's Firebase UID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={addUserForm.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="barista">Barista</SelectItem>
                                            <SelectItem value="service">Service</SelectItem>
                                            <SelectItem value="cashier">Cashier</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={addUserForm.formState.isSubmitting}>
                            <UserPlus className="mr-2 h-4 w-4"/>
                            {addUserForm.formState.isSubmitting ? 'Assigning...' : 'Assign Role'}
                        </Button>
                    </form>
                </Form>
                 <p className="text-xs text-muted-foreground mt-4">
                    Remember: After assigning a role, you must set the corresponding custom claims for the user via a secure server-side script for permissions to apply.
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
