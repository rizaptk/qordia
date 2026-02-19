"use client";

import type { MenuItem } from "@/lib/types";
import { MenuItemCard } from "./menu-item-card";
import { Sparkles } from "lucide-react";

type SuggestedItemsProps = {
  items: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  isLoading: boolean;
};

export function SuggestedItems({ items, onSelectItem, isLoading }: SuggestedItemsProps) {
  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
          <Sparkles className="text-primary" />
          <span>Just For You...</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-lg border p-4">
              <div className="bg-muted h-32 rounded-md mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
        <Sparkles className="text-primary animate-pulse" />
        <span>You Might Also Like...</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} onSelect={() => onSelectItem(item)} />
        ))}
      </div>
    </div>
  );
}
