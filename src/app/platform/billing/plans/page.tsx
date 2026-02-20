
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { SubscriptionPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { availableFeatures } from '@/lib/features';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

const planSchema = z.object({
  name: z.string().min(3, { message: "Plan name must be at least 3 characters." }),
  price: z.coerce.number().min(0, { message: "Price must be a non-negative number." }),
  tableLimit: z.coerce.number().int().min(0, { message: "Table limit must be 0 or a positive number." }),
  features: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You must select at least one feature.",
  }),
});

type PlanFormValues = z.infer<typeof planSchema>;

export default function PlansPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    const plansRef = useMemoFirebase(() =>
        firestore ? collection(firestore, 'subscription_plans') : null,
        [firestore]
    );
    const { data: plans, isLoading } = useCollection<SubscriptionPlan>(plansRef);

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: { name: '', price: 0, tableLimit: 5, features: [] },
    });

    useEffect(() => {
        if (isDialogOpen && editingPlan) {
            form.reset({
                name: editingPlan.name,
                price: editingPlan.price,
                features: editingPlan.features,
                tableLimit: editingPlan.tableLimit ?? 0,
            });
        } else {
            form.reset({
                name: '',
                price: 0,
                tableLimit: 5,
                features: [],
            });
        }
    }, [isDialogOpen, editingPlan, form]);


    const onSubmit = async (data: PlanFormValues) => {
        if (!firestore) return;

        try {
             if (editingPlan) {
                const planRef = doc(firestore, 'subscription_plans', editingPlan.id);
                updateDocumentNonBlocking(planRef, data);
                toast({ title: "Success", description: `Plan "${data.name}" has been updated.` });
            } else {
                await addDocumentNonBlocking(collection(firestore, 'subscription_plans'), data);
                toast({ title: "Success", description: `Plan "${data.name}" has been created.` });
            }
            closeDialog();
        } catch (error) {
            console.error("Error saving plan:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save plan." });
        }
    };
    
    const handleDelete = (planId: string) => {
        if (!firestore) return;
        const planRef = doc(firestore, 'subscription_plans', planId);
        deleteDocumentNonBlocking(planRef);
        toast({ title: 'Plan Deleted', description: 'The subscription plan has been removed.' });
    };

    const handleAddNew = () => {
        setEditingPlan(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setIsDialogOpen(true);
    };
    
    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingPlan(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/platform/billing">Back to Billing</Link>
                    </Button>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Plan
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 grid grid-cols-1 w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Table Limit</TableHead>
                                <TableHead>Features</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Loading plans...</TableCell>
                                </TableRow>
                            ) : plans && plans.length > 0 ? (
                                plans.map(plan => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="font-medium">{plan.name}</TableCell>
                                        <TableCell>${plan.price.toFixed(2)} / mo</TableCell>
                                        <TableCell>{plan.tableLimit === 0 ? 'Unlimited' : plan.tableLimit}</TableCell>
                                        <TableCell className="max-w-xs truncate">{plan.features.join(', ')}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => handleEdit(plan)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the "{plan.name}" plan. This could affect tenants currently subscribed to this plan.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(plan.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No subscription plans found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Edit' : 'Create a New'} Subscription Plan</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plan Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Pro Plan" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monthly Price (USD)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={form.control}
                                name="tableLimit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Table Limit</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" {...field} />
                                        </FormControl>
                                        <FormDescription>Set the max number of tables. Use 0 for unlimited.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="features"
                                render={() => (
                                    <FormItem>
                                    <div className="mb-4">
                                        <FormLabel>Features</FormLabel>
                                        <FormDescription>
                                        Select the features to include in this plan.
                                        </FormDescription>
                                    </div>
                                    <div className="space-y-2">
                                        {availableFeatures.map((feature) => (
                                            <FormField
                                            key={feature.id}
                                            control={form.control}
                                            name="features"
                                            render={({ field }) => {
                                                return (
                                                <FormItem
                                                    key={feature.id}
                                                    className="flex flex-row items-center space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(feature.id)}
                                                        onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), feature.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                (value) => value !== feature.id
                                                                )
                                                            )
                                                        }}
                                                    />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                    {feature.label}
                                                    </FormLabel>
                                                </FormItem>
                                                )
                                            }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                 <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Saving...' : 'Save Plan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    