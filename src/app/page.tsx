'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useUserClaims, useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QordiaLogo } from '@/components/logo';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { claims, isLoading: areClaimsLoading } = useUserClaims();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      // Wait until auth state is fully determined
      if (isUserLoading || areClaimsLoading) {
        return;
      }

      // If no user is logged in, show the public homepage.
      if (!user) {
        setIsRedirecting(false);
        return;
      }

      // 1. Primary check: Use custom claims if they exist.
      // This is the fast path for all subsequent logins.
      if (claims) {
        if (claims.platform_admin === true) {
          router.replace('/platform');
          return;
        }
        if (claims.role && ['manager', 'barista', 'service'].includes(claims.role)) {
          router.replace('/staff');
          return;
        }
      }

      // 2. Fallback check: If no role claim, check the database directly.
      // This is crucial for a new user's first login.
      if (firestore) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().role === 'manager') {
            router.replace('/staff');
            return; // Redirect successful
          }
        } catch (error) {
          console.error("Homepage: Failed to check user role from Firestore:", error);
        }
      }

      // 3. If all checks fail, user is a regular customer or has no role. Show homepage.
      setIsRedirecting(false);
    };

    handleRedirect();
  }, [user, claims, isUserLoading, areClaimsLoading, firestore, router]);


  // Show a loader while we determine where the user should go.
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking your session...</p>
      </div>
    );
  }

  // If not redirecting, show the public homepage.
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
