
'use server';
import { suggestMenuItems, CustomerSuggestedMenuItemRecommendationsInput } from '@/ai/flows/customer-suggested-menu-item-recommendations';
import type { MenuItem } from '@/lib/types';

export async function getSuggestedItems(currentCartItemIds: string[], allMenuItems: MenuItem[]): Promise<MenuItem[]> {
    const input: CustomerSuggestedMenuItemRecommendationsInput = {
        currentOrderItems: currentCartItemIds,
        availableMenuItems: allMenuItems.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            isPopular: item.isPopular
        }))
    };
    try {
        const result = await suggestMenuItems(input);
        
        // Filter out already suggested items and items in cart
        const suggested = allMenuItems.filter(item => 
            result.suggestedItemIds.includes(item.id) && !currentCartItemIds.includes(item.id)
        );

        return suggested;

    } catch (error) {
        console.error("AI suggestion failed:", error);
        return [];
    }
}
