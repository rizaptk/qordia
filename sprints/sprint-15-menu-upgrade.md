# Sprint 15: Menu Management UI/UX Upgrade

## Objective:
Refactor the existing Menu Management page to align with the new, more robust design specified in `MENU-MANAGEMENT.md`. This involves creating a tabbed interface to separate the management of Products, Categories, and Modifiers.

### Atomic Tasks:

- [ ] **Task 1: Foundational Layout & Tab Structure.**
    - [ ] Refactor `src/app/staff/menu/page.tsx` to use a `Tabs` component with three tabs: "Products," "Categories," and "Modifiers."
    - [ ] Move the existing product `Table` into the "Products" tab content area.

- [ ] **Task 2: Build Category Management Tab.**
    - [ ] Create a new component to house the UI for the "Categories" tab.
    - [ ] This component will fetch and display a list of all `menu_categories` from Firestore.
    - [ ] Implement an "Add New Category" dialog with a form to create a new category.
    - [ ] Implement an "Edit" action for each category in the list.
    - [ ] Update the `MenuCategory` entity in `docs/backend.json` and `src/lib/types.ts` to include `displayOrder` and `isActive` fields if they don't exist, to support drag-and-drop reordering and visibility toggles in the future.

- [ ] **Task 3: Build Modifier Management Tab (Initial).**
    - [ ] Create a new `ModifierGroup` entity in `docs/backend.json` and `src/lib/types.ts`. This will store modifier groups like "Milk Options" or "Add-ons."
    - [ ] Build the UI for the "Modifiers" tab to list these groups.
    - [ ] Implement an "Add New Modifier Group" dialog, allowing a manager to define a group and its options (e.g., Name: "Extra Shot", Price: "+$1.00").

- [ ] **Task 4: Update Product Form to Use Modifiers.**
    - [ ] Refactor the `MenuItemFormDialog` component.
    - [ ] Replace the current free-text `options` field with a system that allows managers to attach the pre-defined `Modifier Groups` to a product.
