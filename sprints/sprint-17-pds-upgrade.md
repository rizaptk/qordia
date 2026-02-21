# Sprint 17: Kitchen Display System (PDS) Upgrade

## Objective:
Enhance the PDS to align with the new, modifier-aware design specified in `KITCHEN-FLOW.md`, focusing on glanceability, clear modifier display, and improved status flow for high-pressure kitchen environments.

### Atomic Tasks:

- [x] **Task 1: Enhance `OrderTicket.tsx` for Modifier Display.**
    - [x] Update the component to render item customizations in a clear, indented list below each item, as shown in the `KITCHEN-FLOW.md` wireframe.
    - [x] Ensure special notes are also prominently displayed and highlighted.

- [x] **Task 2: Implement New Status Colors and Button Logic.**
    - [x] Update the `Badge` component in `OrderTicket.tsx` to use the new color system from the design document (e.g., Amber for 'Placed', Blue for 'Accepted', etc. - Note: The current implementation has some of this, but it needs to be fully aligned).
    - [x] Modify the main action `Button` to dynamically change its text and icon based on the order's status (`Start Preparing`, `Mark as Ready`, `Mark as Served`). The underlying `handleNextStatus` function should be updated if needed to handle any new status transitions.

- [x] **Task 3: UI and Layout Polish for Glanceability.**
    - [x] Review and adjust font sizes, padding, and spacing in both `PDSPage.tsx` and `OrderTicket.tsx` to match the tablet-first, high-clarity design principles.
    - [x] Ensure the responsive grid layout in `PDSPage.tsx` is optimized for 3-4 columns on a typical tablet screen.

- [x] **Task 4: Update Runner View.**
    - [x] The runner view at `/staff/runner/page.tsx` uses the same `OrderTicket` component. Verify that it correctly displays the newly enhanced tickets for 'Ready' orders, including all modifier information.
