# Sprint 18: Premium Menu Experience Implementation

## Objective:
Implement the advanced menu presentation styles and enhanced user experience features for "Pro Plan" subscribers, as detailed in `PREMIUM-FEATURES.md`.

### Atomic Tasks:

- [ ] **Task 1: Data Model & Subscription Logic**
    - [ ] Update `docs/backend.json`: Add a `menuStyle` string property to the `Table` entity (e.g., 'default', 'carousel', '3d', 'promo').
    - [ ] Update `src/lib/types.ts` to reflect the change in the `Table` type.
    - [ ] Add a new `'Advanced Menu Styles'` feature to `src/lib/features.ts`.
    - [ ] Update `useAuthStore` in `src/stores/auth-store.ts` to include a `hasAdvancedMenuStyles` flag derived from the user's subscription plan.

- [ ] **Task 2: Update Table Management UI**
    - [ ] Modify `src/app/staff/tables/page.tsx`: In the "Add/Edit Table" dialog, add a `Select` component to choose the `menuStyle` for the table.
    - [ ] Conditionally render this `Select` component only if the manager's plan has the `hasAdvancedMenuStyles` feature.

- [ ] **Task 3: Refactor Customer Menu Page for Dynamic Styles**
    - [ ] Modify `src/app/[tenantId]/menu/[tableId]/page.tsx` to be the master layout component.
    - [ ] It must now fetch the `Table` document using `useDoc` to get the selected `menuStyle`.
    - [ ] Based on the fetched `menuStyle`, it will conditionally render one of the new menu style components.

- [ ] **Task 4: Create Menu Style Components**
    - [ ] Create a new directory `src/components/menu/styles/`.
    - [ ] **Default Style (`default-list-style.tsx`):** Refactor the existing grid layout from the menu page into this component.
    - [ ] **Carousel Style (`carousel-slides-style.tsx`):** Implement a new component using `embla-carousel-react` or a similar library to create a swipeable card interface for menu items.
    - [ ] **3D Slide Style (`3d-slide-style.tsx`):** Implement a new component using `embla-carousel-react`. Use custom CSS transforms (e.g., `transform: perspective(...) rotateY(...)`) on the carousel slides to create the 3D stacking and parallax effect as the user swipes. This will require adding custom classes and styles.
    - [ ] **Promotional Style (`promo-slide-style.tsx`):** Implement a new component that displays each menu item as a full-screen hero section. This will involve using large background images and prominent typography for the item name and price. The "Today's Special" and "Limited Time Offer" text will be part of this component's structure.

- [ ] **Task 5: Implement Enhanced Modifier UX**
    - [ ] Refactor `src/components/menu/customization-dialog.tsx`.
    - [ ] For single-choice `RadioGroup` modifiers (like 'Size'), wrap them in a `ScrollArea` to make them horizontally scrollable, as described in the "Slide-able Modifier" feature.

- [ ] **Task 6: Implement Enhanced Cart Interaction**
    - [ ] Modify the cart trigger button in `src/app/[tenantId]/menu/[tableId]/page.tsx` to be a floating "Smart Cart Preview" bubble at the bottom of the screen.
    - [ ] In the cart `SheetContent`, add an "Edit" button to each cart item. Clicking it should re-open the `CustomizationDialog` pre-filled with that item's selections.
