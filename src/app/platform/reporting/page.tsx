
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Tenant, SubscriptionPlan } from '@/lib/types';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueByPlanChart } from '@/components/analytics/revenue-by-plan-chart';

export default function ReportingPage() {
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

    const isLoading = isLoadingTenants || isLoadingPlans;

    const financialMetrics = useMemo(() => {
        if (!tenants || !plans) {
            return {
                mrr: 0,
                arr: 0,
                activeTenants: 0,
                revenuePerPlan: [],
            };
        }

        const planMap = new Map(plans.map(p => [p.id, p]));
        let totalMrr = 0;
        let activeTenantsCount = 0;
        const revenueByPlanMap = new Map<string, { name: string, revenue: number }>();

        tenants.forEach(tenant => {
            if (tenant.subscriptionStatus === 'active' || tenant.subscriptionStatus === 'trialing') {
                activeTenantsCount++;

                if (tenant.subscriptionStatus === 'active') {
                    const plan = tenant.planId ? planMap.get(tenant.planId) : undefined;
                    const monthlyRevenue = tenant.priceOverride ?? plan?.price ?? 0;

                    if (monthlyRevenue > 0) {
                        totalMrr += monthlyRevenue;
                        
                        if(plan) {
                            const currentPlanRevenue = revenueByPlanMap.get(plan.id) ?? { name: plan.name, revenue: 0 };
                            currentPlanRevenue.revenue += monthlyRevenue;
                            revenueByPlanMap.set(plan.id, currentPlanRevenue);
                        }
                    }
                }
            }
        });
        
        const revenuePerPlan = Array.from(revenueByPlanMap.values());

        return {
            mrr: totalMrr,
            arr: totalMrr * 12,
            activeTenants: activeTenantsCount,
            revenuePerPlan: revenuePerPlan,
        };

    }, [tenants, plans]);

    const renderMetricCard = (title: string, value: string, description: string, loading: boolean) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <>
                        <Skeleton className="h-10 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </>
                ) : (
                    <>
                        <div className="text-4xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">Financial Reporting</h1>
                <p className="text-muted-foreground">Key business intelligence metrics for your SaaS platform.</p>
            </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {renderMetricCard("MRR", `$${financialMetrics.mrr.toFixed(2)}`, "Monthly Recurring Revenue", isLoading)}
            {renderMetricCard("ARR", `$${financialMetrics.arr.toFixed(2)}`, "Annual Recurring Revenue", isLoading)}
            {renderMetricCard("Active Tenants", financialMetrics.activeTenants.toString(), "Includes active and trialing subscriptions", isLoading)}
            {renderMetricCard("LTV Estimate", "$0", "Customer Lifetime Value (placeholder)", isLoading)}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {renderMetricCard("Churn Rate", "0%", "Monthly churn (placeholder)", isLoading)}
             {renderMetricCard("Conversion Rate", "0%", "Free to paid conversion (placeholder)", isLoading)}
             {renderMetricCard("Avg. Revenue/Account", `$${financialMetrics.activeTenants > 0 ? (financialMetrics.mrr / financialMetrics.activeTenants).toFixed(2) : '0.00'}`, "ARPA (monthly)", isLoading)}
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>Monthly recurring revenue generated by each subscription plan.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="w-full h-[300px] flex items-center justify-center">
                        <Skeleton className="w-full h-full" />
                    </div>
                ) : (
                    <RevenueByPlanChart data={financialMetrics.revenuePerPlan} />
                )}
            </CardContent>
        </Card>
    </div>
  );
}
