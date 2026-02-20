'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QordiaLogo } from '@/components/logo';
import { useAuthStore } from '@/stores/auth-store';

export default function Home() {
  const { isAuthenticated, isPlatformAdmin } = useAuthStore();
  const dashboardUrl = isPlatformAdmin ? '/platform' : '/staff';

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <QordiaLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-semibold font-headline">Qordia</span>
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
             <Button asChild>
                <Link href={dashboardUrl}>Go to Dashboard</Link>
             </Button>
          ) : (
            <>
                <Button asChild variant="ghost">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/register">Sign Up</Link>
                </Button>
            </>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="mx-auto max-w-md space-y-6 animate-fade-in-up">
          <div className="inline-block rounded-lg bg-primary/10 p-4 text-primary">
            <QordiaLogo className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
            Scan. Order. Served.
          </h1>
          <p className="text-muted-foreground md:text-xl">
            The simplest way for your customers to order. Scan the QR code at a table to see how it works.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/qordiapro-tenant/table/12">
              Simulate Scan for Table 12
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
