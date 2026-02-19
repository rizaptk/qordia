# Sprint 5: Backend - Data Persistence & Real-time

## Objective:
Replace all mock data with a live, multi-tenant Firebase Firestore backend.

### Atomic Tasks:
- [x] **Firebase Setup:**
    - [x] Call `RequestFirebaseBackendTool` to bootstrap Firebase config, providers, and rules.
- [x] **Data Modeling (`docs/backend.json`):**
    - [x] Define a top-level `tenants` schema for business accounts.
    - [x] Update schemas for `menuItems`, `orders`, and `tables` to be nested within a tenant document (e.g., `/tenants/{tenantId}/menuItems/{itemId}`). This is critical for multi-tenancy.
    - [x] Update the `users` schema to include a `tenantId` and a `role` field.
- [x] **Firestore Rules (`firestore.rules`):**
    - [x] Write multi-tenant security rules:
        - [x] Public read access for a specific tenant's menu (`/tenants/{tenantId}/menuItems`).
        - [x] Authenticated users can only create/update their own orders within their associated tenant's `orders` subcollection.
        - [x] Staff/manager roles can only access data within the `tenantId` specified in their custom claim.
        - [x] Platform Admins (`platform_admin` role) have global read/write access to all data for maintenance and support.
- [x] **Data Migration/Seeding:**
    - [x] Create a script to upload the initial `menuItems` from `lib/data.ts` to a specific tenant in Firestore for testing.
- [ ] **Refactor Data Access:**
    - [ ] Replace all imports from `lib/data` with Firestore queries that are tenant-aware (i.e., queries must always include a `tenantId`).
    - [ ] Update `useCollection` and `useDoc` hooks to accept a `tenantId` and build the correct path.
    - [ ] Refactor server actions like `getSuggestedItems` to fetch data from the correct tenant's subcollections.
    - [ ] Refactor order placement logic to create new orders in the correct tenant's `/orders` subcollection (e.g., `/tenants/{tenantId}/orders/{orderId}`).
