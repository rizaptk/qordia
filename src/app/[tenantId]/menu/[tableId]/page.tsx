
"use client";

import { useState, useEffect, useMemo, use } from "react";
import type { MenuItem } from "@/lib/types";
import { getSuggestedItems } from "@/app/actions/suggest-items";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { CustomizationDialog } from "@/components/menu/customization-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Search, Trash2 } from "lucide-react";
import { SuggestedItems } from "@/components/menu/suggested-items";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useCollection, useMemoFirebase, addDocumentNonBlocking, useAuth, useFirestore } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { CategoryChips } from "@/components/menu/category-chips";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { signInAnonymously } from "firebase/auth";

export default function MenuPage({ params }: { params: Promise<{ tenantId: string, tableId: string }> }) {
  const { tenantId, tableId } = use(params);
  const { cart, removeFromCart, clearCart, totalItems, totalPrice } = useCartStore();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState<MenuItem[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [animateCart, setAnimateCart] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useAuthStore();

  useEffect(() => {
    // For customers, if they are not logged in, sign them in anonymously.
    if (auth && !user && !isUserLoading) {
      signInAnonymously(auth);
    }
  }, [auth, user, isUserLoading]);

  const menuItemsRef = useMemoFirebase(() => 
    firestore && tenantId ? collection(firestore, `tenants/${tenantId}/menu_items`) : null, 
    [firestore, tenantId]
  );
  const { data: menuItems, isLoading: isLoadingMenu } = useCollection<MenuItem>(menuItemsRef);

  const categoriesRef = useMemoFirebase(() => 
    firestore && tenantId ? collection(firestore, `tenants/${tenantId}/menu_categories`) : null, 
    [firestore, tenantId]
  );
  const { data: categories, isLoading: isLoadingCategories } = useCollection<{id: string; name: string, displayOrder: number}>(categoriesRef);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [categories]);

  const popularItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter(item => item.isPopular && item.isAvailable);
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchTerm]);

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    removeFromCart(cartItemId);
  };

  const placeOrder = async () => {
    if (!firestore || !user || !tenantId) {
        toast({
            variant: "destructive",
            title: "Cannot place order",
            description: "Authentication is required to place an order.",
        });
        return;
    }
    setIsPlacingOrder(true);
    
    const orderItems = cart.map(item => ({
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
        customizations: item.customizations,
        specialNotes: item.specialNotes
    }));

    const newOrder = {
        customerId: user.uid,
        tableId: tableId,
        status: 'Placed' as const,
        totalAmount: cartTotal,
        orderedAt: Timestamp.now(),
        items: orderItems,
    };
    
    try {
        const ordersRef = collection(firestore, `tenants/${tenantId}/orders`);
        const docRef = await addDocumentNonBlocking(ordersRef, newOrder);
        
        if (docRef?.id) {
            toast({
                title: "Order Placed!",
                description: "Your order has been sent to the kitchen.",
            });
            clearCart();
            router.push(`/${tenantId}/order/${docRef.id}`);
        }
    } catch(e) {
        // Error is handled globally
    } finally {
        setIsPlacingOrder(false);
    }
  };

  const cartTotal = totalPrice();
  const cartItemCount = totalItems();

  useEffect(() => {
    const previousTotal = totalItems();
    return useCartStore.subscribe(
      (state) => {
        if (state.cart.reduce((acc, item) => acc + item.quantity, 0) > previousTotal) {
            setAnimateCart(true);
            setTimeout(() => setAnimateCart(false), 400);
        }
      }
    );
  }, []);

  useEffect(() => {
    if (cart.length > 0 && menuItems && menuItems.length > 0) {
      setIsSuggestionsLoading(true);
      const fetchSuggestions = async () => {
        const cartItemIds = cart.map(item => item.menuItem.id);
        try {
          const suggestions = await getSuggestedItems(cartItemIds, menuItems);
          const availableSuggestions = suggestions.filter(suggestion => menuItems.some(item => item.id === suggestion.id && item.isAvailable));
          setSuggestedItems(availableSuggestions);
        } finally {
          setIsSuggestionsLoading(false);
        }
      };
      const timer = setTimeout(fetchSuggestions, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestedItems([]);
    }
  }, [cart, menuItems]);

  return (
    <Sheet>
        <div className="min-h-screen bg-muted/30">
            <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="font-semibold">Table {tableId}</div>
                    
                    {(cart?.length ?? 0) > 0 && (
                        <SheetTrigger asChild>
                            <Button variant="outline" className="relative">
                                <ShoppingCart className="h-5 w-5" />
                                <span className="ml-2 hidden sm:inline">View Order</span>
                                {cartItemCount > 0 && (
                                    <span 
                                        className={cn(
                                            "absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center",
                                            animateCart && "animate-bounce"
                                        )}
                                    >
                                        {cartItemCount}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                    )}
                </div>
            </header>

          <main className="container mx-auto p-4 md:p-8">
            <div className="mb-8 space-y-6">
                <h1 className="text-4xl font-extrabold font-headline tracking-tight">Our Menu</h1>
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

            {isLoadingMenu || isLoadingCategories || isUserLoading ? (
              <div className="text-center p-16">Loading menu...</div>
            ) : (
              <div className="space-y-12">
                 {activeCategory === 'all' && searchTerm === '' && popularItems.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-bold font-headline mb-6">Popular Items</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {popularItems.map((item, i) => (
                                <MenuItemCard 
                                    key={item.id} 
                                    item={item} 
                                    onSelect={() => handleSelectItem(item)} 
                                    style={{ animationDelay: `${i * 50}ms`}}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    {searchTerm === '' && (
                        <h2 className="text-3xl font-bold font-headline mb-6">
                            {activeCategory === 'all' 
                                ? popularItems.length > 0 ? 'All Items' : ''
                                : categories?.find(c => c.id === activeCategory)?.name
                            }
                        </h2>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMenuItems.map((item, i) => (
                            <MenuItemCard 
                                key={item.id} 
                                item={item} 
                                onSelect={() => handleSelectItem(item)}
                                style={{ animationDelay: `${i * 50}ms`}}
                            />
                        ))}
                    </div>
                    {filteredMenuItems.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>No items found.</p>
                            {searchTerm !== '' && <p>Try adjusting your search.</p>}
                        </div>
                    )}
                </section>
              </div>
            )}

            { (menuItems && menuItems.length > 0) && <SuggestedItems items={suggestedItems} onSelectItem={handleSelectItem} isLoading={isSuggestionsLoading} /> }
          </main>
          
          <CustomizationDialog
            item={selectedItem}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-headline">Your Order</SheetTitle>
          </SheetHeader>
          <Separator />
          {cart.length > 0 ? (
            <>
                <ScrollArea className="flex-grow -mx-6 px-6">
                    <div className="space-y-4 py-4">
                    {cart.map(cartItem => (
                        <div key={cartItem.id} className="flex justify-between items-start gap-4">
                        <div className="flex-grow">
                            <p className="font-semibold">{cartItem.quantity}x {cartItem.menuItem.name}</p>
                            <div className="text-sm text-muted-foreground">
                            {Object.entries(cartItem.customizations).map(([key, value]) => (
                                <p key={key}>- {value}</p>
                            ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold">${cartItem.price.toFixed(2)}</p>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleRemoveFromCart(cartItem.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
                <Separator />
                <SheetFooter className="mt-auto">
                    <div className="w-full space-y-4">
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button size="lg" className="w-full" onClick={placeOrder} disabled={isPlacingOrder || isUserLoading}>
                            {isPlacingOrder ? "Placing Order..." : "Place Order"}
                        </Button>
                    </div>
                </SheetFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-grow text-center">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="font-semibold text-lg">Your order is empty</p>
                <p className="text-muted-foreground">Select items from the menu to get started.</p>
            </div>
          )}
        </SheetContent>
    </Sheet>
  );
}

    