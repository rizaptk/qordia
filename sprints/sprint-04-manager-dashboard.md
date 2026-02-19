# Sprint 4: Manager Dashboard

## Objective:
Build the essential operational management tools for the outlet manager.

### Atomic Tasks:
- [ ] **Create New Route: Menu Management (`/staff/menu`):**
    - [ ] Create a new page component for menu management.
    - [ ] Display menu items in a table (`components/ui/table`).
    - [ ] Implement a "Add Item" button that opens a form/dialog.
    - [ ] Implement "Edit" and "Delete" functionality for each item.
    - [ ] The form should allow editing all `MenuItem` properties: name, description, price, category, availability, etc.
    - [ ] All changes must persist to the Firestore backend.
- [ ] **Create New Route: Table Management (`/staff/tables`):**
    - [ ] Create a new page component for table management.
    - [ ] Display a list of configured tables/seating zones.
    - [ ] Show the status of each table (Available, Active).
    - [ ] Implement a feature to "Generate QR Code" for a selected table, which links to `/menu/[tableId]`.
- [ ] **Add Navigation Links (`StaffLayout.tsx`):**
    - [ ] Add links for "Menu Management" and "Table Management" to the staff sidebar. Choose appropriate icons from `lucide-react`.
- [ ] **Enhance Analytics (`/staff/analytics`):**
    - [ ] Currently uses mock data. Modify charts to consume real sales data from Firestore.
