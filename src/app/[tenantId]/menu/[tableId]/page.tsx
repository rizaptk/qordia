

"use client";

import { useState, useMemo, use } from "react";
import type { MenuItem, ModifierGroup, Table, CartItem } from "@/lib/types";
import { CustomizationDialog } from "@/components/menu/customization-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2, Loader2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking, useFirestore } from "@/firebase";
import { collection, Timestamp, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

// Import style components
import { DefaultListStyle } from "@/components/menu/styles/default-list-style";
import { CarouselSlidesStyle } from "@/components/menu/styles/carousel-slides-style";
import { ThreeDSlideStyle } from "@/components/menu/styles/3d-slide-style";
import { PromoSlideStyle } from "@/components/menu/styles/promo-slide-style";


export default function MenuPage({ params }: { params: Promise<{ tenantId: string, tableId: string }> }) {
  const { tenantId, tableId } = use(params);
  const { cart, removeFromCart, clearCart, totalItems, totalPrice } = useCartStore();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const firestore = useFirestore();
  const { user, isUserLoading } = useAuthStore();

  // --- Data Fetching ---
  const tableRef = useMemoFirebase(() => 
    firestore ? doc(firestore, `tenants/${tenantId}/tables`, tableId) : null,
    [firestore, tenantId, tableId]
  );
  const { data: tableData, isLoading: isLoadingTable } = useDoc<Table>(tableRef);

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

  const modifierGroupsRef = useMemoFirebase(() =>
    firestore && tenantId ? collection(firestore, `tenants/${tenantId}/modifier_groups`) : null,
    [firestore, tenantId]
  );
  const { data: modifierGroups, isLoading: isLoadingModifierGroups } = useCollection<ModifierGroup>(modifierGroupsRef);

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
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
  
  const renderMenuByStyle = () => {
      const styleProps = {
          menuItems,
          categories,
          onSelectItem: handleSelectItem,
      };

      switch (tableData?.menuStyle) {
          case 'carousel':
              return <CarouselSlidesStyle {...styleProps} />;
          case '3d':
              return <ThreeDSlideStyle {...styleProps} />;
          case 'promo':
              return <PromoSlideStyle {...styleProps} />;
          case 'default':
          default:
              return <DefaultListStyle {...styleProps} />;
      }
  };

  const isLoading = isLoadingTable || isLoadingMenu || isLoadingCategories || isUserLoading || isLoadingModifierGroups;
  const cartTotal = totalPrice();
  const cartItemCount = totalItems();

  return (
    <Sheet>
        <div className="min-h-screen bg-muted/30">
            <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="font-semibold">
                      {isLoadingTable ? '...' : `Table ${tableData?.tableNumber || tableId}`}
                    </div>
                </div>
            </header>

            {isLoading ? (
              <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading menu...</p>
              </div>
            ) : (
              renderMenuByStyle()
            )}
          
          <CustomizationDialog
            item={selectedItem}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            modifierGroups={modifierGroups || []}
          />
        </div>
        
        {cartItemCount > 0 && (
            <SheetTrigger asChild>
                 <Button
                    variant="default"
                    className={cn(
                        "fixed bottom-4 right-4 z-50 h-16 rounded-full px-6 shadow-lg text-lg flex items-center gap-4 animate-fade-in-up",
                         animateCart && "animate-bounce"
                    )}
                    onAnimationEnd={() => setAnimateCart(false)}
                 >
                    <ShoppingCart className="h-6 w-6" />
                    <div className="text-left">
                        <p>{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</p>
                        <p className="font-bold">${cartTotal.toFixed(2)}</p>
                    </div>
                 </Button>
            </SheetTrigger>
        )}

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
                                    {Object.entries(cartItem.customizations).map(([groupName, option]) => (
                                        <p key={groupName}>- {groupName}: {option}</p>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <p className="font-semibold">${cartItem.price.toFixed(2)}</p>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => removeFromCart(cartItem.id)}>
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
                        <Button size="lg" className="w-full" onClick={!user ? () => router.push('/login') : placeOrder} disabled={isPlacingOrder || (isUserLoading && !user)}>
                            {isUserLoading && !user ? 'Authenticating...' : user ? (isPlacingOrder ? 'Placing Order...' : 'Place Order') : 'Sign In to Order'}
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
