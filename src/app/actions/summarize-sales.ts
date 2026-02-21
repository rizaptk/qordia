
'use server';
import { summarizeSales, SummarizeSalesInput } from '@/ai/flows/summarize-sales-flow';
import type { Order, OrderItem } from '@/lib/types';

export async function getSalesSummary(orders: Order[], shopName: string): Promise<string> {

    // Map the complex Order type to the simpler schema the AI expects
    const summarizedOrders = orders.map(order => ({
        id: order.id,
        totalAmount: order.totalAmount || 0,
        orderedAt: new Date(order.orderedAt.seconds * 1000).toISOString(),
        items: (order.items as OrderItem[]).map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        }))
    }));

    const input: SummarizeSalesInput = {
        orders: summarizedOrders,
        shopName: shopName
    };
    
    try {
        const result = await summarizeSales(input);
        return result.summary;
    } catch (error) {
        console.error("AI sales summary failed:", error);
        // In case of an AI error, return a user-friendly message
        return "We couldn't generate a summary at this time. Please try again later.";
    }
}
