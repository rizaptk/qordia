
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { MenuCategory } from '@/lib/types';
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
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';

const TENANT_ID = 'qordiapro-tenant';

const formSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  displayOrder: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof formSchema>;

type CategoryFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: MenuCategory | null;
};

export function CategoryFormDialog({ isOpen, onOpenChange, categoryToEdit }: CategoryFormDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      displayOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (categoryToEdit) {
      form.reset({
        name: categoryToEdit.name,
        displayOrder: categoryToEdit.displayOrder,
        isActive: categoryToEdit.isActive,
      });
    } else {
      form.reset({
        name: '',
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [categoryToEdit, form]);

  const onSubmit = async (data: CategoryFormValues) => {
    if (!firestore) return;

    try {
      if (categoryToEdit) {
        const categoryRef = doc(firestore, `tenants/${TENANT_ID}/menu_categories`, categoryToEdit.id);
        updateDocumentNonBlocking(categoryRef, data);
        toast({ title: "Success", description: "Category updated." });
      } else {
        const collectionRef = collection(firestore, `tenants/${TENANT_ID}/menu_categories`);
        await addDocumentNonBlocking(collectionRef, data);
        toast({ title: "Success", description: "New category created." });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save category." });
    }
  };

  const handleDelete = () => {
    if (!firestore || !categoryToEdit) return;
    const categoryRef = doc(firestore, `tenants/${TENANT_ID}/menu_categories`, categoryToEdit.id);
    // Note: This does not handle re-assigning menu items from the deleted category.
    deleteDocumentNonBlocking(categoryRef);
    toast({ title: "Category Deleted", description: `${categoryToEdit.name} has been removed.` });
    onOpenChange(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            Categories help group items on your menu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coffee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                   <FormDescription>A smaller number will appear first.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>Is this category visible to customers?</FormDescription>
                    </div>
                    <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                </FormItem>
                )}
            />
          </form>
        </Form>
        <DialogFooter className="pt-4 border-t">
              <div className="flex justify-between w-full">
                {categoryToEdit ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the category "{categoryToEdit.name}". Menu items in this category will need to be reassigned.
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
                    <Button type="submit" form="category-form" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </div>
              </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
