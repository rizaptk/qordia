import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, type Firestore } from 'firebase/firestore';
import { headers } from 'next/headers';
import type { Tenant } from '@/lib/types';

// This function validates the API key and checks the tenant's subscription status.
async function validateApiKey(apiKey: string, firestore: Firestore): Promise<{ tenantId: string } | { error: string, status: number }> {
    if (!apiKey.startsWith('qordia_live_sk_')) {
        return { error: 'Unauthorized: Invalid API key format.', status: 401 };
    }
    
    // Placeholder: In a real app, you'd look up the tenantId from a secure API key store.
    const tenantId = 'qordiapro-tenant'; 

    try {
        const tenantRef = doc(firestore, 'tenants', tenantId);
        const tenantSnap = await getDoc(tenantRef);

        if (!tenantSnap.exists()) {
            return { error: 'Unauthorized: Tenant not found.', status: 401 };
        }
        
        const tenant = tenantSnap.data() as Tenant;
        
        if (tenant.subscriptionStatus !== 'active' && tenant.subscriptionStatus !== 'trialing') {
            return { error: `Forbidden: Tenant subscription status is "${tenant.subscriptionStatus}". API access is disabled.`, status: 403 };
        }
        
        return { tenantId };
    } catch (e) {
        console.error("API Authentication Error:", e);
        return { error: 'Internal Server Error during authentication.', status: 500 };
    }
}

export async function GET(request: Request, { params }: { params: { itemId: string } }) {
    const { firestore } = initializeFirebase();
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    const { itemId } = params;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key.' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];
    const validationResult = await validateApiKey(apiKey, firestore);

    if ('error' in validationResult) {
        return NextResponse.json({ error: validationResult.error }, { status: validationResult.status });
    }

    const { tenantId } = validationResult;

    try {
        const menuItemRef = doc(firestore, `tenants/${tenantId}/menu_items`, itemId);
        const menuItemSnapshot = await getDoc(menuItemRef);
        
        if (!menuItemSnapshot.exists()) {
            return NextResponse.json({ error: 'Menu item not found.' }, { status: 404 });
        }

        const menuItem = {
            id: menuItemSnapshot.id,
            ...menuItemSnapshot.data()
        };

        return NextResponse.json(menuItem);

    } catch (error) {
        console.error('API Error fetching menu item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
