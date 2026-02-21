

"use client";

import { useState } from 'react';
import type { MenuItem, MenuCategory, ModifierGroup } from '@/lib/types';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MenuItemFormDialog } from '@/components/staff/menu-item-form-dialog';
import { CategoryFormDialog } from '@/components/staff/category-form-dialog';
import { ModifierGroupFormDialog } from '@/components/staff/modifier-group-form-dialog';
import { updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from '@/stores/auth-store';

export default function MenuManagementPage() {
    const firestore = useFirestore();
    const { tenant } = useAuthStore();
    const TENANT_ID = tenant?.id;

    const [isItemFormOpen, setIsItemFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
    const [isModifierGroupFormOpen, setIsModifierGroupFormOpen] = useState(false);
    const [editingModifierGroup, setEditingModifierGroup] = useState<ModifierGroup | null>(null);

    const menuItemsRef = useMemoFirebase(() => 
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/menu_items`) : null, 
        [firestore, TENANT_ID]
    );
    const { data: menuItems, isLoading: isLoadingMenu } = useCollection<MenuItem>(menuItemsRef);

    const categoriesRef = useMemoFirebase(() => 
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/menu_categories`) : null, 
        [firestore, TENANT_ID]
    );
    const { data: categories, isLoading: isLoadingCategories } = useCollection<MenuCategory>(categoriesRef);

    const modifierGroupsRef = useMemoFirebase(() => 
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/modifier_groups`) : null, 
        [firestore, TENANT_ID]
    );
    const { data: modifierGroups, isLoading: isLoadingModifierGroups } = useCollection<ModifierGroup>(modifierGroupsRef);


    const categoryMap = new Map(categories?.map(c => [c.id, c.name]));
    
    const handleAddNewItem = () => {
        setEditingItem(null);
        setIsItemFormOpen(true);
    };

    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setIsItemFormOpen(true);
    };

    const handleToggleAvailability = (item: MenuItem) => {
        if (!firestore || !TENANT_ID) return;
        const itemRef = doc(firestore, `tenants/${TENANT_ID}/menu_items`, item.id);
        updateDocumentNonBlocking(itemRef, { isAvailable: !item.isAvailable });
    };

    const handleAddNewCategory = () => {
        setEditingCategory(null);
        setIsCategoryFormOpen(true);
    };

    const handleEditCategory = (category: MenuCategory) => {
        setEditingCategory(category);
        setIsCategoryFormOpen(true);
    };

    const handleAddNewModifierGroup = () => {
        setEditingModifierGroup(null);
        setIsModifierGroupFormOpen(true);
    };

    const handleEditModifierGroup = (group: ModifierGroup) => {
        setEditingModifierGroup(group);
        setIsModifierGroupFormOpen(true);
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Menu Management</h1>
                    <p className="text-muted-foreground">Organize your products, categories, and modifiers.</p>
                </div>
            </div>
            <Tabs defaultValue="products">
                <TabsList>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>All Products</CardTitle>
                                <CardDescription>Manage all the items available on your menu.</CardDescription>
                            </div>
                             <Button onClick={handleAddNewItem}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
                            </Button>
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
                                                    <Badge variant={item.isAvailable ? 'accent' : 'destructive'}>
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
                                                            <DropdownMenuItem onClick={() => handleEditItem(item)}>Edit</DropdownMenuItem>
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
                </TabsContent>
                <TabsContent value="categories">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Categories</CardTitle>
                                <CardDescription>Group your menu items for better organization.</CardDescription>
                            </div>
                             <Button variant="outline" onClick={handleAddNewCategory}><PlusCircle className="mr-2 h-4 w-4"/>Add Category</Button>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Category Name</TableHead>
                                        <TableHead>Display Order</TableHead>
                                        <TableHead>
                                            <span className="sr-only">Actions</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                     {isLoadingCategories ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">Loading categories...</TableCell>
                                        </TableRow>
                                    ) : categories && categories.length > 0 ? (
                                        categories.sort((a,b) => a.displayOrder - b.displayOrder).map(category => (
                                            <TableRow key={category.id}>
                                                <TableCell>
                                                     <Badge variant={category.isActive ? 'accent' : 'secondary'}>
                                                        {category.isActive ? 'Active' : 'Hidden'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell>{category.displayOrder}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>Edit</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                         <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">No categories found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="modifiers">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Modifier Groups</CardTitle>
                                <CardDescription>Manage customization options like sizes, toppings, and add-ons.</CardDescription>
                            </div>
                             <Button variant="outline" onClick={handleAddNewModifierGroup}><PlusCircle className="mr-2 h-4 w-4"/>Add Modifier Group</Button>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Group Name</TableHead>
                                        <TableHead>Selection Type</TableHead>
                                        <TableHead>Options</TableHead>
                                        <TableHead>
                                            <span className="sr-only">Actions</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingModifierGroups ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">Loading modifier groups...</TableCell>
                                        </TableRow>
                                    ) : modifierGroups && modifierGroups.length > 0 ? (
                                        modifierGroups.map(group => (
                                            <TableRow key={group.id}>
                                                <TableCell className="font-medium">{group.name}</TableCell>
                                                <TableCell className="capitalize">{group.selectionType}</TableCell>
                                                <TableCell>{group.options.length}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditModifierGroup(group)}>Edit</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                No modifier groups found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <MenuItemFormDialog
                isOpen={isItemFormOpen}
                onOpenChange={setIsItemFormOpen}
                itemToEdit={editingItem}
                categories={categories || []}
            />
            <CategoryFormDialog
                isOpen={isCategoryFormOpen}
                onOpenChange={setIsCategoryFormOpen}
                categoryToEdit={editingCategory}
            />
            <ModifierGroupFormDialog
                isOpen={isModifierGroupFormOpen}
                onOpenChange={setIsModifierGroupFormOpen}
                groupToEdit={editingModifierGroup}
            />
        </div>
    );
}
