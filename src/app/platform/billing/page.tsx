import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div>
        <Card>
            <CardHeader>
                <CardTitle>Billing & Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This is a placeholder for the billing and subscriptions module. Functionality to manage subscription plans and view tenant billing status will be implemented here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
