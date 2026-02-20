import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Terminal } from "lucide-react";

export default function ApiAccessPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                    This is a premium feature. This page would provide API keys and documentation for integrating Qordia with other services.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-48 flex flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <Terminal className="w-12 h-12 mb-4" />
                    <p className="font-semibold">Coming Soon</p>
                    <p>Manage API keys and view documentation here.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
