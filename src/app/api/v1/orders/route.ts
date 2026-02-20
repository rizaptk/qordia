import { NextResponse, NextRequest } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs, addDoc, query, where, limit, offset, Timestamp } from 'firebase/firestore';
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

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    try {
        let q = query(collection(firestore, `tenants/${tenantId}/orders`));

        if (status) {
            q = query(q, where('status', '==', status));
        }
        if (limitParam) {
            q = query(q, limit(parseInt(limitParam, 10)));
        }
        if (offsetParam) {
            q = query(q, offset(parseInt(offsetParam, 10)));
        }

        const ordersSnapshot = await getDocs(q);
        
        const orders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(orders);

    } catch (error) {
        console.error('API Error fetching orders:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
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
        const orderData = await request.json();

        // Basic validation
        if (!orderData.items || !orderData.tableId) {
            return NextResponse.json({ error: 'Bad Request: Missing required fields.' }, { status: 400 });
        }

        const newOrder = {
            ...orderData,
            orderedAt: Timestamp.now(),
            status: orderData.status || 'Placed', // Default to Placed
        };

        const ordersRef = collection(firestore, `tenants/${tenantId}/orders`);
        const docRef = await addDoc(ordersRef, newOrder);
        
        const createdOrder = { id: docRef.id, ...newOrder };

        return NextResponse.json(createdOrder, { status: 201 });

    } catch (error) {
        console.error('API Error creating order:', error);
        if (error instanceof SyntaxError) {
             return NextResponse.json({ error: 'Bad Request: Invalid JSON body.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
