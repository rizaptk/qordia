import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="dark">
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold font-headline">Qordia</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/staff/pds">Staff Portal</Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="mx-auto max-w-md space-y-4">
            <div className="inline-block rounded-lg bg-primary/10 p-4 text-primary">
                <div className="h-16 w-16 relative flex items-center justify-center">
                    <svg width="64" height="64" viewBox="0 0 100 100">
                        <path fill="currentColor" d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z"></path>
                        <path fill="currentColor" d="M60 10h30v30h-30z M65 15v20h20v-20z"></path>
                        <path fill="currentColor" d="M10 60h30v30h-30z M15 65v20h20v-20z"></path>
                        <path fill="currentColor" d="M45 10h10v10h-10z M45 35h10v10h-10z M10 45h10v10h-10z M35 45h10v10h-10z M45 45h10v10h-10z M25 25h-10v10h10z"></path>
                        <path fill="currentColor" d="M60 60h30v30h-30z M65 65v20h20v-20z M70 70h10v10h-10z"></path>
                        <path fill="currentColor" d="M45 60h10v10h-10z M45 85h10v10h-10z M60 45h10v10h-10z M85 45h10v10h-10z"></path>
                        <path fill="currentColor" d="M45 60h10v10h-10z M45 85h10v10h-10z M60 45h10v10h-10z M85 45h10v10h-10z M75 55h10v10h-10z M55 75h10v10h-10z M75 75h-10v10h10z"></path>
                    </svg>
                </div>
            </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
            Scan, Order, Serve
          </h1>
          <p className="text-muted-foreground md:text-xl">
            The simplest way to order. Scan the QR code at your table to begin.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/menu/12">
              Simulate Scan for Table 12
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
    </div>
  );
}
