'use client';

import { useMemo, useState } from 'react';
import type { Order, MenuItem } from '@/lib/types';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Banknote, PlusCircle, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { CategoryChips } from '@/components/menu/category-chips';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { ScrollArea } from '@/components/ui/scroll-area';

type TableBill = {
    tableId: string;
    totalAmount: number;
    orderCount: number;
}

export default function CashierPage() {
    const firestore = useFirestore();
    const { tenant, isLoading: isAuthLoading } = useAuthStore();
    const [activeTab, setActiveTab] = useState('pending-payments');
    const TENANT_ID = tenant?.id;

    // --- Data for Pending Payments Tab ---
    const activeOrdersQuery = useMemoFirebase(() => 
        firestore && TENANT_ID
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`), 
            where('status', 'in', ['Placed', 'In Progress', 'Ready', 'Served'])
          )
        : null, 
        [firestore, TENANT_ID]
    );
    const { data: activeOrders, isLoading: isLoadingOrders } = useCollection<Order>(activeOrdersQuery);

    const openBills = useMemo(() => {
        if (!activeOrders) return [];
        const billsByTable = activeOrders.reduce((acc, order) => {
            if (!acc[order.tableId]) {
                acc[order.tableId] = {
                    tableId: order.tableId,
                    totalAmount: 0,
                    orderCount: 0,
                };
            }
            acc[order.tableId].totalAmount += order.totalAmount || 0;
            acc[order.tableId].orderCount += 1;
            return acc;
        }, {} as Record<string, TableBill>);

        return Object.values(billsByTable).sort((a,b) => a.tableId.localeCompare(b.tableId, undefined, {numeric: true}));
    }, [activeOrders]);

    // --- Data & State for Walk-in Order Tab ---
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');

    const menuItemsRef = useMemoFirebase(() => 
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/menu_items`) : null, 
        [firestore, TENANT_ID]
    );
    const { data: menuItems, isLoading: isLoadingMenu } = useCollection<MenuItem>(menuItemsRef);

    const categoriesRef = useMemoFirebase(() => 
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/menu_categories`) : null, 
        [firestore, TENANT_ID]
    );
    const { data: categories, isLoading: isLoadingCategories } = useCollection<{id: string; name: string, displayOrder: number}>(categoriesRef);
    
    const sortedCategories = useMemo(() => {
        if (!categories) return [];
        return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    }, [categories]);

    const filteredMenuItems = useMemo(() => {
        if (!menuItems) return [];
        return menuItems.filter(item => {
            const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch && item.isAvailable;
        });
    }, [menuItems, activeCategory, searchTerm]);

    const handleSelectItem = (item: MenuItem) => {
        // Placeholder for Task 3: Add to local cart state
        console.log("Selected item:", item.name);
    }
    // --- End of Walk-in Order Logic ---

    const isLoading = isLoadingOrders || isAuthLoading || isLoadingMenu || isLoadingCategories;

    if (isLoading || !TENANT_ID) {
        return <div className="text-center text-muted-foreground py-16">Loading cashier terminal...</div>
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="pending-payments">Pending Payments</TabsTrigger>
                    <TabsTrigger value="walk-in-order">New Walk-in Order</TabsTrigger>
                </TabsList>
                 {activeTab === 'pending-payments' && (
                    <Button onClick={() => setActiveTab('walk-in-order')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Walk-in Order
                    </Button>
                )}
            </div>

            <TabsContent value="pending-payments">
                {openBills.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {openBills.map(bill => (
                            <Card key={bill.tableId}>
                                <CardHeader>
                                    <CardTitle>Table {bill.tableId}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">${bill.totalAmount.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground">{bill.orderCount} order(s)</p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/staff/cashier/${bill.tableId}`}>View & Settle Bill</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-4 border border-dashed rounded-lg">
                        <Banknote className="w-16 h-16" />
                        <p className="text-lg font-semibold">No open bills right now.</p>
                        <p>Orders from QR code scans will appear here once placed.</p>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="walk-in-order">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Panel (70%) */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search menu..." 
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <CategoryChips 
                                categories={sortedCategories}
                                activeCategory={activeCategory}
                                setActiveCategory={setActiveCategory}
                            />
                        </div>
                        <ScrollArea className="h-[60vh] mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
                                {filteredMenuItems.length > 0 ? filteredMenuItems.map((item) => (
                                    <MenuItemCard 
                                        key={item.id} 
                                        item={item} 
                                        onSelect={() => handleSelectItem(item)}
                                    />
                                )) : (
                                     <div className="col-span-full text-center py-16 text-muted-foreground">
                                        <p>No items found.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Cart Panel (30%) */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-20">
                             <CardHeader>
                                <CardTitle>Cart</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[60vh] flex flex-col items-center justify-center">
                                <p className="text-muted-foreground">Cart panel will be here.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}