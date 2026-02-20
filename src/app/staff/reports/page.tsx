import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function AdvancedReportingPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Advanced Reporting</CardTitle>
                <CardDescription>
                    This is a premium feature. This page would provide in-depth reports, data visualizations, and export options for sales, customer behavior, and operational efficiency.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-48 flex flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <FileText className="w-12 h-12 mb-4" />
                    <p className="font-semibold">Coming Soon</p>
                    <p>Access advanced reports and data exports here.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
