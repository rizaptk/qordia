'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, BookOpen, Table2, BarChart3, Users, Cog, Gem } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { startOfDay, endOfDay } from 'date-fns';

export default function StaffDashboardPage() {
    const { user, tenant, isLoading, hasAnalyticsFeature, hasCustomRolesFeature } = useAuthStore();
    const firestore = useFirestore();
    const TENANT_ID = tenant?.id;

    const welcomeMessage = user ? `Welcome back, ${user.displayName || user.email?.split('@')[0]}!` : 'Welcome!';
    const shopName = tenant ? tenant.name : 'your business';

    // --- Data fetching ---
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const activeOrdersQuery = useMemoFirebase(() =>
      firestore && TENANT_ID
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`),
            where('status', 'in', ['Placed', 'In Progress', 'Ready', 'Served'])
          )
        : null,
      [firestore, TENANT_ID]
    );
    const { data: activeOrders, isLoading: isLoadingActive } = useCollection<Order>(activeOrdersQuery);
    
    const todaysCompletedOrdersQuery = useMemoFirebase(() =>
        firestore && TENANT_ID
        ? query(
            collection(firestore, `tenants/${TENANT_ID}/orders`),
            where('status', '==', 'Completed'),
            where('orderedAt', '>=', Timestamp.fromDate(todayStart)),
            where('orderedAt', '<=', Timestamp.fromDate(todayEnd))
        )
        : null,
    [firestore, TENANT_ID, todayStart, todayEnd]);
    const { data: todaysCompletedOrders, isLoading: isLoadingRevenue } = useCollection<Order>(todaysCompletedOrdersQuery);

    const tablesQuery = useMemoFirebase(() =>
      firestore && TENANT_ID ? collection(firestore, `tenants/${TENANT_ID}/tables`) : null,
      [firestore, TENANT_ID]
    );
    const { data: tables, isLoading: isLoadingTables } = useCollection<{id: string}>(tablesQuery);

    const stats = useMemo(() => {
        const activeOrdersCount = activeOrders?.length ?? 0;
        const totalTables = tables?.length ?? 0;
        const openTables = totalTables - new Set(activeOrders?.map(o => o.tableId)).size;
        
        const todaysRevenue = todaysCompletedOrders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) ?? 0;
        const todaysCompletedOrdersCount = todaysCompletedOrders?.length ?? 0;

        return {
            activeOrdersCount,
            todaysRevenue,
            todaysCompletedOrdersCount,
            totalTables,
            openTables,
        };
    }, [activeOrders, todaysCompletedOrders, tables]);

    const isDataLoading = isLoading || isLoadingActive || isLoadingRevenue || isLoadingTables;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        )
    }

    const RevenueCardContent = () => (
      <>
        <CardHeader>
          <CardTitle>Today's Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {isDataLoading ? (
            <>
              <Skeleton className="h-10 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </>
          ) : (
            <>
              <div className="text-4xl font-bold">${stats.todaysRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">from {stats.todaysCompletedOrdersCount} completed orders</p>
            </>
          )}
        </CardContent>
      </>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{welcomeMessage}</h1>
                <p className="text-muted-foreground">Here's a quick overview of {shopName}.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Active Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isDataLoading ? (
                        <>
                          <Skeleton className="h-10 w-1/2 mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </>
                      ) : (
                        <>
                          <div className="text-4xl font-bold">{stats.activeOrdersCount}</div>
                          <p className="text-xs text-muted-foreground">orders currently in progress</p>
                        </>
                      )}
                    </CardContent>
                </Card>
                
                {hasAnalyticsFeature ? (
                  <Link href="/staff/analytics">
                    <Card className="hover:bg-muted/50 transition-colors">
                      <RevenueCardContent />
                    </Card>
                  </Link>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Card>
                          <RevenueCardContent />
                        </Card>
                        <div className="absolute top-2 right-2 p-1 bg-yellow-400 rounded-full pointer-events-none">
                            <Gem className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View detailed analytics.</p>
                      <p>This is a premium feature.</p>
                      <Button asChild variant="link" size="sm" className="p-0 h-auto text-primary">
                        <Link href="/staff/subscription">Upgrade to unlock</Link>
                      </Button>
                    </TooltipContent>
                  </Tooltip>
                )}

                 <Card>
                    <CardHeader>
                        <CardTitle>Open Tables</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {isDataLoading ? (
                        <>
                          <Skeleton className="h-10 w-1/2 mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </>
                      ) : (
                        <>
                          <div className="text-4xl font-bold">{stats.openTables}</div>
                          <p className="text-xs text-muted-foreground">of {stats.totalTables} tables are available</p>
                        </>
                       )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>New Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">0</div>
                         <p className="text-xs text-muted-foreground">new customers today</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Jump right into managing your business.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                     <Button variant="outline" className="flex-col h-24" asChild>
                        <Link href="/staff/pds"><ChefHat className="w-6 h-6 mb-2" />Kitchen Display</Link>
                    </Button>
                     <Button variant="outline" className="flex-col h-24" asChild>
                        <Link href="/staff/menu"><BookOpen className="w-6 h-6 mb-2" />Manage Menu</Link>
                    </Button>
                     <Button variant="outline" className="flex-col h-24" asChild>
                        <Link href="/staff/tables"><Table2 className="w-6 h-6 mb-2" />Manage Tables</Link>
                    </Button>
                    
                    {hasAnalyticsFeature ? (
                        <Button variant="outline" className="flex-col h-24" asChild>
                            <Link href="/staff/analytics"><BarChart3 className="w-6 h-6 mb-2" />View Analytics</Link>
                        </Button>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative w-full h-24">
                                    <Button variant="outline" className="flex-col h-24 w-full" disabled>
                                        <BarChart3 className="w-6 h-6 mb-2" />
                                        View Analytics
                                    </Button>
                                    <div className="absolute top-1 right-1 p-1 bg-yellow-400 rounded-full pointer-events-none">
                                        <Gem className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This is a premium feature.</p>
                                <Button asChild variant="link" size="sm" className="p-0 h-auto text-primary">
                                    <Link href="/staff/subscription">Upgrade to unlock</Link>
                                </Button>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {hasCustomRolesFeature ? (
                         <Button variant="outline" className="flex-col h-24" asChild>
                            <Link href="/staff/roles"><Users className="w-6 h-6 mb-2" />Manage Staff</Link>
                        </Button>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative w-full h-24">
                                    <Button variant="outline" className="flex-col h-24 w-full" disabled>
                                        <Users className="w-6 h-6 mb-2" />
                                        Manage Staff
                                    </Button>
                                     <div className="absolute top-1 right-1 p-1 bg-yellow-400 rounded-full pointer-events-none">
                                        <Gem className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>This is a premium feature.</p>
                                <Button asChild variant="link" size="sm" className="p-0 h-auto text-primary">
                                    <Link href="/staff/subscription">Upgrade to unlock</Link>
                                </Button>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    
                     <Button variant="outline" className="flex-col h-24" asChild>
                        <Link href="/staff/settings"><Cog className="w-6 h-6 mb-2" />Shop Settings</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
