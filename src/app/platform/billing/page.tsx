
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Tenant, SubscriptionPlan } from '@/lib/types';
import { format } from 'date-fns';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BillingPage() {
    const firestore = useFirestore();

    const tenantsRef = useMemoFirebase(() => 
        firestore ? collection(firestore, 'tenants') : null, 
        [firestore]
    );
    const { data: tenants, isLoading: isLoadingTenants } = useCollection<Tenant>(tenantsRef);
    
    const plansRef = useMemoFirebase(() =>
        firestore ? collection(firestore, 'subscription_plans') : null,
        [firestore]
    );
    const { data: plans, isLoading: isLoadingPlans } = useCollection<SubscriptionPlan>(plansRef);

    const planMap = new Map(plans?.map(p => [p.id, p.name]));
    const isLoading = isLoadingTenants || isLoadingPlans;

    const getStatusVariant = (status: Tenant['subscriptionStatus']) => {
        switch (status) {
            case 'active': return 'accent';
            case 'trialing': return 'default';
            case 'overdue': return 'destructive';
            case 'canceled': return 'secondary';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Billing & Subscriptions</CardTitle>
                <CardDescription>
                    Manage tenant subscriptions and view billing status.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    This module provides a centralized view of all tenant subscription data. From here, you can track which plan each tenant is on and their current payment status.
                </p>
                <Button asChild>
                    <Link href="/platform/billing/plans">Manage Plans</Link>
                </Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Tenant Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Next Billing</TableHead>
                            <TableHead className="text-right">Monthly Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Loading subscriptions...</TableCell>
                            </TableRow>
                        ) : tenants && tenants.length > 0 ? (
                            tenants.map(tenant => {
                                const plan = plans?.find(p => p.id === tenant.planId);
                                return (
                                    <TableRow key={tenant.id}>
                                        <TableCell className="font-medium">{tenant.name}</TableCell>
                                        <TableCell>{plan?.name ?? 'No Plan'}</TableCell>
                                        <TableCell>
                                            {tenant.subscriptionStatus ? (
                                                <Badge variant={getStatusVariant(tenant.subscriptionStatus)}>{tenant.subscriptionStatus}</Badge>
                                            ) : (
                                                <Badge variant="outline">N/A</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {tenant.nextBillingDate ? format(new Date(tenant.nextBillingDate.seconds * 1000), 'PPP') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {plan ? `$${plan.price.toFixed(2)}` : '$0.00'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No tenants found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
