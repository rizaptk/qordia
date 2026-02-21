
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { collection, doc, updateDoc, arrayUnion, getDoc, query, where, Timestamp } from 'firebase/firestore';
import type { CustomRole, UserProfile, TenantInvitation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, MoreHorizontal, UserPlus, Send, Mail } from 'lucide-react';
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

const inviteUserSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
    role: z.string().min(1, "Please select a role."),
});
type InviteUserFormValues = z.infer<typeof inviteUserSchema>;


export default function StaffManagementPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user, tenant, hasCustomRolesFeature, hasCashierRoleFeature, hasServiceRoleFeature } = useAuthStore();
    
    const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
    const [staff, setStaff] = useState<UserProfile[]>([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);

    const TENANT_ID = tenant?.id;

    // --- Data Fetching ---
    const rolesRef = useMemoFirebase(() =>
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/roles`) : null,
        [firestore, TENANT_ID]
    );
    const { data: customRoles, isLoading: isLoadingRoles } = useCollection<CustomRole>(rolesRef);

    const invitationsRef = useMemoFirebase(() => 
        firestore && TENANT_ID && user ? query(collection(firestore, 'invitations'), where('tenantId', '==', TENANT_ID), where('status', '==', 'pending')) : null,
        [firestore, TENANT_ID, user]
    );
    const { data: pendingInvitations, isLoading: isLoadingInvites } = useCollection<TenantInvitation>(invitationsRef);


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

    // --- Forms ---
    const roleForm = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: '', permissions: [] },
    });

     const inviteUserForm = useForm<InviteUserFormValues>({
      resolver: zodResolver(inviteUserSchema),
      defaultValues: { email: '', role: 'barista' }
    });

    useEffect(() => {
        if (isRoleFormOpen && editingRole) {
            roleForm.reset({ name: editingRole.name, permissions: editingRole.permissions });
        } else {
            roleForm.reset({ name: '', permissions: [] });
        }
    }, [isRoleFormOpen, editingRole, roleForm]);


    // --- Role and Permission Computations ---
    const availableBuiltInRoles = useMemo(() => {
        const roles = [{id: 'manager', name: 'Manager'}, {id: 'barista', name: 'Barista'}];
        if(hasServiceRoleFeature) roles.push({id: 'service', name: 'Service'});
        if(hasCashierRoleFeature) roles.push({id: 'cashier', name: 'Cashier'});
        return roles;
    }, [hasServiceRoleFeature, hasCashierRoleFeature]);

    const allRoles = useMemo(() => [
        ...availableBuiltInRoles,
        ...(customRoles || []).map(r => ({id: r.name, name: r.name}))
    ], [availableBuiltInRoles, customRoles]);


    // --- Handlers ---
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
    
    const onInviteUserSubmit = async (data: InviteUserFormValues) => {
        if (!firestore || !TENANT_ID || !tenant?.name) return;

        const newInvitation = {
            tenantId: TENANT_ID,
            tenantName: tenant.name,
            email: data.email.toLowerCase(),
            role: data.role,
            status: 'pending',
            createdAt: Timestamp.now(),
        };

        try {
            await addDocumentNonBlocking(collection(firestore, 'invitations'), newInvitation);
            toast({
                title: "Invitation Sent",
                description: `${data.email} has been invited to join your team.`
            });
            inviteUserForm.reset();
        } catch (error) {
            console.error("Error sending invitation:", error);
            toast({ variant: "destructive", title: "Invitation Failed", description: "Could not send the invitation." });
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

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Invite Staff Member</CardTitle>
                      <CardDescription>Invite a new team member via their email address.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Form {...inviteUserForm}>
                          <form onSubmit={inviteUserForm.handleSubmit(onInviteUserSubmit)} className="space-y-4">
                              <FormField
                                  control={inviteUserForm.control}
                                  name="email"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Staff Email</FormLabel>
                                          <FormControl>
                                              <Input type="email" placeholder="new.employee@example.com" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={inviteUserForm.control}
                                  name="role"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Assign Role</FormLabel>
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
                              <Button type="submit" disabled={inviteUserForm.formState.isSubmitting}>
                                  <Send className="mr-2 h-4 w-4"/>
                                  {inviteUserForm.formState.isSubmitting ? 'Sending Invite...' : 'Send Invite'}
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
            
            <div className="grid md:grid-cols-2 gap-6">
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
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Invitations</CardTitle>
                        <CardDescription>Invitations that have been sent but not yet accepted.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {isLoadingInvites ? (
                                     <TableRow><TableCell colSpan={2} className="text-center h-24">Loading invites...</TableCell></TableRow>
                                ) : pendingInvitations && pendingInvitations.length > 0 ? (
                                    pendingInvitations.map(invite => (
                                        <TableRow key={invite.id}>
                                            <TableCell>{invite.email}</TableCell>
                                            <TableCell><Badge variant="outline">{invite.role}</Badge></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={2} className="text-center h-24">No pending invitations.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>


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
