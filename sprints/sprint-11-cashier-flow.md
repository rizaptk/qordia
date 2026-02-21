# Sprint 11: Cashier Flow Implementation

## Objective:
Build the core functionality for the Cashier role, enabling them to view open bills and process payments for tables, as defined in `CASHIER-FLOW.md`.

### Atomic Tasks:

- [x] **Task 1: Foundational Setup & Role Integration**
    - [x] Add a new 'Enable Cashier Role' feature to `src/lib/features.ts`.
    - [x] Update `useAuthStore` to include an `isCashier` flag and a `hasCashierRoleFeature` based on the subscription plan.
    - [x] In `StaffLayout.tsx`, add a "Cashier" link to the sidebar, making it visible only if `hasCashierRoleFeature` is true for managers, or if the user is a dedicated cashier.
    - [x] Implement route protection in `StaffLayout.tsx` to ensure only users with `manager` or `cashier` roles can access `/staff/cashier/**` routes.

- [x] **Task 2: Cashier Dashboard (`/staff/cashier`)**
    - [x] Create the main cashier dashboard page at `src/app/staff/cashier/page.tsx`.
    - [x] On this page, fetch all orders with statuses `Placed`, `In Progress`, `Ready`, or `Served`.
    - [x] Group these active orders by `tableId` to create a list of "Open Bills".
    - [x] For each open bill, display a `Card` showing the `tableId`, the total bill amount, and the number of active orders.
    - [x] The card should link to the detailed settlement page for that table (e.g., `/staff/cashier/12`).

- [x] **Task 3: Bill Settlement Page (`/staff/cashier/[tableId]`)**
    - [x] Create a dynamic route and page at `src/app/staff/cashier/[tableId]/page.tsx`.
    - [x] On this page, fetch all active orders for the specified `tableId`.
    - [x] Display a summarized list of all items from all orders for that table.
    - [x] Calculate and display the final "Total Due" amount.
    - [x] Add UI buttons for different payment methods (Cash, Card, QR Pay) - functionality will be placeholder for now.
    - [x] Implement the primary action button, "Mark as Paid & Close Table". When clicked, this button should update the status of all fetched orders for that table to `Completed` in Firestore.
    - [x] After successfully settling the bill, redirect the user back to the main cashier dashboard.

- [ ] **Task 4: Walk-in & Other Flows (Future Sprints)**
    - This sprint focuses on payment for QR orders. The flows for walk-in orders, refunds, and end-of-shift reports will be planned in subsequent sprints.
