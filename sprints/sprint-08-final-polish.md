# Sprint 8: Final Polish

## Objective:
Apply final design touches, replace all remaining placeholders with functional features, and conduct a final review to ensure the application is cohesive and aligns with the brand vision.

### Atomic Tasks:
- [x] **Logo Implementation:** Replace the placeholder SVG in `src/components/logo.tsx` with a proper SVG representation of the "QR Flow Symbol" concept from `CONCEPT.md`.
- [x] **Dynamic Platform Dashboard:** Replace the hardcoded metrics on the `/platform` dashboard with live data aggregated from Firestore (e.g., count of tenants, count of users).
- [ ] **Implement Tenant Detail Page:** Create the `/platform/tenants/[tenantId]` page to allow viewing and editing of tenant details, including a list of associated users.
- [ ] **(Placeholder) Finalize Billing Page:** Add a placeholder table to the `/platform/billing` page to visualize how tenant subscriptions would be displayed, preparing it for future payment integration.
- [ ] **(Placeholder) Finalize Monitoring Page:** Add placeholder charts and metrics to the `/platform/monitoring` page to visualize how system health would be displayed.
- [ ] **UX Review:** Perform a quick, final walkthrough of the core user flows (Customer Ordering, Staff PDS, Manager Dashboard) to identify and fix any minor UI inconsistencies or awkward interactions.
- [ ] **Code Cleanup:** Remove any remaining `console.log` statements or unused mock data (like `lib/data.ts`) that might have been left over from development.
