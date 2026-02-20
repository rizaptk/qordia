# Sprint 9: Subscription Feature Implementation

## Objective:
Implement the UI and logic for all subscription-based features defined in `src/lib/features.ts`, ensuring they appear conditionally in the UI based on the manager's active plan.

### Atomic Tasks:
- [ ] **Task 1: Foundational Setup & Sidebar Integration**
    - [x] Create this sprint file to track progress.
    - [x] Update `useAuthStore` to include flags for all available features (`Advanced Reporting`, `Priority Support`, `API Access`, `Custom Staff Roles`).
    - [x] Update `StaffLayout.tsx` to conditionally render sidebar links for all these new features. The links should only appear if the corresponding feature flag in the auth store is `true`.
    - [x] Create placeholder pages for each new route (`/staff/reports`, `/staff/support`, `/staff/api`, `/staff/roles`) so the links are functional.
- [ ] **Task 2: Build 'Custom Staff Roles' UI**
    - [ ] Develop the UI on the `/staff/roles` page to allow managers to create, view, and manage custom roles within their tenant.
- [ ] **Task 3: Build 'Advanced Reporting' UI**
    - [ ] Replace the placeholder on the `/staff/reports` page with more detailed charts and data export options.
- [ ] **Task 4: Build 'API Access' UI**
    - [ ] Replace the placeholder on the `/staff/api` page with a UI to display and manage API keys.
- [ ] **Task 5: Build 'Priority Support' UI**
    - [ ] Replace the placeholder on the `/staff/support` page with a functional contact form for submitting support tickets.
