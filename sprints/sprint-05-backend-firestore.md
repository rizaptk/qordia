# Sprint 5: Backend - Data Persistence & Real-time

## Objective:
Replace all mock data with a live, multi-tenant Firebase Firestore backend.

### Atomic Tasks:
- [ ] **Firebase Setup:**
    - [ ] Call `RequestFirebaseBackendTool` to bootstrap Firebase config, providers, and rules.
- [ ] **Data Modeling (`docs/backend.json`):**
    - [ ] Define a top-level `tenants` schema for business accounts.
    - [ ] Update schemas for `menuItems`, `orders`, and `tables` to be nested within a tenant document (e.g., `/tenants/{tenantId}/menuItems/{itemId}`). This is critical for multi-tenancy.
    - [ ] Update the `users` schema to include a `tenantId` and a `role` field.
- [ ] **Firestore Rules (`firestore.rules`):**
    - [ ] Write multi-tenant security rules:
        - [ ] Public read access for a specific tenant's menu (`/tenants/{tenantId}/menuItems`).
        - [ ] Authenticated users can only create/update their own orders within their associated tenant's `orders` subcollection.
        - [ ] Staff/manager roles can only access data within the `tenantId` specified in their custom claim.
        - [ ] Platform Admins (`platform_admin` role) have global read/write access to all data for maintenance and support.
- [ ] **Data Migration/Seeding:**
    - [ ] Create a script to upload the initial `menuItems` from `lib/data.ts` to a specific tenant in Firestore for testing.
- [ ] **Refactor Data Access:**
    - [ ] Replace all imports from `lib/data` with Firestore queries that are tenant-aware (i.e., queries must always include a `tenantId`).
    - [ ] Update `useCollection` and `useDoc` hooks to accept a `tenantId` and build the correct path.
    - [ ] Refactor server actions like `getSuggestedItems` to fetch data from the correct tenant's subcollections.
    - [ ] Refactor order placement logic to create new orders in the correct tenant's `/orders` subcollection (e.g., `/tenants/{tenantId}/orders/{orderId}`).
