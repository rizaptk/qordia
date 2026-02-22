import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { headers } from 'next/headers';

// This is a placeholder for a real API key validation mechanism.
async function getTenantIdFromApiKey(apiKey: string): Promise<string | null> {
    if (apiKey.startsWith('qordia_live_sk_')) {
        // A real implementation would query the 'api_keys' collection.
        return 'qordiapro-tenant';
    }
    return null;
}

export async function GET(request: Request) {
    const { firestore } = initializeFirebase();
    const headersList = headers();
    const authHeader = headersList.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key.' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];
    const tenantId = await getTenantIdFromApiKey(apiKey);

    if (!tenantId) {
        return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 401 });
    }

    try {
        const categoriesRef = collection(firestore, `tenants/${tenantId}/menu_categories`);
        const categoriesSnapshot = await getDocs(categoriesRef);
        
        const categories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(categories);

    } catch (error) {
        console.error('API Error fetching menu categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
