"use client";

import { useState, useEffect, useMemo, use } from "react";
import { menuItems } from "@/lib/data";
import type { MenuItem, CartItem } from "@/lib/types";
import { getSuggestedItems } from "@/app/actions/suggest-items";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { CustomizationDialog } from "@/components/menu/customization-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, UtensilsCrossed, Trash2 } from "lucide-react";
import { SuggestedItems } from "@/components/menu/suggested-items";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const categories: MenuItem['category'][] = ['Coffee', 'Tea', 'Pastries', 'Sandwiches', 'Desserts'];

export default function MenuPage({ params }: { params: { tableId: string } }) {
  const resolvedParams = use(params as any);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [suggestedItems, setSuggestedItems] = useState<MenuItem[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    toast({
        title: "Added to order",
        description: `${item.menuItem.name} has been added to your order.`,
      })
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const placeOrder = () => {
    // In a real app, this would send the cart to the backend and return an order ID
    const orderId = `ORD-${Date.now()}`;
    router.push(`/order/${orderId}`);
  };

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  useEffect(() => {
    if (cart.length > 0) {
      setIsSuggestionsLoading(true);
      const fetchSuggestions = async () => {
        const cartItemIds = cart.map(item => item.menuItem.id);
        try {
          const suggestions = await getSuggestedItems(cartItemIds);
          setSuggestedItems(suggestions);
        } finally {
          setIsSuggestionsLoading(false);
        }
      };
      // Debounce suggestions
      const timer = setTimeout(fetchSuggestions, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestedItems([]);
    }
  }, [cart]);

  return (
    <div className="min-h-screen bg-muted/30">
        <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold font-headline">Qordia</span>
                </Link>
                <div className="font-semibold">Table {resolvedParams.tableId}</div>
            </div>
        </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
            <h1 className="text-4xl font-extrabold font-headline tracking-tight">Our Menu</h1>
            <p className="text-muted-foreground mt-2">Select an item to customize and add to your order.</p>
        </div>

        <div className="space-y-12">
          {categories.map(category => {
            const items = menuItems.filter(item => item.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h2 className="text-3xl font-bold font-headline mb-6">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map(item => (
                    <MenuItemCard key={item.id} item={item} onSelect={() => handleSelectItem(item)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <SuggestedItems items={suggestedItems} onSelectItem={handleSelectItem} isLoading={isSuggestionsLoading} />
      </main>

      <CustomizationDialog
        item={selectedItem}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddToCart={handleAddToCart}
      />

    {cart.length > 0 && (
      <Sheet>
        <SheetTrigger asChild>
            <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 text-lg">
                <ShoppingCart className="h-7 w-7" />
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{cartItemCount}</span>
            </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-headline">Your Order</SheetTitle>
          </SheetHeader>
          <Separator />
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
                <Button size="lg" className="w-full" onClick={placeOrder}>
                    Place Order
                </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )}
    </div>
  );
}
