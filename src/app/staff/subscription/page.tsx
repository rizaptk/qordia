
'use client';

import { useMemo, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { SubscriptionPlan } from '@/lib/types';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Gem, Table2, Hourglass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PaymentProofDialog } from '@/components/staff/payment-proof-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SubscriptionPage() {
    const firestore = useFirestore();
    const { tenant, plan: currentPlan } = useAuthStore();
    const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);

    const plansRef = useMemoFirebase(() => 
        firestore ? collection(firestore, 'subscription_plans') : null,
        [firestore]
    );
    const { data: plans, isLoading } = useCollection<SubscriptionPlan>(plansRef);

    const sortedPlans = useMemo(() => {
        if (!plans) return [];
        return [...plans].sort((a, b) => a.price - b.price);
    }, [plans]);

    const handleSelectPlan = (plan: SubscriptionPlan) => {
        setSelectedPlanForPayment(plan);
    };
    
    if (tenant?.subscriptionStatus === 'pending_payment') {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="max-w-lg text-center">
                    <CardHeader>
                        <CardTitle>Payment Pending</CardTitle>
                        <CardDescription>Your subscription is awaiting payment verification.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <Hourglass className="h-4 w-4" />
                            <AlertTitle>Verification in Progress</AlertTitle>
                            <AlertDescription>
                                Our team is currently reviewing your payment proof. Your plan will be activated as soon as it's confirmed. Thank you for your patience!
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return <div className="text-center text-muted-foreground py-16">Loading subscription plans...</div>;
    }

    return (
        <>
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
                        const canTrial = !tenant?.hasUsedTrial && plan.trialPeriodDays && plan.trialPeriodDays > 0;
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
                                        {isCurrent && <Badge variant="default">Current Plan</Badge>}
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                         <div>
                                            <span className="text-3xl font-extrabold text-foreground">${plan.price.toFixed(2)}</span>
                                            <span className="text-muted-foreground">/month</span>
                                        </div>
                                        {canTrial ? (
                                            <Badge variant="accent">{plan.trialPeriodDays}-Day Free Trial</Badge>
                                        ) : tenant?.hasUsedTrial && plan.trialPeriodDays && plan.trialPeriodDays > 0 ? (
                                            <Badge variant="outline">Trial Previously Used</Badge>
                                        ) : null}
                                    </div>
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
                                        onClick={() => handleSelectPlan(plan)}
                                    >
                                        {isCurrent ? "This is your current plan" : `Switch to ${plan.name}`}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
            <PaymentProofDialog 
                isOpen={!!selectedPlanForPayment}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedPlanForPayment(null);
                    }
                }}
                plan={selectedPlanForPayment}
            />
        </>
    );
}
