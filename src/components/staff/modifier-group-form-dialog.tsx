"use client";

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { ModifierGroup } from '@/lib/types';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '../ui/separator';

const TENANT_ID = 'qordiapro-tenant';

const formSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters."),
  selectionType: z.enum(['single', 'multiple']),
  required: z.boolean().default(false),
  options: z.array(z.object({
      name: z.string().min(1, "Option name cannot be empty."),
      priceAdjustment: z.coerce.number().default(0),
  })).min(1, "You must add at least one option."),
});

type ModifierGroupFormValues = z.infer<typeof formSchema>;

type ModifierGroupFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupToEdit?: ModifierGroup | null;
};

export function ModifierGroupFormDialog({ isOpen, onOpenChange, groupToEdit }: ModifierGroupFormDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<ModifierGroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      selectionType: 'single',
      required: false,
      options: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  useEffect(() => {
    if (groupToEdit) {
      form.reset({
        name: groupToEdit.name,
        selectionType: groupToEdit.selectionType,
        required: groupToEdit.required,
        options: groupToEdit.options.map(opt => ({ name: opt.name, priceAdjustment: opt.priceAdjustment ?? 0 })),
      });
    } else {
      form.reset({
        name: '',
        selectionType: 'single',
        required: false,
        options: [{ name: '', priceAdjustment: 0 }],
      });
    }
  }, [groupToEdit, form]);

  const onSubmit = async (data: ModifierGroupFormValues) => {
    if (!firestore) return;

    try {
      if (groupToEdit) {
        const groupRef = doc(firestore, `tenants/${TENANT_ID}/modifier_groups`, groupToEdit.id);
        updateDocumentNonBlocking(groupRef, data);
        toast({ title: "Success", description: "Modifier group updated." });
      } else {
        const collectionRef = collection(firestore, `tenants/${TENANT_ID}/modifier_groups`);
        await addDocumentNonBlocking(collectionRef, data);
        toast({ title: "Success", description: "New modifier group created." });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving modifier group:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save modifier group." });
    }
  };
  
  const handleDelete = () => {
    if (!firestore || !groupToEdit) return;
    const groupRef = doc(firestore, `tenants/${TENANT_ID}/modifier_groups`, groupToEdit.id);
    deleteDocumentNonBlocking(groupRef);
    toast({ title: "Modifier Group Deleted", description: `The group "${groupToEdit.name}" has been removed.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{groupToEdit ? 'Edit' : 'Create a New'} Modifier Group</DialogTitle>
          <DialogDescription>
            Modifier groups let you add customization options to your products, like sizes or add-ons.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          <Form {...form}>
            <form id="modifier-group-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Milk Options" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="selectionType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Selection Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="single" /></FormControl>
                            <FormLabel className="font-normal">Single Choice</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="multiple" /></FormControl>
                            <FormLabel className="font-normal">Multiple Choices</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="required"
                    render={({ field }) => (
                    <FormItem className="flex flex-col justify-center space-y-2">
                        <FormLabel>Required?</FormLabel>
                        <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormDescription>Must the user select an option?</FormDescription>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </div>
                    </FormItem>
                    )}
                />
              </div>

              <Separator />

              <div>
                <h3 className="text-md font-medium mb-2">Options</h3>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-muted/50">
                            <FormField
                                control={form.control}
                                name={`options.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Option Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Oat Milk" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`options.${index}.priceAdjustment`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price Adj. (+/-)</FormLabel>
                                        <FormControl><Input type="number" step="0.01" placeholder="0.50" {...field} /></FormControl>
                                        <FormMessage />
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
                        onClick={() => append({ name: "", priceAdjustment: 0 })}
                        >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                    </Button>
                     <FormMessage>{form.formState.errors.options?.root?.message}</FormMessage>
                </div>
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className="pt-4 border-t">
              <div className="flex justify-between w-full">
                {groupToEdit ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete the modifier group "{groupToEdit.name}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : <div />}
                 <div className="flex gap-2">
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" form="modifier-group-form" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save Group"}</Button>
                </div>
              </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
