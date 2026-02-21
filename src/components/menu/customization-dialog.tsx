
"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import type { MenuItem, CartItem, ModifierGroup, ModifierOption } from "@/lib/types"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Scaling, Droplet, Beaker, SlidersHorizontal, PlusSquare, Bot } from "lucide-react"

type CustomizationDialogProps = {
  item: MenuItem | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  modifierGroups: ModifierGroup[]
  onAddToCart?: (item: CartItem) => void;
  itemToEdit?: CartItem | null;
}

type SelectedOptions = Record<string, ModifierOption[]>;

const groupIcons: { [key: string]: React.ElementType } = {
  'size': Scaling,
  'milk': Droplet,
  'syrup': Beaker,
  'flavor': Beaker,
  'sweetness': SlidersHorizontal,
  'add-on': PlusSquare,
};

const IconForGroup = ({ groupName }: { groupName: string }) => {
  const lowerGroupName = groupName.toLowerCase();
  const iconKey = Object.keys(groupIcons).find(key => lowerGroupName.includes(key));
  const Icon = iconKey ? groupIcons[iconKey] : Bot;
  return <Icon className="h-5 w-5 text-muted-foreground" />;
};


export function CustomizationDialog({ item, isOpen, onOpenChange, modifierGroups, onAddToCart, itemToEdit }: CustomizationDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [specialNotes, setSpecialNotes] = useState("")
  const [totalPrice, setTotalPrice] = useState(item?.price || 0)

  const { addToCart, updateCartItem } = useCartStore();
  const { toast } = useToast();

  const relevantGroups = useMemo(() => {
    if (!item || !modifierGroups) return [];
    return modifierGroups.filter(g => item.modifierGroupIds?.includes(g.id));
  }, [item, modifierGroups]);

 useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
      setSpecialNotes("");
      setSelectedOptions({});
      return;
    }

    if (itemToEdit && item) { // Edit mode
        setQuantity(itemToEdit.quantity);
        setSpecialNotes(itemToEdit.specialNotes);
        
        const initialSelections: SelectedOptions = {};
        relevantGroups.forEach(group => {
            const selectedNamesString = itemToEdit.customizations[group.name];
            if (selectedNamesString) {
                const selectedNames = selectedNamesString.split(', ');
                const selectedInGroup = group.options.filter(opt => selectedNames.includes(opt.name));
                initialSelections[group.id] = selectedInGroup;
            } else {
                initialSelections[group.id] = [];
            }
        });
        setSelectedOptions(initialSelections);

    } else if (item) { // Add mode
        const initialSelections: SelectedOptions = {};
        relevantGroups.forEach(group => {
            if (group.selectionType === 'single' && group.options.length > 0) {
                initialSelections[group.id] = [group.options[0]];
            } else {
                initialSelections[group.id] = [];
            }
        });
        setSelectedOptions(initialSelections);
        setQuantity(1);
        setSpecialNotes("");
    }
  }, [item, isOpen, relevantGroups, itemToEdit]);


  useEffect(() => {
    if (!item) return;
    let calculatedPrice = item.price;
    Object.values(selectedOptions).flat().forEach(option => {
      calculatedPrice += option.priceAdjustment;
    });
    setTotalPrice(calculatedPrice * quantity);
  }, [selectedOptions, quantity, item]);

  const handleSingleSelect = (groupId: string, option: ModifierOption) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupId]: [option],
    }));
  };

  const handleMultiSelect = (groupId: string, option: ModifierOption, checked: boolean | 'indeterminate') => {
    setSelectedOptions(prev => {
      const currentSelections = prev[groupId] || [];
      if (checked) {
        return { ...prev, [groupId]: [...currentSelections, option] };
      } else {
        return { ...prev, [groupId]: currentSelections.filter(o => o.name !== option.name) };
      }
    });
  };

  const isAddToCartDisabled = useMemo(() => {
    return relevantGroups.some(group => group.required && (!selectedOptions[group.id] || selectedOptions[group.id].length === 0));
  }, [relevantGroups, selectedOptions]);

  const handleConfirmClick = () => {
    if (!item || isAddToCartDisabled) return;

    const finalCustomizations: { [key: string]: string } = {};
    Object.entries(selectedOptions).forEach(([groupId, selections]) => {
      const group = relevantGroups.find(g => g.id === groupId);
      if (group && selections.length > 0) {
        finalCustomizations[group.name] = selections.map(s => s.name).join(', ');
      }
    });

    if (itemToEdit) { // UPDATE logic
        const updatedCartItem: Partial<CartItem> = {
            quantity,
            customizations: finalCustomizations,
            specialNotes,
            price: totalPrice,
        };
        if (onAddToCart) {
            // This case is for the cashier walk-in flow, which doesn't have an edit feature yet.
        } else {
            updateCartItem(itemToEdit.id, updatedCartItem);
        }
        toast({
            title: "Item Updated",
            description: `${item.name} has been updated in your order.`,
        });

    } else { // ADD logic
        const newCartItem: CartItem = {
          id: `${item.id}-${Date.now()}`,
          menuItem: item,
          quantity,
          customizations: finalCustomizations,
          specialNotes,
          price: totalPrice,
        };

        if (onAddToCart) {
          onAddToCart(newCartItem);
        } else {
          addToCart(newCartItem);
        }

        toast({
          title: "Added to order",
          description: `${item.name} has been added to your order.`,
        })
    }
    
    onOpenChange(false);
  }

  if (!item) return null;

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-6 md:grid-cols-2">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                data-ai-hint={imageHint}
              />
            )}
          </div>
          <div className="flex flex-col space-y-6">
              {relevantGroups.map(group => (
                <div key={group.id}>
                  <Label className="font-semibold flex items-center gap-2 mb-3">
                    <IconForGroup groupName={group.name} />
                    {group.name}
                    {group.required && <span className="text-destructive ml-1">*</span>}
                     <span className="text-sm text-muted-foreground ml-auto">
                        {group.selectionType === 'single' ? '(Select 1)' : '(Select multiple)'}
                    </span>
                  </Label>
                    {group.selectionType === 'single' ? (
                       <ScrollArea className="w-full whitespace-nowrap">
                          <RadioGroup
                            value={JSON.stringify(selectedOptions[group.id]?.[0])}
                            onValueChange={(valueStr) => handleSingleSelect(group.id, JSON.parse(valueStr))}
                            className="flex gap-2 pb-4"
                          >
                            {group.options.map(option => (
                              <Label
                                key={option.name}
                                htmlFor={`${group.id}-${option.name}`}
                                className={cn(
                                    "block cursor-pointer rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                                    selectedOptions[group.id]?.[0]?.name === option.name && "border-primary"
                                )}
                                >
                                <RadioGroupItem value={JSON.stringify(option)} id={`${group.id}-${option.name}`} className="sr-only" />
                                <span>{option.name}</span>
                                {option.priceAdjustment > 0 && <p className="text-xs text-muted-foreground">+${option.priceAdjustment.toFixed(2)}</p>}
                              </Label>
                            ))}
                          </RadioGroup>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    ) : (
                      <div className="pt-2 space-y-2">
                        {group.options.map(option => (
                          <div key={option.name} className="flex items-center justify-between rounded-md border p-3">
                            <Label htmlFor={`${group.id}-${option.name}`} className="flex items-center gap-3 cursor-pointer">
                              <Checkbox
                                id={`${group.id}-${option.name}`}
                                checked={selectedOptions[group.id]?.some(o => o.name === option.name)}
                                onCheckedChange={(checked) => handleMultiSelect(group.id, option, checked)}
                              />
                              {option.name}
                            </Label>
                             {option.priceAdjustment > 0 && <span className="text-sm text-muted-foreground">+${option.priceAdjustment.toFixed(2)}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="special-notes" className="font-semibold">Special Notes</Label>
              <Textarea
                id="special-notes"
                placeholder="Any special requests? (e.g., allergies, no foam)"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 !mt-auto">
              <Label htmlFor="quantity" className="font-semibold">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                <Input id="quantity" value={quantity} readOnly className="w-16 text-center" />
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>+</Button>
              </div>
            </div>

          </div>
        </div>
        <DialogFooter>
          <div className="w-full flex justify-between items-center">
            <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
            <Button type="button" size="lg" onClick={handleConfirmClick} disabled={isAddToCartDisabled}>
              {itemToEdit ? 'Update Item' : 'Add to Order'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
