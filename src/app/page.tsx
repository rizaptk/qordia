
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QordiaLogo } from '@/components/logo';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isManager, isPlatformAdmin, isUserLoading, isProfileLoading } = useAuthStore();
  
  const isAuthenticating = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (isAuthenticating) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    if (isPlatformAdmin) {
      router.replace('/platform');
      return;
    }
    if (isManager) {
      router.replace('/staff');
      return;
    }
    
    // If authenticated but not a manager or admin (e.g., customer or barista), stay on homepage.
  }, [isAuthenticated, isManager, isPlatformAdmin, isAuthenticating, router]);

  if (isAuthenticating) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking your session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <QordiaLogo className="w-8 h-8 text-primary" />
          <span className="text-lg font-semibold font-headline">Qordia</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
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
            <Link href="/table/12">
              Simulate Scan for Table 12
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
