import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, type Firestore } from 'firebase/firestore';
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

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
    const { firestore } = initializeFirebase();
    const headersList = headers();
    const authHeader = headersList.get('Authorization');
    const { orderId } = params;

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
    const validationResult = await validateApiKey(apiKey, firestore);

    if ('error' in validationResult) {
        return NextResponse.json({ error: validationResult.error }, { status: validationResult.status });
    }

    const { tenantId } = validationResult;

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
