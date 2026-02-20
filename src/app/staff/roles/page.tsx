import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CustomRolesPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Custom Staff Roles</CardTitle>
                <CardDescription>
                    This is a premium feature. This page would allow managers to create, edit, and assign custom roles and permissions to their staff members.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="h-48 flex flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <Users className="w-12 h-12 mb-4" />
                    <p className="font-semibold">Coming Soon</p>
                    <p>Manage custom staff roles and permissions here.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
