
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import type { Tenant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const newTenantSchema = z.object({
  name: z.string().min(3, { message: "Tenant name must be at least 3 characters long." }),
});

type NewTenantFormValues = z.infer<typeof newTenantSchema>;

export default function TenantManagementPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const tenantsRef = useMemoFirebase(() => 
        firestore ? collection(firestore, 'tenants') : null, 
        [firestore]
    );
    const { data: tenants, isLoading } = useCollection<Tenant>(tenantsRef);

    const form = useForm<NewTenantFormValues>({
        resolver: zodResolver(newTenantSchema),
        defaultValues: { name: '' },
    });

    const onSubmit = async (data: NewTenantFormValues) => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
            return;
        }

        const newTenantData = {
            name: data.name,
            createdAt: Timestamp.now(),
        };
        
        try {
            const tenantsCollectionRef = collection(firestore, `tenants`);
            await addDocumentNonBlocking(tenantsCollectionRef, newTenantData);
            toast({ title: "Success", description: `Tenant "${data.name}" has been created.` });
            form.reset();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error adding tenant:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not create new tenant." });
        }
    };

  return (
    <>
        <div className="flex justify-end mb-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Tenant
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Tenant</DialogTitle>
                        <DialogDescription>
                            This will create a new business account on the Qordia platform.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tenant Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 'The Daily Grind Cafe'" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Creating...' : 'Create Tenant'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>All Tenants</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Tenant ID</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Loading tenants...
                                </TableCell>
                            </TableRow>
                        ) : tenants && tenants.length > 0 ? (
                            tenants.map((tenant) => (
                                <TableRow 
                                    key={tenant.id}
                                    className="cursor-pointer"
                                    onClick={() => router.push(`/platform/tenants/${tenant.id}`)}
                                >
                                    <TableCell className="font-medium">{tenant.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{tenant.id}</TableCell>
                                    <TableCell>{format(new Date(tenant.createdAt.seconds * 1000), 'PPP')}</TableCell>
                                    <TableCell>
                                        <Badge variant="accent">Active</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No tenants found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </>
  );
}
