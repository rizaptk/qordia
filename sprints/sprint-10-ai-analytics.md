# Sprint 10: AI Analytics Assistant

## Objective:
Implement an AI-powered assistant on the manager's analytics page to provide natural-language summaries of sales data.

### Atomic Tasks:
- [ ] **Genkit Flow:** Create a new flow in `src/ai/flows/summarize-sales-flow.ts` that accepts order and menu data and uses an LLM to generate a concise, insightful summary of sales performance, best-selling items, and peak hours.
- [ ] **Server Action:** Create a new server action in `src/app/actions/summarize-sales.ts` to act as a bridge between the client component and the Genkit flow.
- [ ] **UI Component:** Build a new component, `src/components/analytics/ai-summary-card.tsx`, which will contain a button to trigger the analysis. It should handle loading states while the AI is processing and display the formatted summary upon completion.
- [ ] **Integration:** Add the `AiSummaryCard` to the `src/app/staff/analytics/page.tsx`. This feature should only be visible to managers who have the `hasAdvancedReportingFeature` flag enabled on their subscription plan.
- [ ] **Dev Flow:** Update `src/ai/dev.ts` to include the new `summarize-sales-flow`.
