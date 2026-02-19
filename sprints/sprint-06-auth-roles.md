# Sprint 6: Authentication & Roles

## Objective:
Implement a secure, multi-tenant, role-based authentication system using Firebase Auth.

### Atomic Tasks:
- [x] **Auth Setup:**
    - [x] Ensure Firebase Auth is enabled (part of Sprint 5 setup).
    - [x] Configure sign-in providers (e.g., Email/Password, Google) in `docs/backend.json`.
- [x] **Create Auth Pages:**
    - [x] Create a `/login` page for staff, managers, and platform admins. This page might need logic to handle different user types.
- [x] **Auth State Management:**
    - [x] Use the `useUser()` hook to get the current user's auth state and custom claims.
    - [x] Wrap the application in the `FirebaseProvider` and `FirebaseClientProvider` in `src/app/layout.tsx`.
- [x] **Route Protection (Middleware or Layout Checks):**
    - [x] Protect the entire `/staff` directory. Only authenticated users with a `barista`, `service`, or `manager` role should have access.
    - [x] Create and protect a new `/platform` directory. Only authenticated users with a `platform_admin: true` claim should have access.
    - [x] Unauthenticated users should be redirected to `/login`.
- [ ] **Role-Based Access Control (RBAC):**
    - [ ] On user creation, assign a role (`manager`, `barista`, etc.) and a `tenantId` in their Firestore user profile (`/users/{uid}`).
    - [x] Create a cloud function (or manual process initially) to set Firebase Auth custom claims (`role`, `tenantId`, `platform_admin`) based on the user's Firestore profile. This is crucial for secure Firestore rules.
    - [x] In the UI, conditionally render components based on the user's role and `tenantId` from their auth token.
    - [x] Enforce RBAC strictly in Firestore Security Rules based on auth claims. This is the primary security boundary.
