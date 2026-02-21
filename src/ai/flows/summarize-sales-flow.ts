'use server';
/**
 * @fileOverview Provides AI-driven summaries of sales data for managers.
 *
 * - summarizeSales - A function that analyzes sales data and returns a natural language summary.
 * - SummarizeSalesInput - The input type for the summarizeSales function.
 * - SummarizeSalesOutput - The return type for the summarizeSales function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OrderItemSchema = z.object({
  name: z.string().describe('Name of the menu item.'),
  quantity: z.number().describe('Quantity sold.'),
  price: z.number().describe('Price of a single item.'),
});

const OrderSchema = z.object({
  id: z.string(),
  totalAmount: z.number().describe('The total revenue from this order.'),
  orderedAt: z.string().describe('The ISO 8601 timestamp of when the order was placed.'),
  items: z.array(OrderItemSchema),
});

const SummarizeSalesInputSchema = z.object({
  orders: z.array(OrderSchema).describe("A list of all completed orders to be analyzed."),
  shopName: z.string().describe("The name of the shop for personalizing the summary."),
});
export type SummarizeSalesInput = z.infer<typeof SummarizeSalesInputSchema>;

const SummarizeSalesOutputSchema = z.object({
  summary: z.string().describe('A concise, insightful, and friendly summary of the sales data, formatted as markdown bullet points.'),
});
export type SummarizeSalesOutput = z.infer<typeof SummarizeSalesOutputSchema>;


export async function summarizeSales(input: SummarizeSalesInput): Promise<SummarizeSalesOutput> {
  return summarizeSalesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSalesPrompt',
  input: { schema: SummarizeSalesInputSchema },
  output: { schema: SummarizeSalesOutputSchema },
  prompt: `You are an expert business analyst for a cafe named {{{shopName}}}. Your task is to analyze the provided sales data and generate a short, friendly, and insightful summary for the business owner.

The summary should be presented as a few clear markdown bullet points. Focus on the most important trends and actionable insights.

Analyze the following aspects from the provided order data:
1.  **Overall Performance:** Calculate total revenue and total number of orders.
2.  **Best-Selling Items:** Identify the top 2-3 items by quantity sold.
3.  **Peak Hours:** Determine the busiest times of day based on order volume.

Here is the sales data to analyze:
{{jsonStringify orders}}

Generate a summary that is easy to read and helps the owner quickly understand their business performance. Be encouraging and professional.
`,
});

const summarizeSalesFlow = ai.defineFlow(
  {
    name: 'summarizeSalesFlow',
    inputSchema: SummarizeSalesInputSchema,
    outputSchema: SummarizeSalesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
