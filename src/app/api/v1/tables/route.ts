import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs, doc, getDoc, type Firestore } from 'firebase/firestore';
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

export async function GET(request: Request) {
    const { firestore } = initializeFirebase();
    const headersList = headers();
    const authHeader = headersList.get('Authorization');

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
        const tablesRef = collection(firestore, `tenants/${tenantId}/tables`);
        const tablesSnapshot = await getDocs(tablesRef);
        
        const tables = tablesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(tables);

    } catch (error) {
        console.error('API Error fetching tables:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
