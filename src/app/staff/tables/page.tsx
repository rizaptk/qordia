
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TENANT_ID = 'qordiapro-tenant';

type Table = {
    id: string;
    tableNumber: string;
    qrCodeIdentifier: string;
}

const newTableSchema = z.object({
  tableNumber: z.string().min(1, { message: "Table number cannot be empty." }),
});
type NewTableFormValues = z.infer<typeof newTableSchema>;

export default function TableManagementPage() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [origin, setOrigin] = useState('');
    const form = useForm<NewTableFormValues>({
        resolver: zodResolver(newTableSchema),
        defaultValues: { tableNumber: '' },
    });

    useEffect(() => {
        // Get the base URL on the client side
        setOrigin(window.location.origin);
    }, []);

    const tablesRef = useMemoFirebase(() => 
        firestore ? collection(firestore, `tenants/${TENANT_ID}/tables`) : null, 
        [firestore]
    );
    const { data: tables, isLoading: isLoadingTables } = useCollection<Table>(tablesRef);

    const activeOrdersQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, `tenants/${TENANT_ID}/orders`), where('status', 'in', ['Placed', 'In Progress', 'Ready', 'Served'])) : null
    , [firestore]);
    const { data: activeOrders } = useCollection<Order>(activeOrdersQuery);

    const activeTableIds = new Set(activeOrders?.map(order => order.tableId));

    const onAddNewTable = async (data: NewTableFormValues) => {
        if (!firestore) return;
        
        const newTableData = {
            tableNumber: data.tableNumber,
            qrCodeIdentifier: `qordia-table-${data.tableNumber.toLowerCase().replace(/\s+/g, '-')}`,
        };
        
        try {
            const tablesCollectionRef = collection(firestore, `tenants/${TENANT_ID}/tables`);
            await addDocumentNonBlocking(tablesCollectionRef, newTableData);
            toast({ title: "Success", description: `Table ${data.tableNumber} has been added.` });
            form.reset();
        } catch (error) {
            console.error("Error adding table:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not add new table." });
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight font-headline">Table Management</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Table
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Table</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onAddNewTable)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="tableNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Table Name / Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 'A12' or 'Patio 5'" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Adding...' : 'Add Table'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Configured Tables</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingTables ? (
                        <p className="text-muted-foreground">Loading tables...</p>
                    ) : tables && tables.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {tables.sort((a,b) => a.tableNumber.localeCompare(b.tableNumber, undefined, {numeric: true})).map(table => {
                                const isActive = activeTableIds.has(table.id);
                                const qrData = encodeURIComponent(`${origin}/menu/${table.id}`);
                                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`;

                                return (
                                    <Card key={table.id} className="flex flex-col">
                                        <CardHeader className="flex-row items-center justify-between">
                                            <CardTitle>{table.tableNumber}</CardTitle>
                                            <Badge variant={isActive ? "destructive" : "secondary"}>
                                                {isActive ? "Occupied" : "Available"}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="flex-grow flex items-center justify-center">
                                             <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className="w-full">
                                                        <QrCode className="mr-2 h-4 w-4" />
                                                        Show QR Code
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-xs">
                                                    <DialogHeader>
                                                        <DialogTitle>QR Code for Table {table.tableNumber}</DialogTitle>
                                                        <DialogDescription>
                                                            Customers can scan this code to order directly from their table. Print and place it on the table.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="p-4 bg-white rounded-md flex items-center justify-center">
                                                        <Image src={qrUrl} alt={`QR Code for Table ${table.tableNumber}`} width={250} height={250} />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center h-24 flex items-center justify-center text-muted-foreground">No tables configured. Add one to get started.</p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
