
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QordiaLogo } from '@/components/logo';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type Table = {
    tableNumber: string;
}

export default async function TableEntryPage({ params }: { params: Promise<{ tenantId: string, tableId: string }> }) {
  const { tenantId, tableId } = await params;

  const { firestore } = initializeFirebase();
  const tableRef = doc(firestore, `tenants/${tenantId}/tables`, tableId);
  const tableSnap = await getDoc(tableRef);
  
  const tableData = tableSnap.exists() ? tableSnap.data() as Table : null;
  const tableNumber = tableData ? tableData.tableNumber : tableId;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md animate-fade-in-up text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <QordiaLogo className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">
            Welcome!
          </CardTitle>
          <CardDescription className="text-lg">
            You're seated at:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/10 text-primary font-bold text-4xl rounded-lg p-6">
            Table {tableNumber}
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href={`/${tenantId}/menu/${tableId}`}>
              Start Ordering
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground pt-4">
            No app required • Secure session
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
