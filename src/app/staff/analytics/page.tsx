import { analyticsData } from "@/lib/data";
import { BestSellersChart } from "@/components/analytics/best-sellers-chart";
import { PeakHoursChart } from "@/components/analytics/peak-hours-chart";
import { SalesPerformanceChart } from "@/components/analytics/sales-performance-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                    Insights into your sales and performance.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">1,250</div>
                        <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">$36.18</div>
                        <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <SalesPerformanceChart data={analyticsData.salesPerformance} />
                <PeakHoursChart data={analyticsData.peakHours} />
            </div>
             <div className="grid gap-6">
                <BestSellersChart data={analyticsData.bestSellers} />
            </div>
        </div>
    )
}
