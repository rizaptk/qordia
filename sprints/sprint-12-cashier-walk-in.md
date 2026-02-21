# Sprint 12: Cashier Walk-in Orders

## Objective:
Implement the complete walk-in order flow for cashiers within a dedicated tab on the main cashier dashboard, aligning with the detailed specifications in `CASHIER-WAIREFRAME.md` and `CASHIER-WALK-IN-ORDER.md`.

### Atomic Tasks:

- [ ] **Task 1: Refactor Cashier Dashboard into a Tabbed Interface.**
    - [ ] Modify `src/app/staff/cashier/page.tsx` to use the `Tabs` component.
    - [ ] Move the existing "Open Bills" functionality into a `<TabsContent value="pending-payments">`.
    - [ ] Create a new, empty `<TabsContent value="walk-in-order">` which will house the walk-in order UI.
    - [ ] Add a `TabsList` component with triggers for "Pending Payments" and "New Walk-in Order".
    - [ ] Add a "+ New Walk-in Order" button to the "Pending Payments" tab that switches to the "walk-in-order" tab, as a clear call-to-action.

- [ ] **Task 2: Implement the Walk-in Order UI within the "Walk-in" Tab.**
    - [ ] Inside the `walk-in-order` tab content, implement the two-panel layout: a "Product Panel" (left, 70%) and a "Cart Panel" (right, 30%).
    - [ ] For the Product Panel:
        - [ ] Fetch all menu items and categories for the tenant.
        - [ ] Add a sticky, horizontally-scrolling `CategoryChips` component for filtering.
        - [ ] Add a `Search` bar to filter items by name.
        - [ ] Display the filtered menu items in a grid.
    - [ ] The Cart Panel will be built in the next task.

- [ ] **Task 3: Implement the Cart Panel & Local State Management.**
    - [ ] Create a local state (e.g., using `useState` or a simple state management store) to manage the items for the walk-in order. This cart is temporary and separate from the customer-facing cart.
    - [ ] As items are clicked in the Product Panel, add them to this local cart state.
    - [ ] In the Cart Panel, display the items from the local state.
    - [ ] Implement `+` and `-` buttons for each cart item to adjust quantity.
    - [ ] Implement a `Remove` button for each item.
    - [ ] Display a running `Subtotal` and `Total` that updates in real-time.

- [ ] **Task 4: Finalize Order Placement & Payment.**
    - [ ] Add a "Proceed to Payment" button at the bottom of the Cart Panel, which should be disabled if the cart is empty.
    - [ ] When clicked, this button will create a new `Order` document in Firestore with:
        - `status`: 'Placed' (so it appears on the PDS)
        - `tableId`: 'Takeaway' (or a similar identifier)
        - The items from the local cart state.
    - [ ] After successful order creation, show a success toast and automatically switch the tab back to "Pending Payments".
