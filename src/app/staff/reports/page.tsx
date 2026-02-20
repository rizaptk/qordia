'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { TableTurnoverChart } from '@/components/analytics/table-turnover-chart';

type Table = { id: string; tableNumber: string; }

export default function AdvancedReportingPage() {
    const { tenant } = useAuthStore();
    const firestore = useFirestore();
    const TENANT_ID = tenant?.id;

    const allOrdersQuery = useMemoFirebase(() => 
        firestore && TENANT_ID ? query(collection(firestore, `tenants/${TENANT_ID}/orders`)) : null,
    [firestore, TENANT_ID]);

    const allTablesQuery = useMemoFirebase(() =>
        firestore && TENANT_ID ? query(collection(firestore, `tenants/${TENANT_ID}/tables`)) : null,
    [firestore, TENANT_ID]);

    const { data: allOrders, isLoading: isLoadingOrders } = useCollection<Order>(allOrdersQuery);
    const { data: allTables, isLoading: isLoadingTables } = useCollection<Table>(allTablesQuery);

    const tableTurnoverData = useMemo(() => {
        if (!allOrders || !allTables) return [];

        const tableCounts = allOrders.reduce((acc, order) => {
            acc[order.tableId] = (acc[order.tableId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const tableMap = new Map(allTables.map(t => [t.id, t.tableNumber]));

        return Object.entries(tableCounts)
            .map(([tableId, count]) => ({
                table: tableMap.get(tableId) || `ID: ${tableId.substring(0,5)}...`,
                count,
            }))
            .sort((a, b) => b.count - a.count);

    }, [allOrders, allTables]);
    
    const isLoading = isLoadingOrders || isLoadingTables;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Advanced Reporting</CardTitle>
                <CardDescription>
                    In-depth reports, data visualizations, and export options for sales, customer behavior, and operational efficiency.
                </CardDescription>
            </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
                <Card><CardContent className="pt-6">Loading table data...</CardContent></Card>
            ) : (
                <TableTurnoverChart data={tableTurnoverData} />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>Download your data in CSV format.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Export All Orders (CSV)
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                        <Download className="mr-2 h-4 w-4" />
                        Export Sales Summary (CSV)
                    </Button>
                     <p className="text-xs text-muted-foreground">
                        This is a demonstration. Full export functionality is coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
