# Sprint 12: Cashier Walk-in Orders

## Objective:
Implement the feature for cashiers to create and process orders for walk-in customers, as defined in `CASHIER-FLOW.md`.

### Atomic Tasks:

- [ ] **Task 1: Foundational UI for New Orders**
    - [ ] Add a prominent "+ New Walk-in Order" button to the main cashier dashboard (`/staff/cashier`).
    - [ ] This button will navigate to a new page: `/staff/cashier/new`.
    - [ ] Create the new page file `src/app/staff/cashier/new/page.tsx` with a basic layout containing two columns: one for the menu/item selection and one for the order summary (cart).

- [ ] **Task 2: Item Selection Interface**
    - [ ] On the `/staff/cashier/new` page, implement a menu interface similar to the customer-facing one.
    - [ ] It must include category filters and a search bar to quickly find items.
    - [ ] Implement `MenuItemCard` components. Clicking a card should add the item to the local order summary/cart.

- [ ] **Task 3: Order Summary & Customization**
    - [ ] The right-hand column will act as the cart, displaying items as they are added.
    - [ ] Allow the cashier to adjust item quantity and remove items from the cart.
    - [ ] (Stretch) Implement a simple dialog to add customizations if an item has options.

- [ ] **Task 4: Payment and Order Placement**
    - [ ] Add a "Finalize & Pay" button below the order summary.
    - [ ] Clicking this button should:
        - [ ] Create a new `Order` document in Firestore for the tenant.
        - [ ] The order `status` should be set to `In Progress` since payment is taken upfront.
        - [ ] The `tableId` can be set to something like "Takeaway".
    - [ ] After successful creation, redirect the cashier back to their main dashboard.
