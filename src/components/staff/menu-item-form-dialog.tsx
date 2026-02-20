"use client";

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem } from '@/lib/types';
import { useAuthStore } from '@/stores/auth-store';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '../ui/separator';

const TENANT_ID = 'qordiapro-tenant';

const optionSchema = z.object({
  key: z.string().min(1, "Option name cannot be empty."),
  values: z.string().min(1, "Please provide comma-separated values."),
});

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  categoryId: z.string({ required_error: "Please select a category." }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  options: z.array(optionSchema).optional(),
});

type MenuItemFormValues = z.infer<typeof formSchema>;

type MenuItemFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: MenuItem | null;
  categories: { id: string; name: string }[];
};

export function MenuItemFormDialog({ isOpen, onOpenChange, itemToEdit, categories }: MenuItemFormDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { hasMenuCustomizationFeature } = useAuthStore();

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isAvailable: true,
      isPopular: false,
      options: [],
    },
  });

   const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  useEffect(() => {
    if (itemToEdit) {
      const itemOptions = itemToEdit.options ? 
            Object.entries(itemToEdit.options).map(([key, values]) => ({ key, values: values.join(', ') }))
            : [];
      form.reset({
        name: itemToEdit.name,
        description: itemToEdit.description,
        price: itemToEdit.price,
        categoryId: itemToEdit.categoryId,
        imageUrl: itemToEdit.imageUrl,
        isAvailable: itemToEdit.isAvailable,
        isPopular: itemToEdit.isPopular,
        options: itemOptions,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        imageUrl: '',
        isAvailable: true,
        isPopular: false,
        options: [],
      });
    }
  }, [itemToEdit, form]);

  const onSubmit = async (data: MenuItemFormValues) => {
    if (!firestore) return;

    const optionsForFirestore = data.options?.reduce((acc, option) => {
        if (option.key && option.values) {
            acc[option.key] = option.values.split(',').map(v => v.trim()).filter(v => v);
        }
        return acc;
    }, {} as { [key: string]: string[] }) || {};

    const dataForFirestore = {
        ...data,
        options: optionsForFirestore,
    };


    try {
      if (itemToEdit) {
        const itemRef = doc(firestore, `tenants/${TENANT_ID}/menu_items`, itemToEdit.id);
        updateDocumentNonBlocking(itemRef, dataForFirestore);
        toast({ title: "Success", description: "Menu item updated." });
      } else {
        const collectionRef = collection(firestore, `tenants/${TENANT_ID}/menu_items`);
        await addDocumentNonBlocking(collectionRef, dataForFirestore);
        toast({ title: "Success", description: "New menu item created." });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save menu item." });
    }
  };
  
  const handleDelete = () => {
    if (!firestore || !itemToEdit) return;
    const itemRef = doc(firestore, `tenants/${TENANT_ID}/menu_items`, itemToEdit.id);
    deleteDocumentNonBlocking(itemRef);
    toast({ title: "Item Deleted", description: `${itemToEdit.name} has been removed from the menu.` });
    onOpenChange(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          <DialogDescription>
            {itemToEdit ? 'Update the details for this item.' : 'Fill out the details for the new item.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Iced Latte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A short, tasty description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
             <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                        <Input placeholder="https://images.unsplash.com/..." {...field} />
                    </FormControl>
                    <FormDescription>Paste a URL to an image for this item.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <div className="flex space-x-8">
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                    <div className="space-y-0.5">
                      <FormLabel>Available</FormLabel>
                      <FormDescription>Is this item currently available to order?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="isPopular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                    <div className="space-y-0.5">
                      <FormLabel>Popular</FormLabel>
                      <FormDescription>Feature this as a popular item?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {hasMenuCustomizationFeature && (
                <div>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium">Customization Options</h3>
                        <p className="text-sm text-muted-foreground">Add options like size, milk, or toppings.</p>
                    </div>
                     {fields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg">
                        <FormField
                            control={form.control}
                            name={`options.${index}.key`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Option Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Size" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`options.${index}.values`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Choices</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Small, Medium, Large" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ key: "", values: "" })}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                    </Button>
                  </div>
                </div>
            )}


            <DialogFooter className="pt-4">
              <div className="flex justify-between w-full">
                {itemToEdit ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" className="flex items-center gap-2">
                                <Trash2 className="h-4 w-4" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the menu item "{itemToEdit.name}".
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : <div></div>}
                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
