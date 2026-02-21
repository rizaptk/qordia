# Sprint 12: Cashier Walk-in Orders

## Objective:
Implement the complete walk-in order flow for cashiers, from item selection to payment, based on the detailed specifications in `CASHIER-WALK-IN-ORDER.md` and `CASHIER-WAIREFRAME.md`.

### Atomic Tasks:

- [ ] **Task 1: Foundational UI for New Orders (`/staff/cashier/new`)**
    - [ ] Add a `+ New Walk-in Order` button to the main cashier dashboard (`/staff/cashier`) that links to `/staff/cashier/new`.
    - [ ] Create the new page `src/app/staff/cashier/new/page.tsx`.
    - [ ] Implement the two-panel layout: a "Product Panel" (left, 70%) and a "Cart Panel" (right, 30%), as specified in the wireframes.

- [ ] **Task 2: Implement the Product Panel**
    - [ ] In the Product Panel, display the full menu of the tenant.
    - [ ] Add a sticky, horizontally-scrolling `CategoryChips` component for filtering menu items.
    - [ ] Add a `Search` bar to filter items by name.
    - [ ] Display menu items using `MenuItemCard` components. Tapping a card should add the item to the cart.
    - [ ] (Note: For now, tapping an item with options will add it without customization. We can add the modifier dialog in a subsequent task to keep this one atomic.)

- [ ] **Task 3: Implement the Cart Panel**
    - [ ] The Cart Panel should be always visible on the right.
    - [ ] As items are added, display them in the cart with their name, quantity, and price.
    - [ ] Implement `+` and `-` buttons for each cart item to adjust quantity.
    - [ ] Implement a `Remove` button for each item.
    - [ ] Display a running `Subtotal` and `Total` at the bottom of the cart, which updates in real-time as items are added or removed.

- [ ] **Task 4: Finalize Order & Placement**
    - [ ] Below the cart total, add a "Proceed to Payment" button. This button should be disabled if the cart is empty.
    - [ ] Clicking "Proceed to Payment" should:
        - [ ] Create a new `Order` document in Firestore with a status of `Placed` (it will be immediately visible on the PDS).
        - [ ] The order's `tableId` should be set to a default value like "Takeaway".
        - [ ] The order items should be saved from the cart state.
    - [ ] After the order is successfully created in Firestore, the system should show a success toast and redirect the cashier back to their main dashboard (`/staff/cashier`).