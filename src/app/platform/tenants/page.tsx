import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TenantManagementPage() {
  return (
    <div>
        <Card>
            <CardHeader>
                <CardTitle>Tenant Management</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This is a placeholder for the tenant management module. Functionality to list, create, and manage tenants will be implemented here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
