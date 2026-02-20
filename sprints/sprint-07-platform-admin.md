# Sprint 7: Qordia Platform Admin

## Objective:
Build the internal SaaS administration panel for platform-wide management, as specified in the `APP-FLOWS.md` document.

### Atomic Tasks:

- [x] **Initial Setup & Layout:**
    - [x] Create a new route group and layout for the platform admin section under `/platform`.
    - [x] This layout should have its own sidebar navigation, distinct from the staff/manager portal.
    - [x] Protect this entire route, ensuring only users with the `platform_admin` custom claim can access it.

- [x] **Tenant Management Module (`/platform/tenants`):**
    - [x] **List View:** Create a page to display all tenant accounts from the `/tenants` collection in a table. Show key information like Tenant Name, ID, Subscription Plan, and Status (Active/Disabled).
    - [x] **Creation Form:** Implement a form/dialog to register a new tenant. This should create a new document in the `/tenants` collection.
    - [ ] **Detail/Edit View:** Create a page `/platform/tenants/[tenantId]` to view and edit details for a specific tenant.
        - [ ] Allow editing of tenant name and subscription plan.
        - [ ] Implement a user management section to view all users associated with that `tenantId`.
        - [ ] Add controls to enable/disable specific features for this tenant (feature flags).

- [ ] **System Monitoring Module (`/platform/monitoring`):**
    - [ ] **Dashboard:** Create a dashboard page with placeholder components for key system metrics.
        - [ ] A card for "System Uptime".
        - [ ] A chart for "API Performance (Avg. Response Time)".
        - [ ] A card for "Active Connections".
    - [ ] **Error Log Viewer:** Implement a basic interface to display error logs (this can be a simple feed from a dedicated Firestore collection or a log management service).

- [ ] **Billing & Subscription Module (`/platform/billing`):**
    - [ ] **Overview Page:** Create a page to display an overview of tenant subscriptions.
    - [ ] Show a list of tenants with their current plan, billing cycle, and status (Paid, Overdue).
    - [ ] **(Placeholder) Invoice Generation:** Add a button on a tenant's detail page to "Generate Invoice" (functionality can be mocked initially).
    - [ ] **(Placeholder) Plan Management:** Create a UI to manage available subscription plans (e.g., Basic, Pro, Enterprise) and their features.

- [x] **Navigation & Links:**
    - [x] Add links for "Tenants", "Monitoring", and "Billing" to the platform admin sidebar.
    - [x] Use appropriate icons from `lucide-react` (e.g., `Building`, `Server`, `CreditCard`).
