"use client";

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';


interface StyleProps {
    menuItems: MenuItem[] | null;
    categories: {id: string; name: string, displayOrder: number}[] | null;
    onSelectItem: (item: MenuItem) => void;
}

export function CarouselSlidesStyle({ menuItems, onSelectItem }: StyleProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        align: 'center',
        loop: true,
        skipSnaps: false,
    });
    
    const availableItems = menuItems?.filter(item => item.isAvailable) || [];

    if (!availableItems || availableItems.length === 0) {
        return (
            <div className="container mx-auto p-4 md:p-8 text-center">
                <h1 className="text-2xl font-bold">Menu is Currently Empty</h1>
                <p className="text-muted-foreground">Please check back later!</p>
            </div>
        );
    }
    
    return (
        <div className="w-full py-12 relative max-w-5xl mx-auto">
             <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4">
                    {availableItems.map((item) => {
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
                             <div className="flex-grow-0 flex-shrink-0 basis-full sm:basis-1/2 md:basis-1/3 pl-4" key={item.id}>
                                <Card 
                                    className="overflow-hidden h-full cursor-pointer group"
                                    onClick={() => onSelectItem(item)}
                                >
                                    <CardContent className="p-0">
                                        <div className="relative aspect-square w-full overflow-hidden">
                                            {imageUrl && (
                                                <Image 
                                                    src={imageUrl} 
                                                    alt={item.name} 
                                                    fill 
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                                                    data-ai-hint={imageHint} 
                                                />
                                            )}
                                            {item.isPopular && (
                                                <Badge variant="warning" className="absolute top-2 right-2">Popular</Badge>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-xl font-bold font-headline">{item.name}</h3>
                                            <p className="text-lg font-semibold text-primary">${item.price.toFixed(2)}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>
            <Button variant="outline" size="icon" className="absolute top-1/2 -translate-y-1/2 left-2 md:-left-4 rounded-full z-10 shadow-md" onClick={() => emblaApi?.scrollPrev()}><ArrowLeft /></Button>
            <Button variant="outline" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2 md:-right-4 rounded-full z-10 shadow-md" onClick={() => emblaApi?.scrollNext()}><ArrowRight /></Button>
        </div>
    );
}
