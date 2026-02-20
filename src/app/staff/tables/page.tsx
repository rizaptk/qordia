'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { collection, query, where } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, QrCode, Printer, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QordiaLogo } from '@/components/logo';
import { cn } from '@/lib/utils';


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

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [origin, setOrigin] = useState('');
    const qrDialogContentRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);


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
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error("Error adding table:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not add new table." });
        }
    };
    
    const handleShowQrDialog = (table: Table) => {
        setSelectedTable(table);
        setIsQrDialogOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const qrUrl = selectedTable && origin 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`${origin}/${TENANT_ID}/table/${selectedTable.id}`)}&format=png`
        : '';
    
    const downloadFilename = selectedTable ? `qordia-qr-table-${selectedTable.tableNumber}.png` : 'qordia-qr.png';

    return (
        <div className="space-y-6">
            {/* Print Styles: Hides everything but the QR dialog when printing */}
            <style jsx global>{`
                @media print {
                    body > *:not(.printable-dialog-container) {
                        display: none !important;
                    }
                    .printable-dialog-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .printable-content {
                        border: 2px dashed #ccc;
                    }
                    .non-printable {
                        display: none !important;
                    }
                }
            `}</style>
            
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
                 <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                                            <Button variant="outline" className="w-full" onClick={() => handleShowQrDialog(table)}>
                                                <QrCode className="mr-2 h-4 w-4" />
                                                Get QR Code
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

            <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                <DialogContent className="sm:max-w-md printable-dialog-container" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <div ref={qrDialogContentRef} className="bg-background p-8 rounded-lg text-center space-y-6 printable-content">
                        {selectedTable && tenant && (
                            <>
                                <div className="flex flex-col items-center gap-2">
                                    <QordiaLogo className="w-12 h-12 text-primary" />
                                    <h1 className="text-2xl font-bold font-headline">{tenant.name}</h1>
                                </div>
                                
                                {qrUrl && (
                                    <div className="p-4 bg-white inline-block rounded-md">
                                        <Image 
                                            src={qrUrl} 
                                            alt={`QR Code for Table ${selectedTable.tableNumber}`} 
                                            width={250} 
                                            height={250}
                                            priority
                                        />
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <p className="text-xl font-semibold">Scan to Order</p>
                                    <h2 className="text-5xl font-extrabold bg-primary/10 text-primary p-4 rounded-md inline-block">
                                        Table {selectedTable.tableNumber}
                                    </h2>
                                </div>

                                <p className="text-xs text-muted-foreground pt-4">
                                    Powered by Qordia
                                </p>
                            </>
                        )}
                    </div>
                     <DialogFooter className="sm:justify-center non-printable">
                        <Button type="button" variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <a href={qrUrl} download={downloadFilename}>
                            <Button type="button">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </a>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
