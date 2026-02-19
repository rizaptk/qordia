"use client";

import { useState } from 'react';
import type { MenuItem } from '@/lib/types';
import { useCollection, useMemoFirebase, useFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MenuItemFormDialog } from '@/components/staff/menu-item-form-dialog';
import { Switch } from '@/components/ui/switch';
import { updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const TENANT_ID = 'qordiapro-tenant';

export default function MenuManagementPage() {
    const { firestore } = useFirebase();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const menuItemsRef = useMemoFirebase(() => 
        firestore ? collection(firestore, `tenants/${TENANT_ID}/menu_items`) : null, 
        [firestore]
    );
    const { data: menuItems, isLoading: isLoadingMenu } = useCollection<MenuItem>(menuItemsRef);

    const categoriesRef = useMemoFirebase(() => 
        firestore ? collection(firestore, `tenants/${TENANT_ID}/menu_categories`) : null, 
        [firestore]
    );
    const { data: categories, isLoading: isLoadingCategories } = useCollection<{id: string, name: string}>(categoriesRef);

    const categoryMap = new Map(categories?.map(c => [c.id, c.name]));
    
    const handleAddNew = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleToggleAvailability = (item: MenuItem) => {
        if (!firestore) return;
        const itemRef = doc(firestore, `tenants/${TENANT_ID}/menu_items`, item.id);
        updateDocumentNonBlocking(itemRef, { isAvailable: !item.isAvailable });
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight font-headline">Menu Management</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Menu Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingMenu || isLoadingCategories ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">Loading menu items...</TableCell>
                                </TableRow>
                            ) : menuItems && menuItems.length > 0 ? (
                                menuItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Badge variant={item.isAvailable ? 'default' : 'destructive'} className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
                                                {item.isAvailable ? 'Available' : 'Sold Out'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.categoryId ? categoryMap.get(item.categoryId) || 'N/A' : 'N/A'}</TableCell>
                                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(item)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleAvailability(item)}>
                                                        {item.isAvailable ? 'Mark as Sold Out' : 'Mark as Available'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No menu items found. Add one to get started.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <MenuItemFormDialog
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                itemToEdit={editingItem}
                categories={categories || []}
            />
        </>
    );
}
