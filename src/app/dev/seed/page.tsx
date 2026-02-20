'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, writeBatch, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { menuItems } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

const TENANT_ID = 'qordiapro-tenant';

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
      const batch = writeBatch(firestore);

      // 1. Create the tenant document
      const tenantRef = doc(firestore, 'tenants', TENANT_ID);
      batch.set(tenantRef, {
        name: 'Qordia Cafe (Test)',
        ownerId: 'test-owner', // Add a placeholder ownerId
        createdAt: Timestamp.now(),
        planId: 'plan_basic',
        subscriptionStatus: 'trialing',
      });

      // 2. Seed Menu Categories from unique categories in menuItems
      const categories = [...new Set(menuItems.map(item => item.category))];
      const categoryMap = new Map<string, string>();

      categories.forEach((categoryName, index) => {
        const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
        categoryMap.set(categoryName, categoryId);
        const categoryRef = doc(firestore, `tenants/${TENANT_ID}/menu_categories`, categoryId);
        batch.set(categoryRef, {
          name: categoryName,
          displayOrder: index,
        });
      });
      
      // 3. Seed tables
      const tableRef = doc(firestore, `tenants/${TENANT_ID}/tables`, '12');
      batch.set(tableRef, {
        tableNumber: '12',
        qrCodeIdentifier: 'qordia-table-12',
      });

      // 4. Seed Subscription Plans
      const basicPlanRef = doc(firestore, 'subscription_plans', 'plan_basic');
      batch.set(basicPlanRef, {
        name: 'Basic',
        price: 19,
        features: ['Analytics'],
      });

      const proPlanRef = doc(firestore, 'subscription_plans', 'plan_pro');
      batch.set(proPlanRef, {
        name: 'Pro',
        price: 49,
        features: ['Analytics', 'Advanced Reporting', 'Priority Support'],
      });


      // 5. Seed Menu Items
      menuItems.forEach((item) => {
        const itemRef = doc(firestore, `tenants/${TENANT_ID}/menu_items`, item.id);
        const imagePlaceholder = PlaceHolderImages.find(p => p.id === item.image);

        const firestoreItem = {
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: categoryMap.get(item.category) || '',
          imageUrl: imagePlaceholder?.imageUrl || '',
          isAvailable: item.isAvailable,
          isPopular: item.isPopular,
          options: item.options || {},
        };
        batch.set(itemRef, firestoreItem);
      });

      await batch.commit();

      toast({
        title: '✅ Success!',
        description: `Database seeded for tenant: ${TENANT_ID}. You can now use the app.`,
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
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
                This action will populate the Firestore database with initial test data for a single tenant ({TENANT_ID}). 
                This includes a tenant, menu categories, a sample table, subscription plans, and menu items.
                Do not run this in a production environment.
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
