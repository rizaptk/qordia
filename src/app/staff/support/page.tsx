import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { LifeBuoy } from "lucide-react";

export default function PrioritySupportPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Priority Support</CardTitle>
                <CardDescription>
                    This is a premium feature. This page would offer a dedicated contact form for expedited support requests.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-48 flex flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <LifeBuoy className="w-12 h-12 mb-4" />
                    <p className="font-semibold">Coming Soon</p>
                    <p>Submit priority support tickets here.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
