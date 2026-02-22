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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  Scaling, Droplet, Beaker, SlidersHorizontal, 
  PlusSquare, Bot, FileText, X 
} from "lucide-react"

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
  'size': Scaling, 'milk': Droplet, 'syrup': Beaker, 'flavor': Beaker,
  'sweetness': SlidersHorizontal, 'add-on': PlusSquare,
};

const IconForGroup = ({ groupName }: { groupName: string }) => {
  const lowerGroupName = groupName.toLowerCase();
  const iconKey = Object.keys(groupIcons).find(key => lowerGroupName.includes(key));
  const Icon = iconKey ? groupIcons[iconKey] : Bot;
  return <Icon className="h-5 w-5" />;
};

export function CustomizationDialog({ item, isOpen, onOpenChange, modifierGroups, onAddToCart, itemToEdit }: CustomizationDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});
  const [specialNotes, setSpecialNotes] = useState("")
  const [totalPrice, setTotalPrice] = useState(item?.price || 0);
  const [activePanel, setActivePanel] = useState<string | 'note' | null>(null);

  const { addToCart, updateCartItem } = useCartStore();
  const { toast } = useToast();

  const relevantGroups = useMemo(() => {
    if (!item || !modifierGroups) return [];
    return modifierGroups.filter(g => item.modifierGroupIds?.includes(g.id));
  }, [item, modifierGroups]);

  // Pricing Logic
  useEffect(() => {
    if (!item) return;
    let calculatedPrice = item.price;
    Object.values(selectedOptions).flat().forEach(option => {
      calculatedPrice += option.priceAdjustment;
    });
    setTotalPrice(calculatedPrice * quantity);
  }, [selectedOptions, quantity, item]);

  // Reset/Edit Logic
  useEffect(() => {
    if (!isOpen) { setActivePanel(null); return; }
    if (itemToEdit && item) {
        setQuantity(itemToEdit.quantity);
        setSpecialNotes(itemToEdit.specialNotes);
        const initial: SelectedOptions = {};
        relevantGroups.forEach(g => {
            const names = itemToEdit.customizations[g.name]?.split(', ') || [];
            initial[g.id] = g.options.filter(opt => names.includes(opt.name));
        });
        setSelectedOptions(initial);
    }
  }, [item, isOpen, relevantGroups, itemToEdit]);

  const toggleOption = (groupId: string, option: ModifierOption, type: 'single' | 'multiple') => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      if (type === 'single') return { ...prev, [groupId]: [option] };
      return { ...prev, [groupId]: current.some(o => o.name === option.name) 
        ? current.filter(o => o.name !== option.name) 
        : [...current, option] 
      };
    });
  };

  if (!item) return null;
  const imageUrl = item.imageUrl || PlaceHolderImages.find(p => p.id === item.image)?.imageUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl h-[95vh] flex flex-col overflow-hidden p-0 gap-0 border-none">
        
        {/* Main Wrapper: This container gets blurred */}
        <div className={cn(
            "flex flex-col max-h-full h-full transition-all duration-300",
            activePanel ? "blur-sm scale-[0.98] brightness-75 select-none pointer-events-none" : "blur-0"
        )}>
            <div className="p-6 pb-2">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">{item.name}</DialogTitle>
                    <DialogDescription>{item.description}</DialogDescription>
                </DialogHeader>
            </div>

            <div className="flex-grow px-6 space-y-6">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted shadow-inner">
                    {imageUrl && <Image src={imageUrl} alt={item.name} fill className="object-cover" />}
                </div>

                <div className="flex items-center gap-4 py-2">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {relevantGroups.map(group => (
                            <Button 
                                key={group.id}
                                variant="outline"
                                size="icon"
                                className="rounded-xl h-12 w-12 bg-secondary/50 border-none"
                                onClick={() => setActivePanel(group.id)}
                            >
                                <IconForGroup groupName={group.name} />
                            </Button>
                        ))}
                        <Button 
                            variant="outline"
                            size="icon"
                            className="rounded-xl h-12 w-12 bg-secondary/50 border-none"
                            onClick={() => setActivePanel('note')}
                        >
                            <FileText className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="ml-auto flex items-center bg-secondary rounded-xl p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                        <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)}>+</Button>
                    </div>
                </div>
            </div>

            <DialogFooter className="p-4 mt-auto">
                <div className="w-full flex justify-between items-center">
                    <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
                    <Button size="lg" className="rounded-full px-10" onClick={() => onOpenChange(false)}>Add to Order</Button>
                </div>
            </DialogFooter>
        </div>

        {/* Backdrop Overlay (only visible when panel is active) */}
        {activePanel && (
            <div 
                className="absolute inset-0 z-10 bg-transparent cursor-pointer" 
                onClick={() => setActivePanel(null)} 
            />
        )}

        {/* Sliding Customization Panel */}
        <div className={cn(
            "absolute inset-x-0 bottom-0 z-20 bg-background/95 backdrop-blur-md border-t rounded-t-[2.5rem] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col max-h-[70%]",
            activePanel ? "translate-y-0" : "translate-y-full"
        )}>
            {/* Close Handle / Button */}
            <div className="flex justify-center p-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-muted"
                    onClick={() => setActivePanel(null)}
                >
                    <X className="h-6 w-6 text-muted-foreground" />
                </Button>
            </div>
            
            <div className="px-8 pb-12 overflow-y-auto">
                {relevantGroups.map(group => group.id === activePanel && (
                    <div key={group.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-1">
                            <h3 className="font-bold text-xl">{group.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {group.selectionType === 'single' ? 'Choose one option' : 'Choose as many as you like'}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {group.options.map(option => {
                                const isSelected = selectedOptions[group.id]?.some(o => o.name === option.name);
                                return (
                                    <Badge
                                        key={option.name}
                                        variant={isSelected ? "default" : "outline"}
                                        className={cn(
                                            "px-5 py-3 text-sm rounded-2xl cursor-pointer transition-all border-2",
                                            isSelected ? "border-primary shadow-lg scale-105" : "border-transparent bg-secondary/50"
                                        )}
                                        onClick={() => toggleOption(group.id, option, group.selectionType)}
                                    >
                                        {option.name}
                                        {option.priceAdjustment > 0 && <span className="ml-2 opacity-70">+${option.priceAdjustment}</span>}
                                    </Badge>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {activePanel === 'note' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="font-bold text-xl">Special Notes</h3>
                        <Textarea
                            placeholder="Type any instructions here..."
                            className="min-h-[150px] bg-secondary/30 border-none rounded-2xl focus-visible:ring-1 ring-primary p-4"
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                        />
                        <Button className="w-full rounded-2xl h-12" onClick={() => setActivePanel(null)}>
                            Done
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}