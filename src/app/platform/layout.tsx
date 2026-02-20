
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from '@/firebase';
import { LayoutGrid, Building2, Activity, CreditCard, LogOut, Loader2, LifeBuoy } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isPlatformAdmin, isLoading } = useAuthStore();
  
  useEffect(() => {
    if (isLoading) {
      return; 
    }
    if (!user || !isPlatformAdmin) {
      router.push('/login'); 
    }
  }, [user, isPlatformAdmin, isLoading, router]);

  const getPageTitle = () => {
    if (pathname.includes('/tenants')) return 'Tenant Management';
    if (pathname.includes('/monitoring')) return 'System Monitoring';
    if (pathname.includes('/billing')) return 'Billing & Subscriptions';
    if (pathname.includes('/support')) return 'Support Tickets';
    return 'Platform Dashboard';
  }

  if (isLoading || !user || !isPlatformAdmin) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Verifying admin access...</p>
        </div>
    );
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
             <div className="p-2 bg-primary rounded-lg">
                <LayoutGrid className="w-6 h-6 text-primary-foreground" />
             </div>
             <h2 className="text-lg font-bold font-headline">Qordia Platform</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/platform"}>
                <Link href="/platform">
                  <LayoutGrid />
                  <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.includes("/platform/tenants")}>
                <Link href="/platform/tenants">
                  <Building2 />
                  <span className="group-data-[collapsible=icon]:hidden">Tenants</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.includes("/platform/monitoring")}>
                <Link href="/platform/monitoring">
                  <Activity />
                  <span className="group-data-[collapsible=icon]:hidden">Monitoring</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.includes("/platform/billing")}>
                <Link href="/platform/billing">
                  <CreditCard />
                  <span className="group-data-[collapsible=icon]:hidden">Billing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.includes("/platform/support")}>
                <Link href="/platform/support">
                  <LifeBuoy />
                  <span className="group-data-[collapsible=icon]:hidden">Support</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL ?? "https://picsum.photos/seed/admin/100/100"} data-ai-hint="person portrait" />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">{user.displayName ?? 'Platform Admin'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => auth?.signOut()}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-semibold hidden md:block">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="outline">
                    Customer View
                  </Button>
                </Link>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-muted/30 min-h-[calc(100vh-4rem)]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
