import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { headers } from 'next/headers';

// This is a placeholder for a real API key validation mechanism.
async function getTenantIdFromApiKey(apiKey: string): Promise<string | null> {
    if (apiKey.startsWith('qordia_live_sk_')) {
        // A real implementation would query the 'api_keys' collection.
        return 'qordiapro-tenant';
    }
    return null;
}

export async function GET(request: Request, { params }: { params: { tableId: string } }) {
    const { firestore } = initializeFirebase();
    const headersList = headers();
    const authHeader = headersList.get('Authorization');
    const { tableId } = params;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key.' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];
    const tenantId = await getTenantIdFromApiKey(apiKey);

    if (!tenantId) {
        return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 401 });
    }

    try {
        const tableRef = doc(firestore, `tenants/${tenantId}/tables`, tableId);
        const tableSnapshot = await getDoc(tableRef);
        
        if (!tableSnapshot.exists()) {
            return NextResponse.json({ error: 'Table not found.' }, { status: 404 });
        }

        const table = {
            id: tableSnapshot.id,
            ...tableSnapshot.data()
        };

        return NextResponse.json(table);

    } catch (error) {
        console.error('API Error fetching table:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
