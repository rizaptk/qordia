'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useAuthStore } from '@/stores/auth-store';
import { useMenuStore } from '@/stores/products-store';
import { useTableStore } from '@/stores/table-store';
import type { MenuItem, Table, MenuCategory, ModifierGroup, Tenant, SubscriptionPlan } from '@/lib/types';
import { useCategoryStore } from '@/stores/categories-store';
import { useModifierGroupStore } from '@/stores/modifiers-store';
import { useTenantStore } from '@/stores/tenant-store';

export function StoreInitializer() {
    const firestore = useFirestore();
    const { tenant } = useAuthStore();
    const { setMenus } = useMenuStore();
    const { setTables } = useTableStore();
    const { setCategories } = useCategoryStore();
    const { setModifierGroups } = useModifierGroupStore();
    const { setTenant } = useTenantStore();
    const params = useParams();

    useEffect(() => {
        const routeTenantId = params?.tenantId as string;
        const TENANT_ID = routeTenantId || tenant?.id;

        if (!firestore || !TENANT_ID) return;

        // Subscribe to Menu Items
        const menuItemsRef = collection(firestore, `tenants/${TENANT_ID}/menu_items`);
        const unsubscribeMenu = onSnapshot(query(menuItemsRef), (snapshot) => {
            const menuItems: MenuItem[] = [];
            snapshot.forEach((doc) => {
                menuItems.push({ id: doc.id, ...doc.data() } as MenuItem);
            });
            setMenus(menuItems);
        }, (error) => {
            console.error("Error listening to menu items:", error);
        });

        // Subscribe to Tables
        const tablesRef = collection(firestore, `tenants/${TENANT_ID}/tables`);
        const unsubscribeTables = onSnapshot(query(tablesRef), (snapshot) => {
            const tables: Table[] = [];
            snapshot.forEach((doc) => {
                tables.push({ id: doc.id, ...doc.data() } as Table);
            });
            setTables(tables);
        }, (error) => {
            console.error("Error listening to tables:", error);
        });

        // Subscribe to Categories
        const categoriesRef = collection(firestore, `tenants/${TENANT_ID}/menu_categories`);
        const unsubscribeCategories = onSnapshot(query(categoriesRef), (snapshot) => {
            const categories: MenuCategory[] = [];
            snapshot.forEach((doc) => {
                categories.push({ id: doc.id, ...doc.data() } as MenuCategory);
            });
            setCategories(categories);
        }, (error) => {
            console.error("Error listening to categories:", error);
        });

        // Subscribe to Modifier Groups
        const modifierGroupsRef = collection(firestore, `tenants/${TENANT_ID}/modifier_groups`);
        const unsubscribeModifierGroups = onSnapshot(query(modifierGroupsRef), (snapshot) => {
            const modifierGroups: ModifierGroup[] = [];
            snapshot.forEach((doc) => {
                modifierGroups.push({ id: doc.id, ...doc.data() } as ModifierGroup);
            });
            setModifierGroups(modifierGroups);
        }, (error) => {
            console.error("Error listening to modifier groups:", error);
        });

        // init tenant data and plan data
        let unsubscribeTenant = () => {};
        if (routeTenantId) {
            const tenantRef = doc(firestore, 'tenants', TENANT_ID);
            unsubscribeTenant = onSnapshot(tenantRef, async (snapshot) => {
                if (snapshot.exists()) {
                    const tenantData = { id: snapshot.id, ...snapshot.data() } as Tenant;
                    let planData: SubscriptionPlan | null = null;

                    if (tenantData.planId) {
                        try {
                            const planRef = doc(firestore, 'subscription_plans', tenantData.planId);
                            const planSnap = await getDoc(planRef);
                            if (planSnap.exists()) {
                                planData = { id: planSnap.id, ...planSnap.data() } as SubscriptionPlan;
                            }
                        } catch (error) {
                            console.error("Error fetching plan:", error);
                        }
                    }
                    setTenant(tenantData, planData);
                } else {
                    setTenant(null, null);
                }
            }, (error) => {
                console.error("Error listening to tenant:", error);
            });
        }

        return () => {
            unsubscribeMenu();
            unsubscribeTables();
            unsubscribeCategories();
            unsubscribeModifierGroups();
            unsubscribeTenant();
        };

    }, [firestore, tenant, params, setMenus, setTables, setCategories, setModifierGroups, setTenant]);

    return null;
}
