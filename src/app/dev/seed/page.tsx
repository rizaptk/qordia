
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
        planId: 'plan_pro', // Give the test tenant the pro plan
        subscriptionStatus: 'active',
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
          isActive: true,
        });
      });
      
      // 3. Seed tables
      const tableRef = doc(firestore, `tenants/${TENANT_ID}/tables`, '12');
      batch.set(tableRef, {
        tableNumber: '12',
        qrCodeIdentifier: 'qordia-table-12',
      });

      // 4. Seed Subscription Plans
      const freePlanRef = doc(firestore, 'subscription_plans', 'plan_free');
      batch.set(freePlanRef, {
        name: 'Free',
        price: 0,
        features: ['Analytics'],
        tableLimit: 5,
      });

      const basicPlanRef = doc(firestore, 'subscription_plans', 'plan_basic');
      batch.set(basicPlanRef, {
        name: 'Basic',
        price: 19,
        features: ['Analytics', 'Cashier Role', 'Service Role'],
        tableLimit: 20,
      });

      const proPlanRef = doc(firestore, 'subscription_plans', 'plan_pro');
      batch.set(proPlanRef, {
        name: 'Pro',
        price: 49,
        features: ['Analytics', 'Advanced Reporting', 'Priority Support', 'API Access', 'Menu Customization', 'Staff Roles', 'Cashier Role', 'Service Role'],
        tableLimit: 0, // 0 for unlimited
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
          modifierGroupIds: item.modifierGroupIds || [],
        };
        batch.set(itemRef, firestoreItem);
      });
      
      // 6. Seed Modifier Groups
      const milkOptionsRef = doc(firestore, `tenants/${TENANT_ID}/modifier_groups`, 'milk-options');
      batch.set(milkOptionsRef, {
          name: 'Milk Options',
          selectionType: 'single',
          required: true,
          options: [
              { name: 'Whole Milk', priceAdjustment: 0 },
              { name: 'Skim Milk', priceAdjustment: 0 },
              { name: 'Oat Milk', priceAdjustment: 0.5 },
              { name: 'Almond Milk', priceAdjustment: 0.5 },
          ]
      });

      const syrupFlavorsRef = doc(firestore, `tenants/${TENANT_ID}/modifier_groups`, 'syrup-flavors');
      batch.set(syrupFlavorsRef, {
          name: 'Syrup Flavors',
          selectionType: 'multiple',
          required: false,
          options: [
              { name: 'Vanilla', priceAdjustment: 0.75 },
              { name: 'Caramel', priceAdjustment: 0.75 },
              { name: 'Hazelnut', priceAdjustment: 0.75 },
          ]
      });
      
       const sizesRef = doc(firestore, `tenants/${TENANT_ID}/modifier_groups`, 'sizes');
       batch.set(sizesRef, {
           name: 'Size',
           selectionType: 'single',
           required: true,
           options: [
               { name: 'Small', priceAdjustment: -0.5 },
               { name: 'Medium', priceAdjustment: 0 },
               { name: 'Large', priceAdjustment: 1.0 },
           ]
       });
       
       const sweetnessRef = doc(firestore, `tenants/${TENANT_ID}/modifier_groups`, 'sweetness-level');
       batch.set(sweetnessRef, {
           name: 'Sweetness',
           selectionType: 'single',
           required: false,
           options: [
               { name: 'Unsweetened', priceAdjustment: 0 },
               { name: 'Lightly Sweet', priceAdjustment: 0 },
               { name: 'Regular Sweet', priceAdjustment: 0 },
           ]
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
                This action will populate the Firestore database with initial test data.
                This includes subscription plans, a test tenant ({TENANT_ID}) with menu items, categories, modifier groups, and a sample table.
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
