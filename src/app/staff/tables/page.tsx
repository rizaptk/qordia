

'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useAuthStore } from '@/stores/auth-store';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, QrCode, Printer, Download, MoreHorizontal, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { QordiaLogo } from '@/components/logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Table = {
    id: string;
    tableNumber: string;
    qrCodeIdentifier: string;
    menuStyle?: 'default' | 'carousel' | '3d' | 'promo';
}

const newTableSchema = z.object({
  tableNumber: z.string().min(1, { message: "Table number cannot be empty." }),
  menuStyle: z.enum(['default', 'carousel', '3d', 'promo']).default('default'),
});
type NewTableFormValues = z.infer<typeof newTableSchema>;

export default function TableManagementPage() {
    const firestore = useFirestore();
    const { tenant, tableLimit, hasAdvancedMenuStyles } = useAuthStore();
    const TENANT_ID = tenant?.id;

    const [isTableFormOpen, setIsTableFormOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
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
        defaultValues: { tableNumber: '', menuStyle: 'default' },
    });
    
    useEffect(() => {
        if (editingTable) {
            form.reset({
                tableNumber: editingTable.tableNumber,
                menuStyle: editingTable.menuStyle || 'default',
            });
        } else {
            form.reset({
                tableNumber: '',
                menuStyle: 'default'
            });
        }
    }, [editingTable, form]);

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


    const onTableFormSubmit = async (data: NewTableFormValues) => {
        if (!firestore || !TENANT_ID) return;
        
        try {
            if (editingTable) {
                const tableRef = doc(firestore, `tenants/${TENANT_ID}/tables`, editingTable.id);
                await updateDocumentNonBlocking(tableRef, data);
                toast({ title: "Success", description: "Table details updated." });
            } else {
                const newTableData = {
                    tableNumber: data.tableNumber,
                    menuStyle: data.menuStyle,
                    qrCodeIdentifier: `qordia-table-${data.tableNumber.toLowerCase().replace(/\s+/g, '-')}`,
                };
                const tablesCollectionRef = collection(firestore, `tenants/${TENANT_ID}/tables`);
                await addDocumentNonBlocking(tablesCollectionRef, newTableData);
                toast({ title: "Success", description: `Table ${data.tableNumber} has been added.` });
            }
            form.reset();
            setIsTableFormOpen(false);
            setEditingTable(null);
        } catch (error) {
            console.error("Error saving table:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not save table." });
        }
    };
    
    const handleShowQrDialog = (table: Table) => {
        setSelectedTable(table);
        setIsQrDialogOpen(true);
    };
    
    const handleEditTable = (table: Table) => {
        setEditingTable(table);
        setIsTableFormOpen(true);
    };

    const handleDeleteTable = (tableId: string) => {
        if (!firestore || !TENANT_ID) return;
        const tableRef = doc(firestore, `tenants/${TENANT_ID}/tables`, tableId);
        deleteDocumentNonBlocking(tableRef);
        toast({ title: 'Table Deleted', description: 'The table has been successfully removed.' });
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
                 <Dialog open={isTableFormOpen} onOpenChange={(open) => { setIsTableFormOpen(open); if(!open) setEditingTable(null); }}>
                    <DialogTrigger asChild>
                        <Button disabled={isLimitReached} onClick={() => setIsTableFormOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Table
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTable ? `Edit Table` : 'Add New Table'}</DialogTitle>
                            <DialogDescription>{editingTable ? `Update the details for table ${editingTable.tableNumber}.` : 'Add a new table or seating area to your restaurant.'}</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onTableFormSubmit)} className="space-y-4">
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
                                {hasAdvancedMenuStyles && (
                                    <FormField
                                        control={form.control}
                                        name="menuStyle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Menu Display Style</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a display style" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="default">Default List</SelectItem>
                                                        <SelectItem value="carousel">Carousel Slides</SelectItem>
                                                        <SelectItem value="3d">3D Slide</SelectItem>
                                                        <SelectItem value="promo">Promotional</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Choose a premium menu style for this table. (Pro feature)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                <DialogFooter>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Saving...' : 'Save Table'}
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
                                    <AlertDialog key={table.id}>
                                        <Card className="flex flex-col">
                                            <CardHeader className="flex-row items-start justify-between pb-2">
                                                <div>
                                                    <CardTitle>{table.tableNumber}</CardTitle>
                                                    <Badge variant={isActive ? "destructive" : "secondary"}>
                                                        {isActive ? "Occupied" : "Available"}
                                                    </Badge>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => handleEditTable(table)}>
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </CardHeader>
                                            <CardContent className="flex-grow flex items-center justify-center pt-2">
                                                <Button variant="outline" className="w-full" onClick={() => handleShowQrDialog(table)}>
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    Get QR Code
                                                </Button>
                                            </CardContent>
                                        </Card>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete table "{table.tableNumber}". This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteTable(table.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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
                    <DialogHeader className="sr-only">
                        <DialogTitle>
                            {selectedTable ? `QR Code for Table ${selectedTable.tableNumber}` : 'QR Code'}
                        </DialogTitle>
                        <DialogDescription>
                            Scan this QR code to view the menu and place your order.
                        </DialogDescription>
                    </DialogHeader>
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
