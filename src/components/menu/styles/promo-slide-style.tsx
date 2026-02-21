"use client";

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, ArrowLeft, ArrowRight } from 'lucide-react';

interface StyleProps {
    menuItems: MenuItem[] | null;
    categories: {id: string; name: string, displayOrder: number}[] | null;
    onSelectItem: (item: MenuItem) => void;
}

export function PromoSlideStyle({ menuItems, onSelectItem }: StyleProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    
    const popularItems = menuItems?.filter(item => item.isPopular && item.isAvailable) || [];

    if (!popularItems || popularItems.length === 0) {
        return (
            <div className="container mx-auto p-4 md:p-8 text-center">
                <h1 className="text-2xl font-bold">No Promotions Today</h1>
                <p className="text-muted-foreground">Check back later for special offers!</p>
            </div>
        );
    }
    
    return (
        <div className="w-full py-8 relative max-w-4xl mx-auto">
             <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                <div className="flex">
                    {popularItems.map((item) => {
                        let imageUrl: string | undefined = item.imageUrl;
                        let imageHint: string | undefined;

                        if (!imageUrl) {
                            const imagePlaceholder = PlaceHolderImages.find(p => p.id === item.image);
                            if (imagePlaceholder) {
                                imageUrl = imagePlaceholder.imageUrl;
                                imageHint = imagePlaceholder.imageHint;
                            }
                        }

                        return (
                             <div className="flex-grow-0 flex-shrink-0 basis-full min-w-0" key={item.id}>
                                <div className="relative aspect-video md:aspect-[2/1] w-full overflow-hidden">
                                    {imageUrl && (
                                        <Image src={imageUrl} alt={item.name} fill className="object-cover" data-ai-hint={imageHint} />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <Badge variant="warning" className="text-lg px-4 py-2">
                                             <Flame className="mr-2 h-5 w-5" /> Today's Special
                                        </Badge>
                                    </div>
                                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-white">
                                         <h2 className="text-3xl md:text-5xl font-extrabold font-headline drop-shadow-lg">{item.name}</h2>
                                         <p className="text-xl md:text-2xl font-semibold drop-shadow-md">${item.price.toFixed(2)}</p>
                                         <p className="mt-2 max-w-md text-sm md:text-base text-white/90 drop-shadow-sm">{item.description}</p>
                                         <Button size="lg" className="mt-4" onClick={() => onSelectItem(item)}>
                                            Customize & Add
                                         </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Button variant="outline" size="icon" className="absolute top-1/2 -translate-y-1/2 left-2 rounded-full z-10" onClick={() => emblaApi?.scrollPrev()}><ArrowLeft /></Button>
            <Button variant="outline" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2 rounded-full z-10" onClick={() => emblaApi?.scrollNext()}><ArrowRight /></Button>
        </div>
    );
}
