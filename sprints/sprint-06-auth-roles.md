# Sprint 6: Authentication & Roles

## Objective:
Implement a secure, role-based authentication system using Firebase Auth.

### Atomic Tasks:
- [ ] **Auth Setup:**
    - [ ] Ensure Firebase Auth is enabled (part of Sprint 5 setup).
    - [ ] Configure sign-in providers (e.g., Email/Password, Google) in `docs/backend.json`.
- [ ] **Create Auth Pages:**
    - [ ] Create a `/login` page for staff and managers.
    - [ ] Create a simple sign-in UI.
- [ ] **Auth State Management:**
    - [ ] Use the `useUser()` hook (provided by scaffolding) to get the current user's auth state.
    - [ ] Wrap the application in the `FirebaseProvider` and `FirebaseClientProvider` in `src/app/layout.tsx`.
- [ ] **Route Protection (Middleware or Layout Checks):**
    - [ ] Protect the entire `/staff` directory, redirecting unauthenticated users to `/login`.
- [ ] **Role-Based Access Control (RBAC):**
    - [ ] When a user signs up/is created, assign them a role (`manager`, `barista`) in their Firestore user profile document (e.g., `/users/{uid}`).
    - [ ] Use Firebase Auth custom claims to reflect this role on the user's token for secure backend access.
    - [ ] In the UI, conditionally render components or disable actions based on the user's role (e.g., only managers see the "Analytics" and "Menu Management" links).
    - [ ] Enforce RBAC in Firestore Security Rules (e.g., only a user with a `manager` claim can write to `/menuItems`).
