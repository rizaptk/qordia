import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
    const { firestore } = initializeFirebase();
    const headersList = headers();
    const authHeader = headersList.get('Authorization');
    const { orderId } = params;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key.' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];
    const tenantId = await getTenantIdFromApiKey(apiKey);

    if (!tenantId) {
        return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 401 });
    }

    try {
        const orderRef = doc(firestore, `tenants/${tenantId}/orders`, orderId);
        const orderSnapshot = await getDoc(orderRef);
        
        if (!orderSnapshot.exists()) {
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        const order = {
            id: orderSnapshot.id,
            ...orderSnapshot.data()
        };

        return NextResponse.json(order);

    } catch (error) {
        console.error('API Error fetching order:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
    const { firestore } = initializeFirebase();
    const headersList = headers();
    const authHeader = headersList.get('Authorization');
    const { orderId } = params;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing or invalid API key.' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];
    const tenantId = await getTenantIdFromApiKey(apiKey);

    if (!tenantId) {
        return NextResponse.json({ error: 'Unauthorized: Invalid API key.' }, { status: 401 });
    }

    try {
        const body = await request.json();

        if (!body.status) {
            return NextResponse.json({ error: 'Bad Request: "status" field is required.' }, { status: 400 });
        }
        
        const orderRef = doc(firestore, `tenants/${tenantId}/orders`, orderId);
        const orderSnapshot = await getDoc(orderRef);

        if (!orderSnapshot.exists()) {
             return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        await updateDoc(orderRef, {
            status: body.status
        });
        
        const updatedOrderSnapshot = await getDoc(orderRef);
        const updatedOrder = { id: updatedOrderSnapshot.id, ...updatedOrderSnapshot.data() };

        return NextResponse.json(updatedOrder);

    } catch (error) {
        console.error('API Error updating order:', error);
        if (error instanceof SyntaxError) {
             return NextResponse.json({ error: 'Bad Request: Invalid JSON body.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
