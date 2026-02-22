"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {type EmblaCarouselType} from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

interface StyleProps {
    menuItems: MenuItem[] | null;
    categories: {id: string; name: string, displayOrder: number}[] | null;
    onSelectItem: (item: MenuItem) => void;
}

export function PromoSlideStyle({ menuItems, onSelectItem }: StyleProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true },
        [Autoplay({ delay: 5000, stopOnInteraction: false }), Fade()]
    );
    
    const [progress, setProgress] = useState(0);

    const updateProgress = useCallback((emblaApi: EmblaCarouselType) => {
        const autoplay = (emblaApi?.plugins() as any)?.autoplay;
        if (!autoplay) return;

        const timeUntilNext = autoplay.timeUntilNext();
        const delay = autoplay.options.delay;
        const currentProgress = Math.max(0, 1 - (timeUntilNext / delay)) * 100;
        
        setProgress(currentProgress);
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        
        let animationFrame: number;
        const animate = () => {
          updateProgress(emblaApi);
          animationFrame = requestAnimationFrame(animate);
        };
        
        animationFrame = requestAnimationFrame(animate);
        
        emblaApi.on('select', () => setProgress(0));
        emblaApi.on('reInit', () => setProgress(0));
        
        return () => cancelAnimationFrame(animationFrame);
    }, [emblaApi, updateProgress]);

    const popularItems = menuItems?.filter(item => item.isPopular && item.isAvailable) || [];

    if (!popularItems || popularItems.length === 0) {
        return (
            <div className="container mx-auto p-4 md:p-8 text-center h-[60vh] flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold">No Promotions Today</h1>
                <p className="text-muted-foreground">Check back later for special offers!</p>
            </div>
        );
    }
    
    return (
        <section className="promo-hero">
            <div className="promo-hero__viewport" ref={emblaRef}>
                <div className="promo-hero__container">
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
                            <div className="promo-hero__slide" key={item.id}>
                                {imageUrl && <Image className="promo-hero__img" src={imageUrl} alt={item.name} fill data-ai-hint={imageHint} priority />}
                                <div className="promo-hero__overlay">
                                    <div className="promo-hero__content">
                                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-background/20 backdrop-blur-sm rounded-full border border-white/20">
                                            <Flame className="h-4 w-4 text-warning" />
                                            <span className="font-semibold text-sm">Today's Special</span>
                                        </div>
                                        <h1 className="promo-hero__title">{item.name}</h1>
                                        <p className="promo-hero__price">${item.price.toFixed(2)}</p>
                                        <p className="promo-hero__description">{item.description}</p>
                                        <Button size="lg" className="promo-hero__cta" onClick={() => onSelectItem(item)}>
                                            Customize & Add to Order
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="promo-hero__progress">
                <div className="promo-hero__progress__inner" style={{ width: `${progress}%` }} />
            </div>
        </section>
    );
}
