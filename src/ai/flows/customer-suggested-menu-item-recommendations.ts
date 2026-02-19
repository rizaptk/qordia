'use server';
/**
 * @fileOverview Provides AI-driven suggestions for menu items based on a customer's current order or browsing context.
 *
 * - suggestMenuItems - A function that suggests additional menu items.
 * - CustomerSuggestedMenuItemRecommendationsInput - The input type for the suggestMenuItems function.
 * - CustomerSuggestedMenuItemRecommendationsOutput - The return type for the suggestMenuItems function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MenuItemSchema = z.object({
  id: z.string().describe('Unique identifier for the menu item.'),
  name: z.string().describe('Name of the menu item.'),
  description: z.string().describe('Short description of the menu item.'),
  category: z.string().describe('Category the menu item belongs to (e.g., drinks, desserts, main course).'),
  price: z.number().describe('Price of the menu item.'),
  isPopular: z.boolean().describe('True if the item is currently popular.'),
});

const CustomerSuggestedMenuItemRecommendationsInputSchema = z.object({
  currentOrderItems: z.array(z.string()).describe('List of IDs of items currently in the customer\'s order.').default([]),
  browsedCategory: z.string().optional().describe('The category the customer is currently browsing.'),
  availableMenuItems: z.array(MenuItemSchema).describe('A list of all available menu items, including their details.'),
});
export type CustomerSuggestedMenuItemRecommendationsInput = z.infer<typeof CustomerSuggestedMenuItemRecommendationsInputSchema>;

const CustomerSuggestedMenuItemRecommendationsOutputSchema = z.object({
  suggestedItemIds: z.array(z.string()).describe('A list of IDs of recommended menu items.'),
  reasoning: z.string().optional().describe('Optional explanation for the recommendations.'),
});
export type CustomerSuggestedMenuItemRecommendationsOutput = z.infer<typeof CustomerSuggestedMenuItemRecommendationsOutputSchema>;

export async function suggestMenuItems(
  input: CustomerSuggestedMenuItemRecommendationsInput
): Promise<CustomerSuggestedMenuItemRecommendationsOutput> {
  return customerSuggestedMenuItemRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerSuggestedMenuItemRecommendationsPrompt',
  input: { schema: CustomerSuggestedMenuItemRecommendationsInputSchema },
  output: { schema: CustomerSuggestedMenuItemRecommendationsOutputSchema },
  prompt: `You are a helpful restaurant assistant that suggests additional menu items to customers. Your goal is to help customers discover new favorites or complete their meal based on their current selections or browsing.

Here are the available menu items:
{{#each availableMenuItems}}
- ID: {{{id}}}, Name: {{{name}}}, Description: {{{description}}}, Category: {{{category}}}, Price: {{{price}}}, Popular: {{{isPopular}}}
{{/each}}

Customer's current context:
{{#if currentOrderItems.length}}
Current Order Items: {{currentOrderItems.join ", "}}
{{/if}}
{{#if browsedCategory}}
Currently Browsing Category: {{{browsedCategory}}}
{{/if}}

Suggest up to 3 additional menu items that would be popular, complement the customer's current order, or are relevant to their browsing activity. Only suggest items from the 'availableMenuItems' list. Do not suggest items already in the 'currentOrderItems'. For each suggestion, provide the item ID.
`,
});

const customerSuggestedMenuItemRecommendationsFlow = ai.defineFlow(
  {
    name: 'customerSuggestedMenuItemRecommendationsFlow',
    inputSchema: CustomerSuggestedMenuItemRecommendationsInputSchema,
    outputSchema: CustomerSuggestedMenuItemRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
