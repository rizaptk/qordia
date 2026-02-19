# Sprint 2: Customer Ordering Flow

## Objective:
Build and refine the end-to-end customer ordering experience based on wireframes.

### Atomic Tasks:
- [ ] **Entry Screen (`/menu/[tableId]`):**
    - [ ] Create a dedicated landing page or modal that shows "You're seated at: Table [tableId]" before showing the menu, as per the wireframe. Currently, it goes straight to the menu.
- [ ] **Menu Home Screen (`/menu/[tableId]` page):**
    - [ ] Implement a sticky header that always shows `Table [tableId]` and the `Cart` icon/count. (Partially done).
    - [ ] Implement a `Search` bar component.
    - [ ] Dynamically render `Category` chips/buttons that filter the menu items.
    - [ ] Create a "Popular Items" section at the top of the menu.
- [ ] **Item Customization (`CustomizationDialog.tsx`):**
    - [ ] Ensure the layout matches the wireframe (image on one side, options on the other for wider screens).
    - [ ] Verify that all option types (radio for single-choice, checkbox for add-ons) are handled correctly.
- [ ] **Cart (`Sheet` in `MenuPage`):**
    - [ ] Review layout to match the wireframe, ensuring transparent pricing (subtotal, tax, total).
    - [ ] Add functionality to edit an item's quantity or customizations directly from the cart.
- [ ] **Order Placement & Tracking:**
    - [ ] When an order is placed, save it to the backend (to be implemented in Sprint 5).
    - [ ] The `OrderStatusTracker` component should fetch real-time status from the backend.
- [ ] **Animations:**
    - [ ] Apply "Add to Cart" button pulse animation.
    - [ ] Implement smooth page transitions as described in `Animation-flow.md`.
