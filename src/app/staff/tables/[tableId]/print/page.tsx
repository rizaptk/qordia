
'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { QordiaLogo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Table = {
    id: string;
    tableNumber: string;
}

export default function PrintQrCodePage({ params }: { params: { tableId: string } }) {
    const { tableId } = params;
    const { tenant } = useAuthStore();
    const firestore = useFirestore();
    const [origin, setOrigin] = useState('');
    const qrCodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);
    
    const TENANT_ID = tenant?.id;

    const tableRef = useMemoFirebase(() => 
        firestore && TENANT_ID ? doc(firestore, `tenants/${TENANT_ID}/tables`, tableId) : null,
        [firestore, TENANT_ID, tableId]
    );
    const { data: table, isLoading } = useDoc<Table>(tableRef);

    if (isLoading || !origin) {
        return <div className="flex items-center justify-center min-h-screen">Loading QR Code...</div>
    }
    
    if (!tenant || !table) {
        return <div className="flex items-center justify-center min-h-screen">Could not find table or tenant data.</div>
    }
    
    const qrData = encodeURIComponent(`${origin}/${TENANT_ID}/table/${table.id}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${qrData}&format=png`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-muted/40 min-h-screen p-4 sm:p-8 flex flex-col items-center">
            {/* Header with actions, hidden on print */}
            <div className="w-full max-w-lg mb-8 flex justify-between items-center print:hidden">
                <Button asChild variant="outline">
                    <Link href="/staff/tables">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tables
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <a href={qrUrl} download={`qordia-qr-table-${table.tableNumber}.png`}>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </a>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Printable Content */}
            <div ref={qrCodeRef} className="w-full max-w-lg bg-background p-8 rounded-lg shadow-lg border-dashed text-center space-y-6 printable-area">
                <div className="flex flex-col items-center gap-2">
                    <QordiaLogo className="w-12 h-12 text-primary" />
                    <h1 className="text-2xl font-bold font-headline">{tenant.name}</h1>
                </div>
                
                <div className="p-4 bg-white inline-block rounded-md">
                    <Image 
                        src={qrUrl} 
                        alt={`QR Code for Table ${table.tableNumber}`} 
                        width={300} 
                        height={300} 
                        priority
                    />
                </div>
                
                <div className="space-y-2">
                    <p className="text-xl font-semibold">Scan to Order</p>
                    <h2 className="text-5xl font-extrabold bg-primary/10 text-primary p-4 rounded-md inline-block">
                        Table {table.tableNumber}
                    </h2>
                </div>

                <p className="text-xs text-muted-foreground pt-4">
                    Powered by Qordia
                </p>
            </div>
            
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background-color: white !important;
                    }
                    .printable-area {
                        margin: auto;
                        box-shadow: none;
                        border: 2px dashed #ccc;
                    }
                }
            `}</style>
        </div>
    );
}
