
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { collection, query, where } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';

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
    const firestore = useFirestore();
    const { tenant, tableLimit } = useAuthStore();
    const TENANT_ID = tenant?.id;

    const { toast } = useToast();
    const form = useForm<NewTableFormValues>({
        resolver: zodResolver(newTableSchema),
        defaultValues: { tableNumber: '' },
    });

    const tablesRef = useMemoFirebase(() => 
        firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/tables`) : null, 
        [firestore, TENANT_ID]
    );
    const { data: tables, isLoading: isLoadingTables } = useCollection<Table>(tablesRef);

    const activeOrdersQuery = useMemoFirebase(() =>
        firestore && TENANT_ID ? query(collection(firestore, `tenants/${TENANT_ID}/orders`), where('status', 'in', ['Placed', 'In Progress', 'Ready', 'Served'])) : null
    , [firestore, TENANT_ID]);
    const { data: activeOrders } = useCollection<Order>(activeOrdersQuery);

    const activeTableIds = new Set(activeOrders?.map(order => order.tableId));
    const tableCount = tables?.length ?? 0;
    const isLimitReached = tableLimit !== null && tableLimit !== 0 && tableCount >= tableLimit;


    const onAddNewTable = async (data: NewTableFormValues) => {
        if (!firestore || !TENANT_ID) return;
        
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Table Quota</CardTitle>
                </CardHeader>
                <CardContent>
                    {tableLimit === null ? (
                        <p className="text-muted-foreground">Loading quota...</p>
                    ) : tableLimit === 0 ? (
                        <p className="text-lg font-medium">You have <span className="text-primary">unlimited</span> tables.</p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-muted-foreground">
                                You have used <span className="font-bold text-foreground">{tableCount}</span> of your <span className="font-bold text-foreground">{tableLimit}</span> available tables.
                            </p>
                            <Progress value={(tableCount / tableLimit) * 100} />
                            <p className="text-sm font-medium">
                                {tableLimit - tableCount} tables remaining.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Configured Tables</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button disabled={isLimitReached}>
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

            {isLimitReached && (
                 <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-center">
                    <p className="text-sm text-destructive-foreground">
                        You have reached your limit of {tableLimit} tables.
                    </p>
                    <Button asChild variant="link" className="text-destructive-foreground h-auto p-0">
                         <Link href="/staff/subscription">Please upgrade your plan to add more.</Link>
                    </Button>
                </div>
            )}
            
            <Card>
                <CardContent className="pt-6">
                    {isLoadingTables ? (
                        <p className="text-muted-foreground">Loading tables...</p>
                    ) : tables && tables.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {tables.sort((a,b) => a.tableNumber.localeCompare(b.tableNumber, undefined, {numeric: true})).map(table => {
                                const isActive = activeTableIds.has(table.id);
                                return (
                                    <Card key={table.id} className="flex flex-col">
                                        <CardHeader className="flex-row items-center justify-between">
                                            <CardTitle>{table.tableNumber}</CardTitle>
                                            <Badge variant={isActive ? "destructive" : "secondary"}>
                                                {isActive ? "Occupied" : "Available"}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="flex-grow flex items-center justify-center">
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={`/staff/tables/${table.id}/print`}>
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    Get QR Code
                                                </Link>
                                            </Button>
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
        </div>
    );
}
