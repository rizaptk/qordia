
"use client";

import type { MenuItem } from '@/lib/types';

interface StyleProps {
    menuItems: MenuItem[] | null;
    categories: {id: string; name: string, displayOrder: number}[] | null;
    onSelectItem: (item: MenuItem) => void;
}

export function ThreeDSlideStyle({ menuItems, categories, onSelectItem }: StyleProps) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold">3D Slide-in Menu</h1>
            <p className="text-muted-foreground">This feature is coming soon!</p>
        </div>
    );
}
