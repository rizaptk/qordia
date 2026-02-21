# Sprint 12: Cashier Walk-in Orders

## Objective:
Implement the complete walk-in order flow for cashiers within a dedicated tab on the main cashier dashboard, aligning with the detailed specifications in `CASHIER-WAIREFRAME.md` and `CASHIER-WALK-IN-ORDER.md`.

### Atomic Tasks:

- [x] **Task 1: Refactor Cashier Dashboard into a Tabbed Interface.**
    - [x] Modify `src/app/staff/cashier/page.tsx` to use the `Tabs` component.
    - [x] Move the existing "Open Bills" functionality into a `<TabsContent value="pending-payments">`.
    - [x] Create a new, empty `<TabsContent value="walk-in-order">` which will house the walk-in order UI.
    - [x] Add a `TabsList` component with triggers for "Pending Payments" and "New Walk-in Order".
    - [x] Add a "+ New Walk-in Order" button to the "Pending Payments" tab that switches to the "walk-in-order" tab, as a clear call-to-action.

- [x] **Task 2: Implement the Walk-in Order UI within the "Walk-in" Tab.**
    - [x] Inside the `walk-in-order` tab content, implement the two-panel layout: a "Product Panel" (left, 70%) and a "Cart Panel" (right, 30%).
    - [x] For the Product Panel:
        - [x] Fetch all menu items and categories for the tenant.
        - [x] Add a sticky, horizontally-scrolling `CategoryChips` component for filtering.
        - [x] Add a `Search` bar to filter items by name.
        - [x] Display the filtered menu items in a grid.
    - [x] The Cart Panel will be built in the next task.

- [x] **Task 3: Implement the Cart Panel & Local State Management.**
    - [x] Create a local state (e.g., using `useState` or a simple state management store) to manage the items for the walk-in order. This cart is temporary and separate from the customer-facing cart.
    - [x] As items are clicked in the Product Panel, add them to this local cart state.
    - [x] In the Cart Panel, display the items from the local state.
    - [x] Implement `+` and `-` buttons for each cart item to adjust quantity.
    - [x] Implement a `Remove` button for each item.
    - [x] Display a running `Subtotal` and `Total` that updates in real-time.

- [x] **Task 4: Finalize Order Placement & Payment.**
    - [x] Add a "Proceed to Payment" button at the bottom of the Cart Panel, which should be disabled if the cart is empty.
    - [x] When clicked, this button will create a new `Order` document in Firestore with:
        - [x] `status`: 'Placed' (so it appears on the PDS)
        - [x] `tableId`: 'Takeaway' (or a similar identifier)
        - [x] The items from the local cart state.
    - [x] After successful order creation, show a success toast and automatically switch the tab back to "Pending Payments".
