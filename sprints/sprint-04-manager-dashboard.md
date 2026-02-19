# Sprint 4: Manager Dashboard

## Objective:
Build the essential operational management tools for the outlet manager, as defined in `APP-FLOWS.md` and `UI_UX_Wireframe.md`.

### Atomic Tasks:
- [x] **Create New Route: Menu Management (`/staff/menu`):**
    - [x] Create a new page component for menu management.
    - [x] Display all menu items from Firestore in a `components/ui/table`. The table should include columns for Name, Category, Price, and Availability (as a Switch).
    - [x] Implement an "Add New Item" button that opens a form/dialog for creating a new menu item.
    - [x] Implement "Edit" and "Delete" functionality for each item in the table.
    - [x] The form should allow editing all `MenuItem` properties: name, description, price, category, image, isPopular, etc.
    - [x] All CRUD operations (Create, Read, Update, Delete) must persist to the `/menuItems` collection in Firestore.

- [x] **Create New Route: Table Management (`/staff/tables`):**
    - [x] Create a new page component for table/seating zone management.
    - [x] Display a list or grid of configured tables from Firestore.
    - [x] Show the status of each table (e.g., Available, Active/Occupied) by checking for active orders linked to that `tableId`.
    - [x] Implement a feature to "Generate QR Code" for a selected table, which opens a printable modal displaying the QR code that links to `/menu/[tableId]`.
    - [x] Add a simple form to create new tables/zones in Firestore.

- [x] **Add Navigation Links (`StaffLayout.tsx`):**
    - [x] Add links for "Menu Management" and "Table Management" to the staff sidebar.
    - [x] Choose appropriate icons from `lucide-react` (e.g., `BookOpen` for Menu, `QrCode` for Tables).

- [x] **Enhance Analytics (`/staff/analytics`):**
    - [x] The dashboard currently uses mock data. Modify all charts (`BestSellersChart`, `PeakHoursChart`, `SalesPerformanceChart`) to consume and aggregate real order data from the `/orders` collection in Firestore.
    - [x] The main stat cards (Total Revenue, Total Orders, Avg. Order Value) must also be calculated from live Firestore data.
