import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div>
        <Card>
            <CardHeader>
                <CardTitle>Billing & Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    This module is for managing the financial aspects of the Qordia SaaS platform. From here, platform admins can define subscription plans (e.g., Basic, Pro), view the current subscription status of all tenants, and conceptually, handle invoicing.
                </p>
                <br />
                <p className="text-muted-foreground">
                    While this view is for administrators, a future 'self-service' version of this would be exposed to tenant managers, allowing them to upgrade their plans directly.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}
