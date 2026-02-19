
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ComponentProps } from "react";

type Category = { id: string; name: string };

type CategoryChipsProps = {
  categories: Category[];
  activeCategory: string | 'all';
  setActiveCategory: (id: string | 'all') => void;
} & ComponentProps<"div">;

export function CategoryChips({ categories, activeCategory, setActiveCategory, ...props }: CategoryChipsProps) {
  return (
    <div {...props}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-4">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveCategory('all')}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <div className="w-full h-px bg-border -translate-y-4" />
      </ScrollArea>
    </div>
  );
}
