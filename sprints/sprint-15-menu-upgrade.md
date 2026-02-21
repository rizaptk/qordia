# Sprint 15: Menu Management UI/UX Upgrade

## Objective:
Refactor the existing Menu Management page to align with the new, more robust design specified in `MENU-MANAGEMENT.md`. This involves creating a tabbed interface to separate the management of Products, Categories, and Modifiers.

### Atomic Tasks:

- [x] **Task 1: Foundational Layout & Tab Structure.**
    - [x] Refactor `src/app/staff/menu/page.tsx` to use a `Tabs` component with three tabs: "Products," "Categories," and "Modifiers."
    - [x] Move the existing product `Table` into the "Products" tab content area.

- [x] **Task 2: Build Category Management Tab.**
    - [x] Create a new component to house the UI for the "Categories" tab.
    - [x] This component will fetch and display a list of all `menu_categories` from Firestore.
    - [x] Implement an "Add New Category" dialog with a form to create a new category.
    - [x] Implement an "Edit" action for each category in the list.
    - [x] Update the `MenuCategory` entity in `docs/backend.json` and `src/lib/types.ts` to include `displayOrder` and `isActive` fields if they don't exist, to support drag-and-drop reordering and visibility toggles in the future.

- [x] **Task 3: Build Modifier Management Tab (Initial).**
    - [x] Create a new `ModifierGroup` entity in `docs/backend.json` and `src/lib/types.ts`. This will store modifier groups like "Milk Options" or "Add-ons."
    - [x] Build the UI for the "Modifiers" tab to list these groups.
    - [x] Implement an "Add New Modifier Group" dialog, allowing a manager to define a group and its options (e.g., Name: "Extra Shot", Price: "+$1.00").

- [x] **Task 4: Update Product Form to Use Modifiers.**
    - [x] Refactor the `MenuItemFormDialog` component.
    - [x] Replace the current free-text `options` field with a system that allows managers to attach the pre-defined `Modifier Groups` to a product.
