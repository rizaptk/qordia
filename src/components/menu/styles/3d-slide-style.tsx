"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { MenuItem } from '@/lib/types';
import { MenuItemCard } from '@/components/menu/menu-item-card';

interface StyleProps {
    menuItems: MenuItem[] | null;
    categories: {id: string; name: string, displayOrder: number}[] | null;
    onSelectItem: (item: MenuItem) => void;
}

export function ThreeDSlideStyle({ menuItems, onSelectItem }: StyleProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'center',
        containScroll: 'trimSnaps',
        loop: true,
    });
    const [tweenValues, setTweenValues] = useState<number[]>([]);

    const onScroll = useCallback(() => {
        if (!emblaApi) return;
        const scrollProgress = emblaApi.scrollProgress();
        const styles = emblaApi.scrollSnapList().map((scrollSnap) => {
            return scrollSnap - scrollProgress;
        });
        setTweenValues(styles);
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onScroll();
        emblaApi.on('scroll', onScroll);
        emblaApi.on('reInit', onScroll);
    }, [emblaApi, onScroll]);

    return (
        <div className="py-12">
            <div className="overflow-hidden" ref={emblaRef} style={{ perspective: '1000px' }}>
                <div className="flex -ml-4">
                    {menuItems?.map((item, index) => {
                        const diffToTarget = tweenValues[index] || 0;
                        const scale = 1 - Math.abs(diffToTarget) * 0.3;
                        const rotateY = diffToTarget * -25;
                        const opacity = 1 - Math.abs(diffToTarget) * 0.5;

                        return (
                            <div
                                className="flex-shrink-0 flex-grow-0 basis-full sm:basis-[45%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-4"
                                key={item.id}
                                style={{ transition: 'transform 0.3s', transformStyle: 'preserve-3d' }}
                            >
                                <div style={{
                                    transform: `rotateY(${rotateY}deg) scale(${scale})`,
                                    opacity: opacity,
                                }}>
                                    <MenuItemCard
                                        item={item}
                                        onSelect={() => onSelectItem(item)}
                                        className="h-full"
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
             <div className="text-center mt-12">
                <p className="text-lg font-semibold">Swipe to browse our featured items</p>
                <p className="text-muted-foreground">Tap on a card to customize and add to your order.</p>
            </div>
        </div>
    );
}
