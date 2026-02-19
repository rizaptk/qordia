# Sprint 4: Manager Dashboard

## Objective:
Build the essential operational management tools for the outlet manager, as defined in `APP-FLOWS.md` and `UI_UX_Wireframe.md`.

### Atomic Tasks:
- [ ] **Create New Route: Menu Management (`/staff/menu`):**
    - [ ] Create a new page component for menu management.
    - [ ] Display all menu items from Firestore in a `components/ui/table`. The table should include columns for Name, Category, Price, and Availability (as a Switch).
    - [ ] Implement an "Add New Item" button that opens a form/dialog for creating a new menu item.
    - [ ] Implement "Edit" and "Delete" functionality for each item in the table.
    - [ ] The form should allow editing all `MenuItem` properties: name, description, price, category, image, isPopular, etc.
    - [ ] All CRUD operations (Create, Read, Update, Delete) must persist to the `/menuItems` collection in Firestore.

- [ ] **Create New Route: Table Management (`/staff/tables`):**
    - [ ] Create a new page component for table/seating zone management.
    - [ ] Display a list or grid of configured tables from Firestore.
    - [ ] Show the status of each table (e.g., Available, Active/Occupied) by checking for active orders linked to that `tableId`.
    - [ ] Implement a feature to "Generate QR Code" for a selected table, which opens a printable modal displaying the QR code that links to `/menu/[tableId]`.
    - [ ] Add a simple form to create new tables/zones in Firestore.

- [ ] **Add Navigation Links (`StaffLayout.tsx`):**
    - [ ] Add links for "Menu Management" and "Table Management" to the staff sidebar.
    - [ ] Choose appropriate icons from `lucide-react` (e.g., `BookOpen` for Menu, `QrCode` for Tables).

- [ ] **Enhance Analytics (`/staff/analytics`):**
    - [ ] The dashboard currently uses mock data. Modify all charts (`BestSellersChart`, `PeakHoursChart`, `SalesPerformanceChart`) to consume and aggregate real order data from the `/orders` collection in Firestore.
    - [ ] The main stat cards (Total Revenue, Total Orders, Avg. Order Value) must also be calculated from live Firestore data.
