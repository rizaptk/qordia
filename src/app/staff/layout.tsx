
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAuth } from '@/firebase';
import { BarChart3, Bell, LayoutDashboard, UtensilsCrossed, BookOpen, Table2, Loader2, Gem, LogOut, CreditCard } from "lucide-react";
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

const staffRoles = ['manager', 'barista', 'service'];

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
    hasAnalyticsFeature,
    isLoading,
  } = useAuthStore();
  
  useEffect(() => {
    if (!isLoading && (!user || !userProfile || !staffRoles.includes(userProfile.role))) {
        router.replace('/login');
    }
  }, [isLoading, user, userProfile, router]);
  
  const getPageTitle = () => {
    if (pathname.includes('/pds')) return 'Preparation Display';
    if (pathname.includes('/analytics')) return 'Analytics Dashboard';
    if (pathname.includes('/menu')) return 'Menu Management';
    if (pathname.includes('/tables')) return 'Table Management';
    if (pathname.includes('/subscription')) return 'Subscription';
    return 'Staff Portal';
  }

  if (!isClient || isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Verifying access...</p>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
             <div className="p-2 bg-primary rounded-lg">
                <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
             </div>
             <h2 className="text-lg font-bold font-headline">Qordia Staff</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.includes("/staff/pds")}>
                <Link href="/staff/pds">
                <LayoutDashboard />
                <span className="group-data-[collapsible=icon]:hidden">Prep Display</span>
                </Link>
            </SidebarMenuButton>
            </SidebarMenuItem>
            
            {isManager && (
              <>
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
              </>
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
      <SidebarInset>
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
        <main className="flex-1 p-4 sm:p-6 bg-muted/30 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
