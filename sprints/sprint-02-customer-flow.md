# Sprint 2: Customer Ordering Flow

## Objective:
Build and refine the end-to-end, mobile-first customer ordering experience, incorporating animations and UX details from the design documents.

### Atomic Tasks:

- [x] **Entry Screen (`/` or `/table-entry`):**
    - [x] Create a dedicated landing page that appears upon scanning the QR code, as per `UI_UX_Wireframe.md`.
    - [x] This screen should display "You're seated at: Table [tableId]" and have a single, clear "Start Ordering" CTA button.
    - [x] This replaces the current homepage which is a project overview. The new entry point should simulate scanning a QR for a specific table (e.g., `/menu/12`).

- [x] **Menu Home Screen (`/menu/[tableId]`):**
    - [x] Implement a sticky header that always shows `Table [tableId]` and a `Cart` icon with an animated item count.
    - [x] Add a `Search` bar component at the top.
    - [x] Implement horizontally scrolling `Category` chips that filter the menu items below.
    - [x] Create a "Popular Items" section to highlight best-sellers, as per the wireframe.

- [ ] **Item Customization (`CustomizationDialog.tsx`):**
    - [ ] The customization panel should feel fluid. Use accordion-style transitions for add-ons as suggested in `Animation-flow.md`.
    - [ ] When a customization option changes the price, animate the price update with a subtle count-up effect.
    - [ ] Ensure the mobile layout is clean, with large tap targets for all options.

- [x] **Cart & Order Placement (`Sheet` in `MenuPage`):**
    - [x] **Animation:** When an item is added, the cart icon in the header should have a subtle bounce animation.
    - [x] **Layout:** The cart sheet should clearly display transparent pricing: subtotal, tax (if applicable), and total.
    - [x] **Functionality:** Allow users to edit item quantity or remove items directly from the cart.
    - [x] **CTA Animation:** The "Place Order" button should have a pulse animation to guide the user.

- [x] **Order Confirmation & Tracking (`/order/[orderId]`):**
    - [x] After placing an order, navigate the user to a confirmation screen (`/order/[orderId]`).
    - [x] This screen must show the "🎉 Order Received!" message, the Order ID, and an estimated time, as per the wireframe.
    - [x] **Animation:** The `OrderStatusTracker` component's status circles should light up sequentially with a mint accent color and a subtle bounce effect as the status updates. The connecting line should fill with an animated stroke.

- [x] **Global Animations & Transitions:**
    - [x] Implement smooth page transitions: a slide-in from the right for forward navigation (e.g., Menu -> Order Confirmation) and a slide-out to the right for back navigation.
    - [x] Ensure all interactive elements have micro-interaction feedback (e.g., tap ripples) as defined in `Animation-flow.md`.
