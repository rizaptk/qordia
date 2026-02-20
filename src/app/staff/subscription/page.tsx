
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import type { SubscriptionPlan } from '@/lib/types';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Gem, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SubscriptionPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { tenant, plan: currentPlan } = useAuthStore();

    const plansRef = useMemoFirebase(() => 
        firestore ? collection(firestore, 'subscription_plans') : null,
        [firestore]
    );
    const { data: plans, isLoading } = useCollection<SubscriptionPlan>(plansRef);

    const sortedPlans = useMemo(() => {
        if (!plans) return [];
        return [...plans].sort((a, b) => a.price - b.price);
    }, [plans]);

    const handleSubscribe = (plan: SubscriptionPlan) => {
        if (!firestore || !tenant) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update subscription. Tenant not found.' });
            return;
        }

        const tenantRef = doc(firestore, 'tenants', tenant.id);
        const updateData = {
            planId: plan.id,
            subscriptionStatus: 'active',
            nextBillingDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Set next billing 30 days out
        };
        
        updateDocumentNonBlocking(tenantRef, updateData);

        toast({
            title: 'Subscription Updated!',
            description: `You are now subscribed to the ${plan.name} plan.`
        });
    }

    if (isLoading) {
        return <div className="text-center text-muted-foreground py-16">Loading subscription plans...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Subscription</CardTitle>
                    <CardDescription>Choose the plan that's right for your business. Your current plan is highlighted.</CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPlans?.map(plan => {
                    const isCurrent = plan.id === currentPlan?.id;
                    return (
                        <Card key={plan.id} className={cn(
                            "flex flex-col",
                            isCurrent && "border-primary border-2"
                        )}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                        <Gem className={cn(isCurrent ? "text-primary": "text-muted-foreground")} />
                                        {plan.name}
                                    </CardTitle>
                                    {isCurrent && <span className="text-primary font-semibold text-sm">Current Plan</span>}
                                </div>
                                <CardDescription>
                                    <span className="text-3xl font-extrabold">${plan.price}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <Table2 className="h-4 w-4 text-green-500" />
                                        <span className="text-muted-foreground">
                                            {plan.tableLimit === 0 || plan.tableLimit === undefined ? 'Unlimited tables' : `Up to ${plan.tableLimit} tables`}
                                        </span>
                                    </li>
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full" 
                                    disabled={isCurrent}
                                    onClick={() => handleSubscribe(plan)}
                                >
                                    {isCurrent ? "This is your current plan" : `Switch to ${plan.name}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
