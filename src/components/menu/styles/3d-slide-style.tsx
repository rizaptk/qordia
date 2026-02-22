"use client";

import { useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaCarouselType, EmblaEventType } from 'embla-carousel';
import type { MenuItem } from '@/lib/types';
import { MenuItemCard } from '@/components/menu/menu-item-card';

interface StyleProps {
    menuItems: MenuItem[] | null;
    categories: {id: string; name: string, displayOrder: number}[] | null;
    onSelectItem: (item: MenuItem) => void;
}

const TWEEN_FACTOR_BASE = 0.5;

export function ThreeDSlideStyle({ menuItems, onSelectItem }: StyleProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        loop: true,
        align: 'center',
        containScroll: 'trimSnaps',
    });
    
    const tweenFactor = useRef(0);
    const tweenNodes = useRef<HTMLElement[]>([]);

    const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
        tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
          return slideNode.querySelector('.embla__slide__inner') as HTMLElement
        })
    }, [])

    const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
        tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
    }, [])

    const tween3d = useCallback((emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
        const engine = emblaApi.internalEngine()
        const scrollProgress = emblaApi.scrollProgress()
        const slidesInView = emblaApi.slidesInView()
        const isScrollEvent = eventName === 'scroll'

        emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
            let diffToTarget = scrollSnap - scrollProgress
            
            if (engine.options.loop) {
                engine.slideLooper.loopPoints.forEach((loopItem) => {
                    const target = loopItem.target
                    if (snapIndex === loopItem.index && target() !== 0) {
                        const sign = Math.sign(target())
                        if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress)
                        if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
                    }
                })
            }
            
            const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current)
            const scale = Math.max(0.7, tweenValue).toString();
            const rotation = (diffToTarget * 70).toString(); // Adjust rotation intensity
            const opacity = Math.max(0.5, tweenValue).toString();

            const node = tweenNodes.current[snapIndex]
            if (node) {
                 node.style.transform = `perspective(1000px) rotateY(${rotation}deg) scale(${scale})`
                 node.style.opacity = opacity
            }
        })
    }, []);


    useEffect(() => {
        if (!emblaApi) return

        setTweenNodes(emblaApi)
        setTweenFactor(emblaApi)
        tween3d(emblaApi)

        emblaApi
        .on('reInit', setTweenNodes)
        .on('reInit', setTweenFactor)
        .on('reInit', tween3d)
        .on('scroll', tween3d)
    }, [emblaApi, tween3d, setTweenFactor, setTweenNodes]);


    return (
        <div className="py-12">
            <div className="embla">
                <div className="embla__viewport" ref={emblaRef}>
                    <div className="embla__container">
                        {menuItems?.map((item) => (
                            <div className="embla__slide" key={item.id}>
                                <div className="embla__slide__inner">
                                    <MenuItemCard
                                        item={item}
                                        onSelect={() => onSelectItem(item)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             <div className="text-center mt-12">
                <p className="text-lg font-semibold">Swipe to browse our featured items</p>
                <p className="text-muted-foreground">Tap on a card to customize and add to your order.</p>
            </div>
        </div>
    );
}
