"use client"

import { useState } from "react"
import Image from "next/image"
import type { MenuItem, CartItem } from "@/lib/types"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

type CustomizationDialogProps = {
  item: MenuItem | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart: (item: CartItem) => void
}

export function CustomizationDialog({ item, isOpen, onOpenChange, onAddToCart }: CustomizationDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [customizations, setCustomizations] = useState<{ [key: string]: string }>({})
  const [specialNotes, setSpecialNotes] = useState("")
  
  const imagePlaceholder = PlaceHolderImages.find(p => p.id === item?.image)

  const handleAddToCartClick = () => {
    if (!item) return;

    const finalPrice = item.price * quantity; // In a real app, option prices would be added here

    onAddToCart({
      id: `${item.id}-${Date.now()}`,
      menuItem: item,
      quantity,
      customizations,
      specialNotes,
      price: finalPrice
    })
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state on close
      setQuantity(1)
      setCustomizations({})
      setSpecialNotes("")
    }
    onOpenChange(open)
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-6 md:grid-cols-2">
            <div className="relative aspect-video rounded-lg overflow-hidden">
                {imagePlaceholder && (
                    <Image
                        src={imagePlaceholder.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        data-ai-hint={imagePlaceholder.imageHint}
                    />
                )}
            </div>
          <div className="space-y-4">
            {item.options && Object.entries(item.options).map(([optionKey, values]) => (
              <div key={optionKey} className="space-y-2">
                <Label htmlFor={optionKey} className="font-semibold">{optionKey}</Label>
                <RadioGroup
                  id={optionKey}
                  onValueChange={(value) => setCustomizations(prev => ({ ...prev, [optionKey]: value }))}
                  defaultValue={values[0]}
                >
                  {values.map(value => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`${optionKey}-${value}`} />
                      <Label htmlFor={`${optionKey}-${value}`}>{value}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="special-notes" className="font-semibold">Special Notes</Label>
              <Textarea
                id="special-notes"
                placeholder="Any special requests? (e.g., allergies, extra hot)"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="quantity" className="font-semibold">Quantity</Label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q-1))}>-</Button>
                    <Input id="quantity" value={quantity} readOnly className="w-16 text-center" />
                    <Button variant="outline" size="icon" onClick={() => setQuantity(q => q+1)}>+</Button>
                </div>
            </div>

          </div>
        </div>
        <DialogFooter>
          <div className="w-full flex justify-between items-center">
            <span className="text-2xl font-bold">${(item.price * quantity).toFixed(2)}</span>
            <Button type="button" size="lg" onClick={handleAddToCartClick}>
              Add to Order
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
