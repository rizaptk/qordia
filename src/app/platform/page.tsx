'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Tenant } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// A minimal type for counting user documents
type UserProfile = { id: string };

export default function PlatformDashboardPage() {
    const { firestore } = useFirebase();

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

    const isLoading = isLoadingTenants || isLoadingUsers;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Platform Overview</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Tenants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-10 w-1/2" /> : <div className="text-4xl font-bold">{tenants?.length ?? 0}</div>}
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
                 <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue (MRR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">$0</div>
                        <p className="text-xs text-muted-foreground">From 0 active subscriptions</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, Admin!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Use the navigation on the left to manage tenants, monitor system health, and handle billing.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
