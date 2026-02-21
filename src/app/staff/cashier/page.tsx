
'use client';

import { useMemo, useState } from 'react';
import type { Order, MenuItem, CartItem, OrderItem } from '@/lib/types';
import { useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, Timestamp, doc } from 'firebase/firestore';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Banknote, PlusCircle, Search, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { CategoryChips } from '@/components/menu/category-chips';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomizationDialog } from '@/components/menu/customization-dialog';
import { RefundDialog, type RefundFormValues } from '@/components/staff/refund-dialog';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';


type TableBill = {
    tableId: string;
    totalAmount: number;
    orderCount: number;
}

export default function CashierPage() {
    const firestore = useFirestore();
    const { user, tenant, isLoading: isAuthLoading } = useAuthStore();
    const [activeTab, setActiveTab] = useState('pending-payments');
    const { toast } = useToast();
    const TENANT_ID = tenant?.id;

    // --- Refund Dialog State ---
    const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
    const [orderToRefund, setOrderToRefund] = useState<Order | null>(null);

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
    const [walkInCart, setWalkInCart] = useState<CartItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const walkInTotal = useMemo(() => {
        return walkInCart.reduce((total, item) => total + item.price, 0);
    }, [walkInCart]);

    const handleSelectItem = (item: MenuItem) => {
        if (item.options && Object.keys(item.options).length > 0) {
            setSelectedItem(item);
            setIsDialogOpen(true);
        } else {
            const existingCartItem = walkInCart.find(cartItem => cartItem.menuItem.id === item.id && Object.keys(cartItem.customizations).length === 0);
            if (existingCartItem) {
                incrementQuantity(existingCartItem.id);
            } else {
                const newCartItem: CartItem = {
                    id: `${item.id}-${Date.now()}`,
                    menuItem: item,
                    quantity: 1,
                    customizations: {},
                    specialNotes: '',
                    price: item.price,
                };
                setWalkInCart(prev => [...prev, newCartItem]);
            }
        }
    }

    const handleAddToCartFromDialog = (item: CartItem) => {
        setWalkInCart(prev => [...prev, item]);
    }
    
    const incrementQuantity = (cartItemId: string) => {
        setWalkInCart(prev => prev.map(item => {
            if (item.id === cartItemId) {
                const newQuantity = item.quantity + 1;
                return { ...item, quantity: newQuantity, price: item.menuItem.price * newQuantity };
            }
            return item;
        }));
    }

    const decrementQuantity = (cartItemId: string) => {
        const itemInCart = walkInCart.find(i => i.id === cartItemId);
        if (itemInCart && itemInCart.quantity > 1) {
            setWalkInCart(prev => prev.map(item => {
                if (item.id === cartItemId) {
                    const newQuantity = item.quantity - 1;
                    return { ...item, quantity: newQuantity, price: item.menuItem.price * newQuantity };
                }
                return item;
            }));
        } else {
            removeFromWalkInCart(cartItemId);
        }
    }
    
    const removeFromWalkInCart = (cartItemId: string) => {
        setWalkInCart(prev => prev.filter(item => item.id !== cartItemId));
    }
    
    const handleProceedToPayment = async () => {
        if (!firestore || !TENANT_ID || walkInCart.length === 0) {
            toast({
                variant: "destructive",
                title: "Cannot place order",
                description: "The cart is empty.",
            });
            return;
        }
        setIsSubmitting(true);
        
        const orderItems = walkInCart.map(item => ({
            menuItemId: item.menuItem.id,
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.price,
            customizations: item.customizations,
            specialNotes: item.specialNotes
        }));

        const newOrder: Omit<Order, 'id'> = {
            tableId: 'Takeaway',
            status: 'Placed',
            totalAmount: walkInTotal,
            orderedAt: Timestamp.now(),
            items: orderItems,
            customerId: user?.uid || 'cashier-walk-in',
            total: walkInTotal, // to satisfy the type, totalAmount is preferred
            timestamp: Timestamp.now(), // to satisfy the type, orderedAt is preferred
        };
        
        try {
            const ordersRef = collection(firestore, `tenants/${TENANT_ID}/orders`);
            await addDocumentNonBlocking(ordersRef, newOrder);
            
            toast({
                title: "Walk-in Order Placed!",
                description: "The order has been sent to the kitchen display.",
            });
            
            setWalkInCart([]);
            setActiveTab('pending-payments');

        } catch(e) {
            // Non-blocking update will handle error emission, but we can catch other errors
             console.error("Error placing walk-in order:", e);
             toast({
                 variant: "destructive",
                 title: "Order Failed",
                 description: "There was an error sending the order to the kitchen.",
             });
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- End of Walk-in Order Logic ---

    // --- Data for Paid Tab ---
    const [paidSearchTerm, setPaidSearchTerm] = useState('');
    const completedOrdersQuery = useMemoFirebase(() =>
        firestore && TENANT_ID
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`),
            where('status', '==', 'Completed')
          )
        : null,
        [firestore, TENANT_ID]
    );
    const { data: completedOrders, isLoading: isLoadingCompleted } = useCollection<Order>(completedOrdersQuery);

    const filteredCompletedOrders = useMemo(() => {
        if (!completedOrders) return [];
        return completedOrders.filter(order =>
            order.id.toLowerCase().includes(paidSearchTerm.toLowerCase()) ||
            order.tableId.toLowerCase().includes(paidSearchTerm.toLowerCase())
        ).sort((a, b) => b.orderedAt.seconds - a.orderedAt.seconds);
    }, [completedOrders, paidSearchTerm]);

    // --- Data for Refunded Tab ---
    const refundedOrdersQuery = useMemoFirebase(() =>
        firestore && TENANT_ID
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`),
            where('status', '==', 'Refunded')
          )
        : null,
        [firestore, TENANT_ID]
    );
    const { data: refundedOrders, isLoading: isLoadingRefunded } = useCollection<Order>(refundedOrdersQuery);

    // --- Refund Handlers ---
    const handleOpenRefundDialog = (order: Order) => {
        setOrderToRefund(order);
        setIsRefundDialogOpen(true);
    };

    const handleConfirmRefund = (data: RefundFormValues) => {
        if (!firestore || !orderToRefund || !user || !TENANT_ID) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not process refund. Missing context."
            });
            return;
        }
        
        const refundAmount = data.refundType === 'full' ? orderToRefund.totalAmount : data.refundAmount;

        if (refundAmount === undefined) {
             toast({ variant: "destructive", title: "Error", description: "Refund amount is missing." });
             return;
        }

        const refundDetails = {
            refundAmount: refundAmount,
            reason: data.reason,
            processedAt: Timestamp.now(),
            processedByUid: user.uid,
        };
        
        const orderRef = doc(firestore, `tenants/${TENANT_ID}/orders`, orderToRefund.id);

        updateDocumentNonBlocking(orderRef, {
            status: 'Refunded',
            refundDetails: refundDetails,
        });
        
        toast({
            title: "Refund Processed",
            description: `A refund of $${refundDetails.refundAmount.toFixed(2)} was processed for order ${orderToRefund.id}.`,
        });
        
        setIsRefundDialogOpen(false);
        setOrderToRefund(null);
    };

    const isLoading = isLoadingOrders || isAuthLoading || isLoadingMenu || isLoadingCategories || isLoadingCompleted || isLoadingRefunded;

    if (isLoading || !TENANT_ID) {
        return <div className="text-center text-muted-foreground py-16">Loading cashier terminal...</div>
    }

    return (
        <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="pending-payments">Pending Payments</TabsTrigger>
                        <TabsTrigger value="walk-in-order">New Walk-in Order</TabsTrigger>
                        <TabsTrigger value="paid">Paid</TabsTrigger>
                        <TabsTrigger value="refunded">Refunded</TabsTrigger>
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
                                <CardContent className="h-[60vh] flex flex-col p-0">
                                    {walkInCart.length > 0 ? (
                                        <ScrollArea className="flex-grow px-6">
                                            <div className="space-y-4 py-4">
                                            {walkInCart.map(cartItem => (
                                                <div key={cartItem.id} className="space-y-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-grow">
                                                            <p className="font-semibold">{cartItem.menuItem.name}</p>
                                                            <p className="font-bold text-lg">${cartItem.price.toFixed(2)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 border rounded-md">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => decrementQuantity(cartItem.id)}><Minus className="h-4 w-4" /></Button>
                                                            <span className="w-6 text-center font-medium">{cartItem.quantity}</span>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => incrementQuantity(cartItem.id)}><Plus className="h-4 w-4" /></Button>
                                                        </div>
                                                    </div>
                                                    {Object.keys(cartItem.customizations).length > 0 && (
                                                        <div className="text-sm text-muted-foreground pl-2">
                                                        {Object.entries(cartItem.customizations).map(([key, value]) => (
                                                            <p key={key}>- {value}</p>
                                                        ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            </div>
                                        </ScrollArea>
                                    ) : (
                                        <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground">
                                            <ShoppingCart className="w-12 h-12 mb-4" />
                                            <p className="font-semibold">Cart is empty</p>
                                            <p>Select items from the menu.</p>
                                        </div>
                                    )}
                                </CardContent>
                                {walkInCart.length > 0 && (
                                    <CardFooter className="flex-col items-stretch space-y-4 pt-4 border-t">
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Total</span>
                                            <span>${walkInTotal.toFixed(2)}</span>
                                        </div>
                                        <Button size="lg" onClick={handleProceedToPayment} disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Placing Order...
                                                </>
                                            ) : (
                                                'Proceed to Payment'
                                            )}
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="paid">
                    <Card>
                        <CardHeader>
                            <CardTitle>Paid Orders</CardTitle>
                            <CardDescription>Search for completed orders to process a refund.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search by Order ID or Table ID..."
                                    className="pl-10"
                                    value={paidSearchTerm}
                                    onChange={(e) => setPaidSearchTerm(e.target.value)}
                                />
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingCompleted ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">Loading paid orders...</TableCell>
                                        </TableRow>
                                    ) : filteredCompletedOrders.length > 0 ? (
                                        filteredCompletedOrders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                                <TableCell>{order.tableId}</TableCell>
                                                <TableCell>{format(new Date(order.orderedAt.seconds * 1000), 'PPp')}</TableCell>
                                                <TableCell className="text-right">${(order.totalAmount || 0).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenRefundDialog(order)}>Process Refund</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">No completed orders found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="refunded">
                     <Card>
                        <CardHeader>
                            <CardTitle>Refunded Orders</CardTitle>
                            <CardDescription>A log of all processed refunds.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Refund Date</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingRefunded ? (
                                        <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading refunded orders...</TableCell></TableRow>
                                    ) : refundedOrders && refundedOrders.length > 0 ? (
                                        refundedOrders.sort((a, b) => (b.refundDetails?.processedAt.seconds ?? 0) - (a.refundDetails?.processedAt.seconds ?? 0)).map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                                <TableCell>{order.refundDetails ? format(new Date(order.refundDetails.processedAt.seconds * 1000), 'PPp') : 'N/A'}</TableCell>
                                                <TableCell className="max-w-xs truncate">{order.refundDetails?.reason}</TableCell>
                                                <TableCell className="text-right text-destructive">- ${(order.refundDetails?.refundAmount || 0).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={4} className="h-24 text-center">No refunded orders found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <CustomizationDialog
                item={selectedItem}
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onAddToCart={handleAddToCartFromDialog}
            />
            <RefundDialog
                isOpen={isRefundDialogOpen}
                onOpenChange={setIsRefundDialogOpen}
                order={orderToRefund}
                onConfirm={handleConfirmRefund}
            />
        </>
    );
}
