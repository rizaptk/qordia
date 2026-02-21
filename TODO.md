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
- [x] **Task:** Implement the core cashier interface for payment processing.
- **Details:** Build the cashier dashboard for viewing open bills and a settlement page to process payments for table orders.
- **Sprint:** [sprints/sprint-11-cashier-flow.md](./sprints/sprint-11-cashier-flow.md)

## 12. Cashier Walk-in Orders
- [x] **Task:** Implement the flow for cashiers to take orders for walk-in customers.
- **Details:** Build an interface for item selection, order type assignment (takeaway), and payment processing for non-QR orders.
- **Sprint:** [sprints/sprint-12-cashier-walk-in.md](./sprints/sprint-12-cashier-walk-in.md)

## 13. Cashier Refund Handling
- [x] **Task:** Implement the flow for cashiers to process full or partial refunds on completed orders.
- **Details:** Build the UI to find completed orders, initiate a refund, and update the order status to 'Refunded'.
- **Sprint:** [sprints/sprint-13-cashier-refunds.md](./sprints/sprint-13-cashier-refunds.md)

## 14. Cashier End-of-Shift Closing
- [x] **Task:** Implement the end-of-shift closing flow for cashiers.
- **Details:** Build the UI and logic for cashiers to review their shift summary, declare cash, and close their session.
- **Sprint:** [sprints/sprint-14-cashier-shift-closing.md](./sprints/sprint-14-cashier-shift-closing.md)

## 15. Menu Management Upgrade
- [x] **Task:** Implement the advanced menu management interface.
- **Details:** Refactor the menu page into a tabbed interface for Products, Categories, and Modifiers, aligning with the detailed design in `MENU-MANAGEMENT.md`.
- **Sprint:** [sprints/sprint-15-menu-upgrade.md](./sprints/sprint-15-menu-upgrade.md)

## 🤖 Reminders for Gemini

1.  **Never delete sprint tasks.** If changes are required, create a sub-sprint file (e.g., `sprint-02-A-updates.md`) and link to it.
2.  **Always update sprint progress.** Mark tasks as `[x]` for done, `[s]` for skipped, or `[u]` for updated in a sub-sprint.
3.  **Always refer to the Source of Truth files.** If confused, stuck, or considering a new approach, re-read the linked documents above.
4.  **Focus on the planned design.** Adhere strictly to the established plans and develop from the existing codebase.
5.  **Implement real features, not placeholders.** Break down large tasks into smaller, fully functional atomic tasks.
6.  **Request review after each task.** Announce task completion, state the next step, and always re-read these reminders before starting a new task.
