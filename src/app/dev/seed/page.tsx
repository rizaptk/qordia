
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { seedNewTenant } from '@/firebase/seed-tenant';

const TEST_TENANT_ID = 'qordiapro-tenant';
const TEST_OWNER_ID = 'test-owner-id';

export default function SeedPage() {
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Firestore not available',
            description: 'The Firestore service is not ready. Please try again.',
        });
        return;
    }

    setIsLoading(true);
    toast({
      title: 'Seeding database...',
      description: 'Please wait while we populate the test data.',
    });

    try {
      await seedNewTenant(firestore, TEST_TENANT_ID, TEST_OWNER_ID, true);

      toast({
        title: '✅ Success!',
        description: `Database seeded for tenant: ${TEST_TENANT_ID}. You can now use the app.`,
      });
    } catch (error: any) {
      console.error('Error seeding database:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: error.message || 'An unknown error occurred. Check the console.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Database Seeding Utility</CardTitle>
           <CardDescription>
                This utility will populate a test tenant ({TEST_TENANT_ID}) with a full set of sample data, including menu items, categories, tables, and example orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
               This is useful for development and testing. Do not run this in a production environment.
            </p>
          <Button onClick={handleSeedData} disabled={isLoading || !firestore} className="w-full">
            {isLoading ? 'Seeding...' : 'Seed Test Data'}
          </Button>
          {!firestore && <p className="text-destructive text-sm mt-2 text-center">Waiting for Firebase to initialize...</p>}
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <p className="text-xs text-muted-foreground">After seeding, you can go back to the app.</p>
             <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
             </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
