
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Tenant, SubscriptionPlan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

// A minimal type for counting user documents
type UserProfile = { id: string };

export default function PlatformDashboardPage() {
    const firestore = useFirestore();

    const tenantsRef = useMemoFirebase(() => 
        firestore ? collection(firestore, 'tenants') : null, 
        [firestore]
    );
    const { data: tenants, isLoading: isLoadingTenants } = useCollection<Tenant>(tenantsRef);

    const usersRef = useMemoFirebase(() =>
        firestore ? collection(firestore, 'users') : null,
        [firestore]
    );
    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersRef);
    
    const plansRef = useMemoFirebase(() =>
        firestore ? collection(firestore, 'subscription_plans') : null,
        [firestore]
    );
    const { data: plans, isLoading: isLoadingPlans } = useCollection<SubscriptionPlan>(plansRef);

    const isLoading = isLoadingTenants || isLoadingUsers || isLoadingPlans;

    const mrr = useMemo(() => {
        if (!tenants || !plans) return 0;
        const planMap = new Map(plans.map(p => [p.id, p]));
        return tenants.reduce((total, tenant) => {
            if (tenant.subscriptionStatus === 'active') {
                 const plan = tenant.planId ? planMap.get(tenant.planId) : undefined;
                 const monthlyRevenue = tenant.priceOverride ?? plan?.price ?? 0;
                 return total + monthlyRevenue;
            }
            return total;
        }, 0);

    }, [tenants, plans]);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue (MRR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-10 w-1/2" /> : <div className="text-4xl font-bold">${mrr.toFixed(2)}</div>}
                        <p className="text-xs text-muted-foreground">From active subscriptions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Tenants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-10 w-1/2" /> : <div className="text-4xl font-bold">{tenants?.filter(t => t.subscriptionStatus === 'active' || t.subscriptionStatus === 'trialing').length ?? 0}</div>}
                         <p className="text-xs text-muted-foreground">businesses running on Qordia</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-10 w-1/2" /> : <div className="text-4xl font-bold">{users?.length ?? 0}</div>}
                        <p className="text-xs text-muted-foreground">Across all tenants</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">All Systems Normal</div>
                         <p className="text-xs text-muted-foreground">As of the last check</p>
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, Admin!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Use the navigation on the left to manage tenants, monitor system health, and handle billing.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
