"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser, useUserClaims } from "@/firebase";
import { BarChart3, Bell, LayoutDashboard, UtensilsCrossed, BookOpen, Table2 } from "lucide-react";
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

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { claims, isLoading: areClaimsLoading } = useUserClaims();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const isManager = claims?.role === 'manager';
  const isStaff = ['manager', 'barista', 'service'].includes(claims?.role || '');


  const getPageTitle = () => {
    if (pathname.includes('/pds')) return 'Preparation Display';
    if (pathname.includes('/analytics')) return 'Analytics Dashboard';
    if (pathname.includes('/menu')) return 'Menu Management';
    if (pathname.includes('/tables')) return 'Table Management';
    return 'Staff Portal';
  }

  if (isUserLoading || areClaimsLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }
  
  if (!user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Authenticating...</p>
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
            {isStaff && (
                <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.includes("/staff/pds")}>
                    <Link href="/staff/pds">
                    <LayoutDashboard />
                    <span className="group-data-[collapsible=icon]:hidden">Prep Display</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )}
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
                    <SidebarMenuButton asChild isActive={pathname.includes("/staff/analytics")}>
                        <Link href="/staff/analytics">
                        <BarChart3 />
                        <span className="group-data-[collapsible=icon]:hidden">Analytics</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="group-data-[collapsible=icon]:hidden">
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
        <main className="flex-1 p-4 sm:p-6 bg-muted/30 min-h-[calc(100vh-4rem)]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
