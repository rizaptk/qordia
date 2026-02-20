
'use client';

import { useState, useEffect } from 'react';
import { useForm, useForm as useSubForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { collection, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import type { CustomRole, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, MoreHorizontal, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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

const addUserSchema = z.object({
    uid: z.string().min(1, "User ID cannot be empty."),
    role: z.string().min(1, "Please select a role."),
});
type AddUserFormValues = z.infer<typeof addUserSchema>;


export default function StaffManagementPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user, tenant, hasCustomRolesFeature } = useAuthStore();
    
    const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
    const [staff, setStaff] = useState<UserProfile[]>([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);

    const TENANT_ID = tenant?.id;

    const rolesRef = useMemoFirebase(() =>
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/roles`) : null,
        [firestore, TENANT_ID]
    );
    const { data: customRoles, isLoading: isLoadingRoles } = useCollection<CustomRole>(rolesRef);

    useEffect(() => {
        if (!firestore || !tenant?.staffUids || tenant.staffUids.length === 0) {
            setIsLoadingStaff(false);
            setStaff([]);
            return;
        }

        setIsLoadingStaff(true);
        const fetchStaff = async () => {
            try {
                const staffPromises = tenant.staffUids!.map(uid => getDoc(doc(firestore, 'users', uid)));
                const staffDocs = await Promise.all(staffPromises);
                const staffProfiles = staffDocs
                    .filter(docSnap => docSnap.exists())
                    .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as UserProfile));
                setStaff(staffProfiles);
            } catch (err) {
                 console.error("Failed to fetch staff:", err);
                 toast({ variant: "destructive", title: "Error Fetching Staff", description: "Could not load staff profiles." });
            } finally {
                setIsLoadingStaff(false);
            }
        };

        fetchStaff();
    }, [firestore, tenant, toast]);

    const roleForm = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: '', permissions: [] },
    });

     const addUserForm = useSubForm<AddUserFormValues>({
      resolver: zodResolver(addUserSchema),
      defaultValues: { uid: '', role: 'barista' }
    });

    useEffect(() => {
        if (isRoleFormOpen && editingRole) {
            roleForm.reset({ name: editingRole.name, permissions: editingRole.permissions });
        } else {
            roleForm.reset({ name: '', permissions: [] });
        }
    }, [isRoleFormOpen, editingRole, roleForm]);

    const onRoleSubmit = async (data: RoleFormValues) => {
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
            closeRoleForm();
        } catch (error) {
            console.error("Error saving role:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save role." });
        }
    };
    
    const onAddUserSubmit = async (data: AddUserFormValues) => {
      if (!firestore || !TENANT_ID) return;

      const userDocRef = doc(firestore, 'users', data.uid);
      const tenantDocRef = doc(firestore, 'tenants', TENANT_ID);

      try {
        // Update user's profile
        await updateDoc(userDocRef, {
            tenantId: TENANT_ID,
            role: data.role
        });

        // Add user's UID to the tenant's staff list
        await updateDoc(tenantDocRef, {
            staffUids: arrayUnion(data.uid)
        });
        
        // Manually trigger a refresh of staff list
        const newStaffMemberSnap = await getDoc(userDocRef);
        if (newStaffMemberSnap.exists()) {
            const newStaffMember = { id: newStaffMemberSnap.id, ...newStaffMemberSnap.data() } as UserProfile;
            setStaff(currentStaff => [...currentStaff.filter(s => s.id !== newStaffMember.id), newStaffMember]);
        }

        toast({
            title: "User Assigned",
            description: `User has been assigned the ${data.role} role.`
        });
        addUserForm.reset();

      } catch (error) {
        console.error("Error assigning user role:", error);
        toast({
            variant: "destructive",
            title: "Assignment Failed",
            description: "Could not assign role to the user. Check the UID and permissions."
        });
      }
    }

    const handleDeleteRole = (roleId: string) => {
        if (!firestore || !TENANT_ID) return;
        const roleRef = doc(firestore, `tenants/${TENANT_ID}/roles`, roleId);
        deleteDocumentNonBlocking(roleRef);
        toast({ title: 'Role Deleted', description: 'The custom role has been removed.' });
    };

    const handleAddNewRole = () => {
        setEditingRole(null);
        setIsRoleFormOpen(true);
    };

    const handleEditRole = (role: CustomRole) => {
        setEditingRole(role);
        setIsRoleFormOpen(true);
    };
    
    const closeRoleForm = () => {
        setIsRoleFormOpen(false);
        setEditingRole(null);
    }
    
    const builtInRoles = ['manager', 'barista', 'service', 'cashier'];
    const allRoles = [
        ...builtInRoles.map(r => ({id: r, name: r.charAt(0).toUpperCase() + r.slice(1)})),
        ...(customRoles || []).map(r => ({id: r.name, name: r.name}))
    ];

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Assign Role to User</CardTitle>
                      <CardDescription>Assign a role to an existing user via their UID.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Form {...addUserForm}>
                          <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-4">
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
                                                {allRoles.map(role => (
                                                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                                ))}
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
                  </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Custom Roles</CardTitle>
                            <CardDescription>Define custom roles with specific permissions.</CardDescription>
                        </div>
                        {hasCustomRolesFeature && (
                            <Button onClick={handleAddNewRole}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Role
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {hasCustomRolesFeature ? (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingRoles ? (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">Loading roles...</TableCell></TableRow>
                                ) : customRoles && customRoles.length > 0 ? (
                                    customRoles.map(role => (
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
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onSelect={() => handleEditRole(role)}>Edit</DropdownMenuItem>
                                                            <AlertDialogTrigger asChild><DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem></AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the "{role.name}" role.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRole(role.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">No custom roles defined.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>Custom roles are not available on your current plan.</p>
                            <Button variant="link" asChild><a href="/staff/subscription">Upgrade to unlock</a></Button>
                        </div>
                    )}
                </CardContent>
              </Card>
            </div>

            <Separator />
            
            <Card>
                <CardHeader>
                    <CardTitle>Current Staff</CardTitle>
                    <CardDescription>All users assigned to your business.</CardDescription>
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
                            {isLoadingStaff ? (
                                <TableRow><TableCell colSpan={3} className="text-center h-24">Loading staff...</TableCell></TableRow>
                            ) : staff && staff.length > 0 ? (
                                staff.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell><Badge>{user.role}</Badge></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={3} className="text-center h-24">No staff members found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


             <Dialog open={isRoleFormOpen} onOpenChange={closeRoleForm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Edit' : 'Create a New'} Custom Role</DialogTitle>
                    </DialogHeader>
                    <Form {...roleForm}>
                        <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-6">
                            <FormField
                                control={roleForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Shift Supervisor" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={roleForm.control}
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
                                                    control={roleForm.control}
                                                    name="permissions"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(permission.id)}
                                                                    onCheckedChange={(checked) => checked
                                                                        ? field.onChange([...(field.value || []), permission.id])
                                                                        : field.onChange(field.value?.filter((value) => value !== permission.id))
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel>{permission.label}</FormLabel>
                                                                <FormDescription>{permission.description}</FormDescription>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={roleForm.formState.isSubmitting}>{roleForm.formState.isSubmitting ? 'Saving...' : 'Save Role'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
