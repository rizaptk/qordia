# Qordia Development Master Plan (TODO)

This document outlines the development plan to build the Qordia application based on the project's design and architectural documents.

## 📂 Source of Truth Documents
- [README.md](./README.md)
- [CONCEPT.md](./CONCEPT.md)
- [APP-FLOWS.md](./APP-FLOWS.md)
- [UI_UX_Wireframe.md](./UI_UX_Wireframe.md)
- [Animation-flow.md](./Animation-flow.md)
- [Devs-Onboarding.md](./Devs-Onboarding.md)

---

## 1. Core & Theming
- [x] **Task:** Align UI with Brand Identity.
- **Details:** Refine existing styles, colors, and fonts to perfectly match the `CONCEPT.md` guide.
- **Sprint:** [sprints/sprint-01-theming.md](./sprints/sprint-01-theming.md)

## 2. Customer Ordering Flow
- [x] **Task:** Enhance the customer-facing menu and ordering experience.
- **Details:** Implement the full mobile web flow as detailed in `UI_UX_Wireframe.md` and `APP-FLOWS.md`, including category navigation, search, and refined item customization.
- **Sprint:** [sprints/sprint-02-customer-flow.md](./sprints/sprint-02-customer-flow.md)

## 3. Staff - Preparation Display System (PDS)
- [x] **Task:** Refine the Kitchen/Barista real-time order display.
- **Details:** Improve the existing PDS to include real-time order updates, clearer status indicators, and better handling of order states (`Placed`, `In Progress`, `Ready`) as per the application flow.
- **Sprint:** [sprints/sprint-03-staff-pds.md](./sprints/sprint-03-staff-pds.md)

## 4. Manager Dashboard
- [x] **Task:** Build out the manager's operational dashboard.
- **Details:** Create modules for Menu Management (CRUD), Table Management (QR generation), and enhance the existing Analytics section.
- **Sprint:** [sprints/sprint-04-manager-dashboard.md](./sprints/sprint-04-manager-dashboard.md)

## 5. Backend - Data Persistence & Real-time
- [x] **Task:** Transition from mock data to a persistent, multi-tenant backend.
- **Details:** Integrate Firebase Firestore to manage menus, orders, tables, and users within a multi-tenant structure. Implement real-time updates for orders using Firestore listeners.
- **Sprint:** [sprints/sprint-05-backend-firestore.md](./sprints/sprint-05-backend-firestore.md)

## 6. Authentication & Roles
- [x] **Task:** Implement a multi-tenant, role-based authentication system.
- **Details:** Use Firebase Authentication to manage user roles (Customer, Staff, Manager, Platform Admin). Secure application routes and data access based on the user's role and tenant affiliation as defined in `Devs-Onboarding.md`.
- **Sprint:** [sprints/sprint-06-auth-roles.md](./sprints/sprint-06-auth-roles.md)

## 7. Qordia Platform Admin
- [x] **Task:** Build the internal SaaS administration panel.
- **Details:** Create a separate interface for platform administrators to manage tenants (outlets), monitor system health, and oversee the entire platform as specified in `APP-FLOWS.md`.
- **Sprint:** [sprints/sprint-07-platform-admin.md](./sprints/sprint-07-platform-admin.md)

## 8. Final Polish
- [x] **Task:** Implement the final design for the Qordia brand logo and perform a final UX review.
- **Details:** Update the placeholder logo with a design that matches the "QR Flow Symbol" concept and conduct a quick review of core user flows.
- **Sprint:** [sprints/sprint-08-final-polish.md](./sprints/sprint-08-final-polish.md)

## 9. Feature Implementation
- [x] **Task:** Implement UI and logic for all subscription features.
- **Details:** Build out the UI components that are conditionally rendered based on a manager's subscription plan, ensuring that features like "Custom Staff Roles" and "Advanced Reporting" are tangible and accessible from the staff sidebar.
- **Sprint:** [sprints/sprint-09-feature-implementation.md](./sprints/sprint-09-feature-implementation.md)

## 10. AI Analytics Assistant
- [x] **Task:** Implement an AI-powered assistant for sales analytics.
- **Details:** Add a Genkit flow and UI component to provide natural-language summaries of sales data, available on the "Pro" plan.
- **Sprint:** [sprints/sprint-10-ai-analytics.md](./sprints/sprint-10-ai-analytics.md)

## 11. Cashier Flow
- [ ] **Task:** Implement the core cashier interface for payment processing.
- **Details:** Build the cashier dashboard for viewing open bills and a settlement page to process payments for table orders.
- **Sprint:** [sprints/sprint-11-cashier-flow.md](./sprints/sprint-11-cashier-flow.md)
