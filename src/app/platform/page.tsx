import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PlatformDashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Platform Overview</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Tenants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">1</div>
                         <p className="text-xs text-muted-foreground">+1 since last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">Across all tenants</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">All Systems Normal</div>
                         <p className="text-xs text-muted-foreground">As of the last check</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Total Revenue (MRR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">$99</div>
                        <p className="text-xs text-muted-foreground">From 1 active subscription</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome, Admin!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Use the navigation on the left to manage tenants, monitor system health, and handle billing.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
