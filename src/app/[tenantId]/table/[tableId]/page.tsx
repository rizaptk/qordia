'use client';

import { use, useEffect, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QordiaLogo } from '@/components/logo';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useTableStore } from '@/stores/table-store';

type Table = {
    tableNumber: string;
}

export default function TableEntryPage({ params }: { params: Promise<{ tenantId: string, tableId: string }> }) {
  const { tenantId, tableId } = use(params);
  const firestore = useFirestore();

  const [isMount, setIsMount] = useState(false);
  useEffect(() => {
    setIsMount(true);
  }, []);

  const { getTable } = useTableStore();
  const tableData = useMemoFirebase(() => isMount ? getTable(tableId) : null ,[tableId, isMount]);


  // const tableRef = useMemoFirebase(
  //   () => (firestore ? doc(firestore, `tenants/${tenantId}/tables`, tableId) : null),
  //   [firestore, tenantId, tableId]
  // );
  // const { data: tableData, isLoading } = useDoc<Table>(tableRef);

  const tableNumber = !isMount ? '...' : (tableData ? tableData.tableNumber : tableId);

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
          <div className="bg-primary/10 text-primary font-bold text-4xl rounded-lg p-6 min-h-[96px] flex items-center justify-center">
            {(
                `Table ${tableNumber}`
            )}
          </div>
          <Button asChild size="lg" className="w-full" disabled={!isMount}>
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
