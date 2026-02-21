
import { Firestore, writeBatch, doc, Timestamp, collection } from 'firebase/firestore';
import { menuItems as mockMenuItems } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * Seeds a new tenant with a complete set of sample data, including categories,
 * modifiers, menu items, tables, and example orders.
 * @param firestore The Firestore instance.
 * @param tenantId The ID of the tenant to seed.
 * @param userId The ID of the owner user.
 * @param isTestTenant A flag to indicate if this is a test tenant, to adjust timestamps for visibility.
 */
export async function seedNewTenant(firestore: Firestore, tenantId: string, userId: string, isTestTenant: boolean = false) {
    const batch = writeBatch(firestore);

    // --- 1. Seed Subscription Plans (if it's the test tenant) ---
    // This ensures plans are always available for development.
    if (isTestTenant) {
        const freePlanRef = doc(firestore, 'subscription_plans', 'plan_free');
        batch.set(freePlanRef, { name: 'Free', price: 0, features: ['Analytics'], tableLimit: 5, });
        const basicPlanRef = doc(firestore, 'subscription_plans', 'plan_basic');
        batch.set(basicPlanRef, { name: 'Basic', price: 19, features: ['Analytics', 'Cashier Role', 'Service Role'], tableLimit: 20, });
        const proPlanRef = doc(firestore, 'subscription_plans', 'plan_pro');
        batch.set(proPlanRef, { name: 'Pro', price: 49, features: ['Analytics', 'Advanced Reporting', 'Priority Support', 'API Access', 'Menu Customization', 'Staff Roles', 'Cashier Role', 'Service Role'], tableLimit: 0, });
    }

    // --- 2. Seed Menu Categories ---
    const categories = [...new Set(mockMenuItems.map(item => item.category))];
    const categoryMap = new Map<string, string>();
    categories.forEach((categoryName, index) => {
        const categoryRef = doc(collection(firestore, `tenants/${tenantId}/menu_categories`));
        categoryMap.set(categoryName, categoryRef.id);
        batch.set(categoryRef, {
            name: categoryName,
            displayOrder: index,
            isActive: true,
        });
    });

    // --- 3. Seed Modifier Groups ---
    const modifierGroupMap: { [key: string]: string } = {};

    const milkOptionsRef = doc(collection(firestore, `tenants/${tenantId}/modifier_groups`));
    modifierGroupMap['milk-options'] = milkOptionsRef.id;
    batch.set(milkOptionsRef, { name: 'Milk Options', selectionType: 'single', required: true, options: [ { name: 'Whole Milk', priceAdjustment: 0 }, { name: 'Skim Milk', priceAdjustment: 0 }, { name: 'Oat Milk', priceAdjustment: 0.5 }, { name: 'Almond Milk', priceAdjustment: 0.5 }, ] });

    const syrupFlavorsRef = doc(collection(firestore, `tenants/${tenantId}/modifier_groups`));
    modifierGroupMap['syrup-flavors'] = syrupFlavorsRef.id;
    batch.set(syrupFlavorsRef, { name: 'Syrup Flavors', selectionType: 'multiple', required: false, options: [ { name: 'Vanilla', priceAdjustment: 0.75 }, { name: 'Caramel', priceAdjustment: 0.75 }, { name: 'Hazelnut', priceAdjustment: 0.75 }, ] });

    const sizesRef = doc(collection(firestore, `tenants/${tenantId}/modifier_groups`));
    modifierGroupMap['sizes'] = sizesRef.id;
    batch.set(sizesRef, { name: 'Size', selectionType: 'single', required: true, options: [ { name: 'Small', priceAdjustment: -0.5 }, { name: 'Medium', priceAdjustment: 0 }, { name: 'Large', priceAdjustment: 1.0 }, ] });
    
    const sweetnessRef = doc(collection(firestore, `tenants/${tenantId}/modifier_groups`));
    modifierGroupMap['sweetness-level'] = sweetnessRef.id;
    batch.set(sweetnessRef, { name: 'Sweetness', selectionType: 'single', required: false, options: [ { name: 'Unsweetened', priceAdjustment: 0 }, { name: 'Lightly Sweet', priceAdjustment: 0 }, { name: 'Regular Sweet', priceAdjustment: 0 }, ] });

    // --- 4. Seed Menu Items ---
    const itemRefs: { [key: string]: {id: string, data: any} } = {};
    mockMenuItems.forEach((item) => {
        const itemRef = doc(collection(firestore, `tenants/${tenantId}/menu_items`));
        const imagePlaceholder = PlaceHolderImages.find(p => p.id === item.image);
        const firestoreItem = {
            name: item.name, description: item.description, price: item.price,
            categoryId: categoryMap.get(item.category) || '',
            imageUrl: imagePlaceholder?.imageUrl || '',
            isAvailable: item.isAvailable, isPopular: item.isPopular,
            modifierGroupIds: item.modifierGroupIds?.map(id => modifierGroupMap[id]).filter(Boolean) || [],
        };
        itemRefs[item.id] = { id: itemRef.id, data: firestoreItem };
        batch.set(itemRef, firestoreItem);
    });

    // --- 5. Seed Tables ---
    const tableIds: { [key: string]: string } = {};
    for (let i = 1; i <= 5; i++) {
        const tableRef = doc(collection(firestore, `tenants/${tenantId}/tables`));
        tableIds[i] = tableRef.id;
        batch.set(tableRef, { tableNumber: `${i}`, qrCodeIdentifier: `table-${i}` });
    }

    // --- 6. Seed Example Orders ---
    const now = new Date();
    const getTime = (minutesAgo: number) => isTestTenant ? new Date(now.getTime() - minutesAgo * 60000) : now;

    // Order 1: For PDS (Placed)
    const pdsOrderRef = doc(collection(firestore, `tenants/${tenantId}/orders`));
    batch.set(pdsOrderRef, {
        tableId: tableIds[1], status: 'Placed', customerId: userId, totalAmount: 8.25,
        orderedAt: Timestamp.fromDate(getTime(5)),
        items: [
            { menuItemId: itemRefs['coffee-02'].id, name: 'Cappuccino', quantity: 1, price: 5.00, customizations: { 'Size': 'Large', 'Milk Options': 'Oat Milk' }, specialNotes: 'Extra hot' },
            { menuItemId: itemRefs['pastry-01'].id, name: 'Croissant', quantity: 1, price: 3.75, customizations: {}, specialNotes: '' },
        ]
    });

    // Order 2: For Runner View (Ready)
    const runnerOrderRef = doc(collection(firestore, `tenants/${tenantId}/orders`));
    batch.set(runnerOrderRef, {
        tableId: tableIds[2], status: 'Ready', customerId: userId, totalAmount: 4.00,
        orderedAt: Timestamp.fromDate(getTime(10)),
        items: [{ menuItemId: itemRefs['coffee-04'].id, name: 'Iced Coffee', quantity: 1, price: 4.0, customizations: {}, specialNotes: '' }]
    });

    // Order 3: For Cashier (Completed)
    const completedOrderRef = doc(collection(firestore, `tenants/${tenantId}/orders`));
    batch.set(completedOrderRef, {
        tableId: tableIds[3], status: 'Completed', customerId: userId, totalAmount: 4.5,
        orderedAt: Timestamp.fromDate(getTime(30)),
        items: [{ menuItemId: itemRefs['coffee-03'].id, name: 'Latte', quantity: 1, price: 4.5, customizations: { 'Syrup Flavors': 'Vanilla' }, specialNotes: '' }]
    });
    
    // Order 4: For Cashier (Walk-in, Completed)
    const walkinOrderRef = doc(collection(firestore, `tenants/${tenantId}/orders`));
    batch.set(walkinOrderRef, {
        tableId: 'Takeaway', status: 'Completed', customerId: userId, totalAmount: 3.0,
        orderedAt: Timestamp.fromDate(getTime(45)),
        items: [{ menuItemId: itemRefs['coffee-01'].id, name: 'Espresso', quantity: 1, price: 3.0, customizations: {}, specialNotes: '' }]
    });

    await batch.commit();
}
