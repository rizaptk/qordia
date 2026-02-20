'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, BookOpen, Table2, BarChart3, Users, Cog } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffDashboardPage() {
    const { user, tenant, isLoading } = useAuthStore();

    const welcomeMessage = user ? `Welcome back, ${user.displayName || user.email?.split('@')[0]}!` : 'Welcome!';
    const shopName = tenant ? tenant.name : 'your business';

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">{welcomeMessage}</h1>
                <p className="text-muted-foreground">Here's a quick overview of {shopName}.</p>
            </div>
            
            {/* Quick Stats - can be wired up to live data later */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Active Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">0</div>
                         <p className="text-xs text-muted-foreground">orders currently in progress</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Today's Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">$0.00</div>
                         <p className="text-xs text-muted-foreground">from 0 completed orders</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Open Tables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">0</div>
                         <p className="text-xs text-muted-foreground">of 0 tables are available</p>
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
                    <Button variant="outline" className="flex-col h-24" asChild>
                        <Link href="/staff/analytics"><BarChart3 className="w-6 h-6 mb-2" />View Analytics</Link>
                    </Button>
                     <Button variant="outline" className="flex-col h-24" asChild>
                        <Link href="/staff/roles"><Users className="w-6 h-6 mb-2" />Manage Staff</Link>
                    </Button>
                     <Button variant="outline" className="flex-col h-24" asChild>
                        <Link href="/staff/settings"><Cog className="w-6 h-6 mb-2" />Shop Settings</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
