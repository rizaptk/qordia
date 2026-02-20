'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { collection, doc } from 'firebase/firestore';
import type { CustomRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const availablePermissions = [
    { id: 'manage_menu', label: 'Manage Menu', description: 'Can add, edit, and delete menu items.' },
    { id: 'manage_tables', label: 'Manage Tables', description: 'Can add/remove tables and generate QR codes.' },
    { id: 'view_analytics', label: 'View Analytics', description: 'Can view sales and performance dashboards.' },
    { id: 'manage_staff', label: 'Manage Staff', description: 'Can invite and assign roles to staff.' },
];

const roleSchema = z.object({
  name: z.string().min(3, { message: "Role name must be at least 3 characters." }),
  permissions: z.array(z.string()).refine(value => value.length > 0, {
    message: "You must select at least one permission.",
  }),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export default function CustomRolesPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { tenant } = useAuthStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<CustomRole | null>(null);

    const TENANT_ID = tenant?.id;

    const rolesRef = useMemoFirebase(() =>
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/roles`) : null,
        [firestore, TENANT_ID]
    );
    const { data: roles, isLoading } = useCollection<CustomRole>(rolesRef);

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: '', permissions: [] },
    });

    useEffect(() => {
        if (isDialogOpen && editingRole) {
            form.reset({ name: editingRole.name, permissions: editingRole.permissions });
        } else {
            form.reset({ name: '', permissions: [] });
        }
    }, [isDialogOpen, editingRole, form]);

    const onSubmit = async (data: RoleFormValues) => {
        if (!firestore || !TENANT_ID) return;
        
        try {
             if (editingRole) {
                const roleRef = doc(firestore, `tenants/${TENANT_ID}/roles`, editingRole.id);
                updateDocumentNonBlocking(roleRef, data);
                toast({ title: "Success", description: `Role "${data.name}" has been updated.` });
            } else {
                await addDocumentNonBlocking(collection(firestore, `tenants/${TENANT_ID}/roles`), data);
                toast({ title: "Success", description: `Role "${data.name}" has been created.` });
            }
            closeDialog();
        } catch (error) {
            console.error("Error saving role:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save role." });
        }
    };
    
    const handleDelete = (roleId: string) => {
        if (!firestore || !TENANT_ID) return;
        const roleRef = doc(firestore, `tenants/${TENANT_ID}/roles`, roleId);
        deleteDocumentNonBlocking(roleRef);
        toast({ title: 'Role Deleted', description: 'The custom role has been removed.' });
    };

    const handleAddNew = () => {
        setEditingRole(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (role: CustomRole) => {
        setEditingRole(role);
        setIsDialogOpen(true);
    };
    
    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingRole(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Custom Staff Roles</h1>
                    <p className="text-muted-foreground">Create and manage roles with specific permissions for your staff.</p>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Role
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role Name</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">Loading roles...</TableCell>
                                </TableRow>
                            ) : roles && roles.length > 0 ? (
                                roles.map(role => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">{role.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.map(p => <Badge key={p} variant="secondary">{availablePermissions.find(ap => ap.id === p)?.label ?? p}</Badge>)}
                                            </div>
                                        </TableCell>
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
                                                        <DropdownMenuItem onSelect={() => handleEdit(role)}>Edit</DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the "{role.name}" role.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(role.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">No custom roles found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Edit' : 'Create a New'} Role</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Shift Supervisor" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="permissions"
                                render={() => (
                                    <FormItem>
                                    <div className="mb-4">
                                        <FormLabel>Permissions</FormLabel>
                                        <FormDescription>Select the permissions this role will have.</FormDescription>
                                    </div>
                                    <div className="space-y-3">
                                        {availablePermissions.map((permission) => (
                                            <FormField
                                                key={permission.id}
                                                control={form.control}
                                                name="permissions"
                                                render={({ field }) => {
                                                    return (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(permission.id)}
                                                                onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), permission.id])
                                                                    : field.onChange(field.value?.filter((value) => value !== permission.id))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>{permission.label}</FormLabel>
                                                            <FormDescription>{permission.description}</FormDescription>
                                                        </div>
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
                                 <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Saving...' : 'Save Role'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
