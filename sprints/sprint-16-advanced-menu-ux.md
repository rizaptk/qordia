# Sprint 16: Advanced Menu UX - Modifier Support

## Objective:
Refactor the customer-facing menu and the cashier walk-in order system to fully support products with modifier groups, aligning with the detailed designs in `CUSTOMER-DIGITAL-MENU.md`.

### Atomic Tasks:

- [ ] **Task 1: Refactor Customization Dialog Logic.**
    - [ ] Modify `src/components/menu/customization-dialog.tsx` to handle the new `modifierGroupIds` on a `MenuItem`.
    - [ ] Instead of the old `options` object, it must now look up the modifier groups by their IDs from a list of all available groups.
    - [ ] It should dynamically render `RadioGroup` for "single" selection and `Checkbox` groups for "multiple" selection types.
    - [ ] It must enforce `required` modifier groups by disabling the "Add to Cart" button until a selection is made.
    - [ ] Implement real-time price calculation based on selected modifier `priceAdjustment` values.

- [ ] **Task 2: Integrate Modifier Dialog into Cashier Flow.**
    - [ ] Update the walk-in order tab in `src/app/staff/cashier/page.tsx`.
    - [ ] When a cashier clicks on a menu item that has associated `modifierGroupIds`, it should open the `CustomizationDialog`.
    - [ ] Pass a new `onAddToCart` prop to the dialog. This will allow the dialog to add the configured `CartItem` to the cashier's local cart state, rather than the customer's global cart store.
    - [ ] For items *without* modifiers, the current behavior (add directly to cart) should remain.

- [ ] **Task 3: Update Data Fetching & Props.**
    - [ ] In `src/app/[tenantId]/menu/[tableId]/page.tsx`, ensure that all `modifierGroups` for the tenant are fetched.
    - [ ] Pass the list of all `modifierGroups` as a prop to the `CustomizationDialog`. The dialog will need this to find the full modifier group data from the IDs stored on the menu item.
    - [ ] Do the same for the cashier page (`/staff/cashier/page.tsx`).

- [ ] **Task 4: Polish Cart Display.**
    - [ ] Update the cart display in the customer-facing `Sheet` (`/[tenantId]/menu/[tableId]/page.tsx`) to clearly list the selected customizations under each item.
    - [ ] Update the cashier's walk-in cart panel (`/staff/cashier/page.tsx`) to do the same. The `CartItem` type already supports this, so this is primarily a rendering task.
