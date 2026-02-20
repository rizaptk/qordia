
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from '@/firebase';
import { BarChart3, Bell, ChefHat, Truck, Banknote, BookOpen, Table2, Loader2, Gem, LogOut, CreditCard, FileText, LifeBuoy, Terminal, Users } from "lucide-react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QordiaLogo } from "@/components/logo";

const staffRoles = ['manager', 'barista', 'service', 'cashier'];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    user,
    userProfile,
    plan,
    isManager,
    isPlatformAdmin,
    hasAnalyticsFeature,
    hasAdvancedReportingFeature,
    hasPrioritySupportFeature,
    hasApiAccessFeature,
    hasCustomRolesFeature,
    isLoading,
  } = useAuthStore();
  
  // === TOP-LEVEL ROUTE PROTECTION ===
  useEffect(() => {
    if (isLoading) return;

    // 1. Immediately redirect platform admins away from the staff section
    if (isPlatformAdmin) {
      router.replace('/platform');
      return;
    }

    // 2. Redirect non-staff users to login
    if (!user || !userProfile || !staffRoles.includes(userProfile.role)) {
        router.replace('/login');
    }
  }, [isLoading, user, userProfile, isPlatformAdmin, router]);
  
  // === NON-MANAGER ROUTE GUARD ===
  // If a user is NOT a manager, ensure they can only access their designated page.
  useEffect(() => {
    if (isLoading || isManager || !userProfile) return;

    const allowedPaths: { [key: string]: string } = {
        barista: '/staff/pds',
        service: '/staff/runner',
        cashier: '/staff/cashier',
    };
    
    const expectedPath = allowedPaths[userProfile.role];

    if (expectedPath && pathname !== expectedPath) {
        router.replace(expectedPath);
    }
  }, [isLoading, isManager, userProfile, pathname, router]);


  const getPageTitle = () => {
    if (pathname.includes('/pds')) return 'Kitchen Display System';
    if (pathname.includes('/runner')) return 'Runner View';
    if (pathname.includes('/cashier')) return 'Cashier Terminal';
    if (pathname.includes('/analytics')) return 'Analytics Dashboard';
    if (pathname.includes('/menu')) return 'Menu Management';
    if (pathname.includes('/tables')) return 'Table Management';
    if (pathname.includes('/subscription')) return 'Subscription';
    if (pathname.includes('/reports')) return 'Advanced Reporting';
    if (pathname.includes('/support')) return 'Priority Support';
    if (pathname.includes('/api')) return 'API Access';
    if (pathname.includes('/roles')) return 'Custom Staff Roles';
    return 'Staff Portal';
  }

  // Show loading screen until auth state is resolved and redirects have been processed.
  if (!isClient || isLoading || isPlatformAdmin) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Verifying access...</p>
        </div>
    );
  }

  // This is the unified layout. It ALWAYS renders SidebarProvider to ensure
  // hook counts are stable. It then conditionally renders the content based on role.
  return (
    <SidebarProvider>
      {/* The actual sidebar is only rendered for managers */}
      {isManager && (
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                  <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold font-headline">Qordia Staff</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {/* Manager can see all primary staff views */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/staff/pds")}>
                    <Link href="/staff/pds">
                    <ChefHat />
                    <span className="group-data-[collapsible=icon]:hidden">Kitchen Display</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/staff/runner")}>
                    <Link href="/staff/runner">
                    <Truck />
                    <span className="group-data-[collapsible=icon]:hidden">Runner View</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/staff/cashier")}>
                    <Link href="/staff/cashier">
                    <Banknote />
                    <span className="group-data-[collapsible=icon]:hidden">Cashier</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Manager-only tools */}
              <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.includes("/staff/menu")}>
                  <Link href="/staff/menu">
                  <BookOpen />
                  <span className="group-data-[collapsible=icon]:hidden">Menu</span>
                  </Link>
              </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.includes("/staff/tables")}>
                  <Link href="/staff/tables">
                  <Table2 />
                  <span className="group-data-[collapsible=icon]:hidden">Tables</span>
                  </Link>
              </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.includes("/staff/subscription")}>
                      <Link href="/staff/subscription">
                      <CreditCard />
                      <span className="group-data-[collapsible=icon]:hidden">Subscription</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
              {hasAnalyticsFeature && (
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.includes("/staff/analytics")}>
                      <Link href="/staff/analytics">
                      <BarChart3 />
                      <span className="group-data-[collapsible=icon]:hidden">Analytics</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
              {hasAdvancedReportingFeature && (
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.includes("/staff/reports")}>
                      <Link href="/staff/reports">
                      <FileText />
                      <span className="group-data-[collapsible=icon]:hidden">Reports</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
              {hasCustomRolesFeature && (
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.includes("/staff/roles")}>
                      <Link href="/staff/roles">
                      <Users />
                      <span className="group-data-[collapsible=icon]:hidden">Staff Roles</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
              {hasApiAccessFeature && (
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.includes("/staff/api")}>
                      <Link href="/staff/api">
                      <Terminal />
                      <span className="group-data-[collapsible=icon]:hidden">API Access</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
              {hasPrioritySupportFeature && (
                  <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.includes("/staff/support")}>
                      <Link href="/staff/support">
                      <LifeBuoy />
                      <span className="group-data-[collapsible=icon]:hidden">Support</span>
                      </Link>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="group-data-[collapsible=icon]:hidden space-y-4">
              {isManager && (
                  <Card className="bg-background/50">
                      <CardHeader className="p-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                              <Gem className="w-4 h-4 text-primary" />
                              Current Plan: {isLoading ? <Skeleton className="w-16 h-4 inline-block" /> : plan?.name ?? '...'}
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                          <Button asChild variant="outline" size="sm" className="w-full">
                              <Link href="/staff/subscription">Upgrade Plan</Link>
                          </Button>
                      </CardContent>
                  </Card>
              )}
              {user && (
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.photoURL ?? "https://picsum.photos/seed/staff/100/100"} data-ai-hint="person portrait" />
                          <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{user.displayName ?? 'Staff Member'}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => auth?.signOut()}>
                          <LogOut className="h-5 w-5" />
                      </Button>
                  </div>
              )}
          </SidebarFooter>
        </Sidebar>
      )}
      
      {/* The main content area */}
      <SidebarInset>
          {isManager ? (
              <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6 sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                      <SidebarTrigger className="md:hidden" />
                      <h1 className="text-xl font-semibold hidden md:block">{getPageTitle()}</h1>
                  </div>
                  <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" className="rounded-full">
                          <Bell className="h-5 w-5" />
                          <span className="sr-only">Notifications</span>
                      </Button>
                      <Link href="/">
                      <Button variant="outline">
                          Customer View
                      </Button>
                      </Link>
                  </div>
              </header>
          ) : (
              <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6 sticky top-0 z-10 shrink-0">
                  <Link href="#" className="flex items-center gap-2" prefetch={false}>
                      <QordiaLogo className="w-8 h-8 text-primary" />
                      <span className="text-lg font-semibold font-headline">Qordia</span>
                  </Link>
                  {user && (
                  <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
                          <Button variant="ghost" size="icon" onClick={() => auth?.signOut()}>
                              <LogOut className="h-5 w-5" />
                          </Button>
                      </div>
                  )}
              </header>
          )}
          <main className="flex-1 p-4 sm:p-6 bg-muted/30 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
