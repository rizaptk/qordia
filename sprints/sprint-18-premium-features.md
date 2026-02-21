# Sprint 18: Premium Menu Experience Implementation

## Objective:
Implement the advanced menu presentation styles and enhanced user experience features for "Pro Plan" subscribers, as detailed in `PREMIUM-FEATURES.md`.

### Atomic Tasks:

- [x] **Task 1: Data Model & Subscription Logic**
    - [x] Update `docs/backend.json`: Add a `menuStyle` string property to the `Table` entity (e.g., 'default', 'carousel', '3d', 'promo').
    - [x] Update `src/lib/types.ts` to reflect the change in the `Table` type.
    - [x] Add a new `'Advanced Menu Styles'` feature to `src/lib/features.ts`.
    - [x] Update `useAuthStore` in `src/stores/auth-store.ts` to include a `hasAdvancedMenuStyles` flag derived from the user's subscription plan.

- [x] **Task 2: Update Table Management UI**
    - [x] Modify `src/app/staff/tables/page.tsx`: In the "Add/Edit Table" dialog, add a `Select` component to choose the `menuStyle` for the table.
    - [x] Conditionally render this `Select` component only if the manager's plan has the `hasAdvancedMenuStyles` feature.

- [x] **Task 3: Refactor Customer Menu Page for Dynamic Styles**
    - [x] Modify `src/app/[tenantId]/menu/[tableId]/page.tsx` to be the master layout component.
    - [x] It must now fetch the `Table` document using `useDoc` to get the selected `menuStyle`.
    - [x] Based on the fetched `menuStyle`, it will conditionally render one of the new menu style components.

- [x] **Task 4: Create Menu Style Components**
    - [x] **Default Style (`default-list-style.tsx`):** Refactor the existing grid layout from the menu page into this component.
    - [x] **Carousel Style (`carousel-slides-style.tsx`):** Implement a new component using `embla-carousel-react` to create a swipeable card interface for menu items.
    - [x] **3D Slide Style (`3d-slide-style.tsx`):** Implement a new component using `embla-carousel-react`. Use custom CSS transforms (e.g., `transform: perspective(...) rotateY(...)`) on the carousel slides to create the 3D stacking and parallax effect as the user swipes.
    - [x] **Promotional Style (`promo-slide-style.tsx`):** Implement a new component that displays each menu item as a full-screen hero section.

- [x] **Task 5: Implement Enhanced Modifier UX**
    - [x] Refactor `src/components/menu/customization-dialog.tsx`.
    - [x] For single-choice `RadioGroup` modifiers (like 'Size'), wrap them in a `ScrollArea` to make them horizontally scrollable, as described in the "Slide-able Modifier" feature.

- [x] **Task 6: Implement Enhanced Cart Interaction**
    - [x] Modify the cart trigger button in `src/app/[tenantId]/menu/[tableId]/page.tsx` to be a floating "Smart Cart Preview" bubble at the bottom of the screen.
    - [x] In the cart `SheetContent`, add an "Edit" button to each cart item. Clicking it should re-open the `CustomizationDialog` pre-filled with that item's selections.
