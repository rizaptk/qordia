"use client"

import Image from "next/image"
import type { MenuItem } from "@/lib/types"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type MenuItemCardProps = {
  item: MenuItem
  onSelect: () => void
} & React.ComponentProps<'div'>;

export function MenuItemCard({ item, onSelect, className, ...props }: MenuItemCardProps) {
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
    <Card 
        className={cn(
            "overflow-hidden transition-all duration-300 hover:shadow-lg",
            item.isAvailable ? 'cursor-pointer' : 'opacity-50',
            className
        )}
        onClick={item.isAvailable ? onSelect : undefined}
        {...props}
    >
      <div className="relative aspect-video">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            data-ai-hint={imageHint}
          />
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Sold Out</Badge>
          </div>
        )}
        {item.isPopular && item.isAvailable && (
             <Badge variant="warning" className="absolute top-2 right-2">Popular</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
      </CardContent>
      <CardFooter>
        <p className="font-semibold text-lg">${item.price.toFixed(2)}</p>
      </CardFooter>
    </Card>
  )
}
