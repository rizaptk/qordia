
"use client";

import { useState, useMemo } from 'react';
import type { MenuItem } from '@/lib/types';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { CategoryChips } from '@/components/menu/category-chips';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { getSuggestedItems } from '@/app/actions/suggest-items';
import { useCartStore } from '@/stores/cart-store';
import { SuggestedItems } from '../suggested-items';

interface StyleProps {
    menuItems: MenuItem[] | null;
    categories: {id: string; name: string, displayOrder: number}[] | null;
    onSelectItem: (item: MenuItem) => void;
}

export function DefaultListStyle({ menuItems, categories, onSelectItem }: StyleProps) {
    const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestedItems, setSuggestedItems] = useState<MenuItem[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const { cart } = useCartStore();


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

    // This effect can be part of the style component if suggestions are style-specific
    useMemo(() => {
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

            <div className="space-y-12">
                {activeCategory === 'all' && searchTerm === '' && popularItems.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-bold font-headline mb-6">Popular Items</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {popularItems.map((item, i) => (
                                <MenuItemCard 
                                    key={item.id} 
                                    item={item} 
                                    onSelect={() => onSelectItem(item)} 
                                    className="animate-fade-in-up"
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
                                onSelect={() => onSelectItem(item)}
                                className="animate-fade-in-up"
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
            
            {(menuItems && menuItems.length > 0) && <SuggestedItems items={suggestedItems} onSelectItem={onSelectItem} isLoading={isSuggestionsLoading} />}
        </main>
    );
}
