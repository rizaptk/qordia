'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/auth-store';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const settingsSchema = z.object({
  name: z.string().min(3, 'Shop name must be at least 3 characters.'),
  shopType: z.enum(['cafe', 'coffee_shop', 'food_court', 'small_restaurant']).optional(),
  logoUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
    const { tenant, isLoading: isAuthLoading } = useAuthStore();
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            name: '',
            shopType: 'cafe',
            logoUrl: '',
        }
    });

    useEffect(() => {
        if (tenant) {
            form.reset({
                name: tenant.name,
                shopType: tenant.shopType || 'cafe',
                logoUrl: tenant.logoUrl || '',
            });
        }
    }, [tenant, form]);
    
    const onSubmit = (data: SettingsFormValues) => {
        if (!firestore || !tenant) return;

        const tenantRef = doc(firestore, 'tenants', tenant.id);
        updateDocumentNonBlocking(tenantRef, data);
        toast({ title: 'Success', description: 'Your shop settings have been updated.' });
    };

    if (isAuthLoading) {
        return (
             <div className="space-y-6 max-w-2xl">
                <Skeleton className="h-10 w-1/3" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold font-headline">Shop Settings</h1>
                <p className="text-muted-foreground">Manage your business details, branding, and appearance.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Details</CardTitle>
                            <CardDescription>This information will be visible to your customers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shop Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Cafe Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="shopType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shop Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a shop type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="cafe">Cafe</SelectItem>
                                                <SelectItem value="coffee_shop">Coffee Shop</SelectItem>
                                                <SelectItem value="food_court">Food Court</SelectItem>
                                                <SelectItem value="small_restaurant">Small Restaurant</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="logoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/logo.png" {...field} />
                                        </FormControl>
                                        <FormDescription>Paste a URL to your business logo.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
