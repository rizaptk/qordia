'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { collection, doc, Timestamp } from 'firebase/firestore';
import type { ApiKey } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PlusCircle, KeyRound, Copy, Trash2, Check } from 'lucide-react';

const generateKeySchema = z.object({
  name: z.string().min(3, 'Key name must be at least 3 characters.'),
});
type GenerateKeyFormValues = z.infer<typeof generateKeySchema>;


export default function ApiAccessPage() {
  const { tenant } = useAuthStore();
  const firestore = useFirestore();
  const TENANT_ID = tenant?.id;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const { toast } = useToast();

  const apiKeysRef = useMemoFirebase(() => 
    firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/api_keys`) : null,
    [firestore, TENANT_ID]
  );
  const { data: keys, isLoading } = useCollection<ApiKey>(apiKeysRef);

  const form = useForm<GenerateKeyFormValues>({
    resolver: zodResolver(generateKeySchema),
    defaultValues: { name: '' },
  });

  const handleGenerateKey = async (data: GenerateKeyFormValues) => {
    if (!firestore || !TENANT_ID) return;

    // This is a placeholder for actual key generation on a server
    const generatedKey = `qordia_live_sk_${[...Array(24)].map(() => Math.random().toString(36)[2]).join('')}`;
    const keyPrefix = generatedKey.slice(0, 15); // e.g., qordia_live_sk_
    const keyTruncated = generatedKey.slice(-4);
    
    const newApiKeyData = {
      name: data.name,
      keyPrefix,
      keyTruncated,
      createdAt: Timestamp.now(),
    };

    try {
        await addDocumentNonBlocking(collection(firestore, `tenants/${TENANT_ID}/api_keys`), newApiKeyData);
        setNewKey(generatedKey);
        form.reset();
    } catch (error) {
        console.error("Error generating API key:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate API key.' });
    }
  };
  
  const handleRevokeKey = (keyId: string) => {
    if (!firestore || !TENANT_ID) return;
    const keyRef = doc(firestore, `tenants/${TENANT_ID}/api_keys`, keyId);
    deleteDocumentNonBlocking(keyRef);
    toast({ title: 'API Key Revoked', description: 'The key has been successfully revoked and can no longer be used.' });
  };
  
  const handleCopyKey = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewKey(null);
    }
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                    Generate and manage API keys to integrate Qordia with your other services and build custom solutions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
                </p>
            </CardContent>
             <CardFooter>
                 <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Generate New Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{newKey ? 'Your New API Key' : 'Generate New API Key'}</DialogTitle>
                        </DialogHeader>
                        {newKey ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Please copy this key and store it securely. You will not be able to see it again.
                                </p>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                                    <code className="flex-1 font-mono text-sm">{newKey}</code>
                                    <Button size="icon" variant="ghost" onClick={() => handleCopyKey(newKey, 'new')}>
                                        {copiedKeyId === 'new' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <Button onClick={() => handleOpenChange(false)} className="w-full">Done</Button>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleGenerateKey)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Key Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., 'My POS System'" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                          {form.formState.isSubmitting ? 'Generating...' : 'Generate Key'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Active API Keys</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Key</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Loading keys...</TableCell>
                            </TableRow>
                        ) : keys && keys.length > 0 ? keys.map(key => (
                            <TableRow key={key.id}>
                                <TableCell className="font-medium">{key.name}</TableCell>
                                <TableCell>
                                    <code className="font-mono text-sm">{key.keyPrefix}....{key.keyTruncated}</code>
                                </TableCell>
                                <TableCell>{new Date(key.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to revoke this key?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. Any applications using the key "{key.name}" will no longer be able to access the API.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleRevokeKey(key.id)}>Revoke Key</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No API keys generated yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
