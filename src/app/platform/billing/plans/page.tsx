'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { SubscriptionPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

const availableFeatures = [
  { id: 'Analytics', label: 'Analytics Dashboard' },
  { id: 'Advanced Reporting', label: 'Advanced Reporting' },
  { id: 'Priority Support', label: 'Priority Support' },
  { id: 'API Access', label: 'API Access' },
  { id: 'Menu Customization', label: 'Advanced Menu Customization' },
  { id: 'Staff Roles', label: 'Custom Staff Roles' },
];

const newPlanSchema = z.object({
  name: z.string().min(3, { message: "Plan name must be at least 3 characters." }),
  price: z.coerce.number().min(0, { message: "Price must be a non-negative number." }),
  features: z.array(z.string()).refine(value => value.length > 0, {
    message: "You must select at least one feature.",
  }),
});

type NewPlanFormValues = z.infer<typeof newPlanSchema>;

export default function PlansPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const plansRef = useMemoFirebase(() =>
        firestore ? collection(firestore, 'subscription_plans') : null,
        [firestore]
    );
    const { data: plans, isLoading } = useCollection<SubscriptionPlan>(plansRef);

    const form = useForm<NewPlanFormValues>({
        resolver: zodResolver(newPlanSchema),
        defaultValues: { name: '', price: 0, features: [] },
    });

    const onSubmit = async (data: NewPlanFormValues) => {
        if (!firestore) return;

        const newPlanData = {
            name: data.name,
            price: data.price,
            features: data.features,
        };

        try {
            await addDocumentNonBlocking(collection(firestore, 'subscription_plans'), newPlanData);
            toast({ title: "Success", description: `Plan "${data.name}" has been created.` });
            form.reset();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error creating plan:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not create new plan." });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/platform/billing">Back to Billing</Link>
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create a New Subscription Plan</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                        <Button type="submit" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? 'Creating...' : 'Create Plan'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Features</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">Loading plans...</TableCell>
                                </TableRow>
                            ) : plans && plans.length > 0 ? (
                                plans.map(plan => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="font-medium">{plan.name}</TableCell>
                                        <TableCell>${plan.price.toFixed(2)} / mo</TableCell>
                                        <TableCell>{plan.features.join(', ')}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">No subscription plans found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
