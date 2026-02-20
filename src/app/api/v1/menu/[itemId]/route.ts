import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { headers } from 'next/headers';

// This is a placeholder for a real API key validation mechanism.
// In a real app, you would look up the key hash in the database.
async function getTenantIdFromApiKey(apiKey: string): Promise<string | null> {
    if (apiKey.startsWith('qordia_live_sk_')) {
        // For this PoC, we'll assume any valid-looking key belongs to our test tenant.
        // A real implementation would query the 'api_keys' collection.
        return 'qordiapro-tenant';
    }
    return null;
}

export async function GET(request: Request, { params }: { params: { itemId: string } }) {
    const { firestore } = initializeFirebase();
    const headersList = headers();
    const authHeader = headersList.get('Authorization');
    const { itemId } = params;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key.' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];
    const tenantId = await getTenantIdFromApiKey(apiKey);

    if (!tenantId) {
        return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 401 });
    }

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
