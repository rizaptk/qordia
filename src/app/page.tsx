'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useUserClaims } from '@/firebase';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QordiaLogo } from '@/components/logo';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { claims, isLoading: areClaimsLoading } = useUserClaims();
  const router = useRouter();

  useEffect(() => {
    // We wait until we have a clear picture of the user's auth state and claims.
    if (isUserLoading || areClaimsLoading) {
      return;
    }

    // If we have a user and their claims are loaded, we can decide where to send them.
    if (user && claims) {
      if (claims.platform_admin === true) {
        router.replace('/platform');
      } else if (claims.role && ['manager', 'barista', 'service'].includes(claims.role)) {
        router.replace('/staff');
      }
      // If they are a user with no special role (e.g., customer), they stay on the homepage.
    }
  }, [user, claims, isUserLoading, areClaimsLoading, router]);

  // While we check for an active session, show a loading screen.
  // This prevents the public page from flashing for logged-in users.
  if (isUserLoading || areClaimsLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If the checks are complete and the user is not staff, show the public homepage.
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
