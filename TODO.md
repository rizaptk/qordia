# Qordia Development Master Plan (TODO)

This document outlines the development plan to build the Qordia application based on the project's design and architectural documents.

## 1. Core & Theming
- [ ] **Task:** Align UI with Brand Identity.
- **Details:** Refine existing styles, colors, and fonts to perfectly match the `CONCEPT.md` guide.
- **Sprint:** [sprints/sprint-01-theming.md](./sprints/sprint-01-theming.md)

## 2. Customer Ordering Flow
- [ ] **Task:** Enhance the customer-facing menu and ordering experience.
- **Details:** Implement the full mobile web flow as detailed in `UI_UX_Wireframe.md` and `APP-FLOWS.md`, including category navigation, search, and refined item customization.
- **Sprint:** [sprints/sprint-02-customer-flow.md](./sprints/sprint-02-customer-flow.md)

## 3. Staff - Preparation Display System (PDS)
- [ ] **Task:** Refine the Kitchen/Barista real-time order display.
- **Details:** Improve the existing PDS to include real-time order updates, clearer status indicators, and better handling of order states (`Placed`, `In Progress`, `Ready`) as per the application flow.
- **Sprint:** [sprints/sprint-03-staff-pds.md](./sprints/sprint-03-staff-pds.md)

## 4. Manager Dashboard
- [ ] **Task:** Build out the manager's operational dashboard.
- **Details:** Create modules for Menu Management (CRUD), Table Management (QR generation), and enhance the existing Analytics section.
- **Sprint:** [sprints/sprint-04-manager-dashboard.md](./sprints/sprint-04-manager-dashboard.md)

## 5. Backend - Data Persistence & Real-time
- [ ] **Task:** Transition from mock data to a persistent backend.
- **Details:** Integrate Firebase Firestore to manage menus, orders, tables, and users. Implement real-time updates for orders using Firestore listeners.
- **Sprint:** [sprints/sprint-05-backend-firestore.md](./sprints/sprint-05-backend-firestore.md)

## 6. Authentication & Roles
- [ ] **Task:** Implement a role-based authentication system.
- **Details:** Use Firebase Authentication to manage user roles (Customer, Staff, Manager). Secure application routes and data access based on the user's role as defined in `Devs-Onboarding.md`.
- **Sprint:** [sprints/sprint-06-auth-roles.md](./sprints/sprint-06-auth-roles.md)
