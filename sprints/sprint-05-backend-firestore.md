# Sprint 5: Backend - Data Persistence & Real-time

## Objective:
Replace all mock data with a live Firebase Firestore backend.

### Atomic Tasks:
- [ ] **Firebase Setup:**
    - [ ] Call `RequestFirebaseBackendTool` to bootstrap Firebase config, providers, and rules.
- [ ] **Data Modeling (`docs/backend.json`):**
    - [ ] Define schemas for `menuItems`, `orders`, `tables`, and `users` based on `lib/types.ts` and `Devs-Onboarding.md`.
- [ ] **Firestore Rules (`firestore.rules`):**
    - [ ] Write initial security rules:
        - [ ] Allow public read for `/menuItems`.
        - [ ] Allow authenticated users to create/update their own orders in `/orders`.
        - [ ] Restrict staff/manager access to update order status.
        - [ ] Restrict manager access for menu/table management.
- [ ] **Data Migration/Seeding:**
    - [ ] Create a script or a one-time utility to upload the initial `menuItems` from `lib/data.ts` to Firestore.
- [ ] **Refactor Data Access:**
    - [ ] Replace all imports from `lib/data` with Firestore queries.
    - [ ] Use `useCollection` and `useDoc` hooks (which will be created by the tool) for real-time data fetching in components like `MenuPage`, `PDSPage`, and `AnalyticsPage`.
    - [ ] Refactor server actions like `getSuggestedItems` to fetch `availableMenuItems` from Firestore.
    - [ ] Refactor order placement logic to use `addDoc` or `setDoc` to create new orders in the `/orders` collection.
