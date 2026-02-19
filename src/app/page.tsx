import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="dark">
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <div className="p-2 bg-primary rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold font-headline">Qordia</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/staff/pds">Staff Portal</Link>
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
          <div className="mx-auto max-w-md space-y-6 animate-fade-in-up">
              <div className="inline-block rounded-lg bg-primary/10 p-4 text-primary">
                  <div className="h-16 w-16 relative flex items-center justify-center">
                      <svg viewBox="0 0 100 100" fill="currentColor">
                          <path d="M50,10A40,40,0,1,0,90,50,40,40,0,0,0,50,10ZM73,65H65V73H57V65H49V57H57V49H65V57H73Zm-23.5-5.5h-11v-11h11Zm-5.5-17h-11v-11h11Zm17-17h-11v-11h11Zm-17,5.5h-11v-11h11Z"></path>
                      </svg>
                  </div>
              </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
              Scan. Order. Enjoy.
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
