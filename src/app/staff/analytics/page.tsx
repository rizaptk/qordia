
"use client";

import { useMemo } from 'react';
import { BestSellersChart } from "@/components/analytics/best-sellers-chart";
import { PeakHoursChart } from "@/components/analytics/peak-hours-chart";
import { SalesPerformanceChart } from "@/components/analytics/sales-performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import type { Order, OrderItem, MenuItem } from '@/lib/types';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/auth-store';

export default function AnalyticsPage() {
    const firestore = useFirestore();
    const { user, tenant, isLoading: isAuthLoading } = useAuthStore();
    const TENANT_ID = tenant?.id;

    // Fetch completed orders for revenue-based analytics
    const completedOrdersQuery = useMemoFirebase(() => 
        firestore && TENANT_ID && user
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`), 
            where('status', 'in', ['Served', 'Completed'])
          )
        : null, 
        [firestore, TENANT_ID, user]
    );
    const { data: completedOrders, isLoading: isLoadingCompleted } = useCollection<Order>(completedOrdersQuery);

    // Fetch all orders for operational analytics (like peak hours)
    const allOrdersQuery = useMemoFirebase(() => 
        firestore && TENANT_ID && user ? collection(firestore, `tenants/${TENANT_ID}/orders`) : null, 
        [firestore, TENANT_ID, user]
    );
    const { data: allOrders, isLoading: isLoadingAll } = useCollection<Order>(allOrdersQuery);
    
    // Fetch menu items to map IDs to names for best-sellers chart
    const menuItemsRef = useMemoFirebase(() =>
        firestore && TENANT_ID && user ? collection(firestore, `tenants/${TENANT_ID}/menu_items`) : null,
        [firestore, TENANT_ID, user]
    );
    const { data: menuItems, isLoading: isLoadingMenu } = useCollection<MenuItem>(menuItemsRef);

    const analyticsData = useMemo(() => {
        if (!completedOrders || !allOrders || !menuItems) return null;

        const totalRevenue = completedOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        const totalCompletedOrders = completedOrders.length;
        const avgOrderValue = totalCompletedOrders > 0 ? totalRevenue / totalCompletedOrders : 0;

        const salesPerformance = completedOrders.reduce((acc, order) => {
            const month = format(new Date((order.orderedAt.seconds || 0) * 1000), 'MMM');
            acc[month] = (acc[month] || 0) + (order.totalAmount || 0);
            return acc;
        }, {} as Record<string, number>);

        const salesPerformanceData = Object.entries(salesPerformance)
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a,b) => new Date(`1 ${a.month} 2000`) < new Date(`1 ${b.month} 2000`) ? -1 : 1); // Not perfect sort, but good enough

        const peakHours = allOrders.reduce((acc, order) => {
            const hour = format(new Date((order.orderedAt.seconds || 0) * 1000), 'h a');
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const peakHoursData = Object.entries(peakHours)
            .map(([hour, orders]) => ({ hour, orders }))
            .sort((a, b) => {
                const aHour = parseInt(a.hour.split(' ')[0]);
                const aPeriod = a.hour.split(' ')[1];
                const bHour = parseInt(b.hour.split(' ')[0]);
                const bPeriod = b.hour.split(' ')[1];

                if (aPeriod === 'AM' && bPeriod === 'PM') return -1;
                if (aPeriod === 'PM' && bPeriod === 'AM') return 1;
                if (aHour === 12) return -1;
                if (bHour === 12) return 1;

                return aHour - bHour;
            });


        const bestSellers = allOrders.reduce((acc, order) => {
            (order.items as OrderItem[]).forEach(item => {
                acc[item.menuItemId] = (acc[item.menuItemId] || 0) + item.quantity;
            });
            return acc;
        }, {} as Record<string, number>);

        const bestSellersData = Object.entries(bestSellers)
            .map(([itemId, sales]) => ({
                item: menuItems.find(mi => mi.id === itemId)?.name || 'Unknown Item',
                sales,
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);


        return {
            totalRevenue,
            totalOrders: allOrders.length,
            avgOrderValue,
            salesPerformanceData,
            peakHoursData,
            bestSellersData
        };

    }, [completedOrders, allOrders, menuItems]);
    
    const isLoading = isLoadingAll || isLoadingCompleted || isLoadingMenu || isAuthLoading;

    if (isLoading || !analyticsData) {
        return <div className="text-center text-muted-foreground py-16">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">${analyticsData.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{analyticsData.totalOrders}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">${analyticsData.avgOrderValue.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <SalesPerformanceChart data={analyticsData.salesPerformanceData} />
                <PeakHoursChart data={analyticsData.peakHoursData} />
            </div>
             <div className="grid gap-6">
                <BestSellersChart data={analyticsData.bestSellersData} />
            </div>
        </div>
    )
}
