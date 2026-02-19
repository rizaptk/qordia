# Sprint 3: Preparation Display System (PDS)

## Objective:
Enhance the PDS to be a reliable, real-time tool for kitchen and barista staff, optimized for speed and clarity as per the `UI_UX_Wireframe.md`.

### Atomic Tasks:
- [x] **Real-time Orders:**
    - [x] Modify `PDSPage` to listen for new orders from Firestore in real-time instead of using `mockOrders`.
    - [x] New orders should appear automatically at the top of the "New Orders" list without a page refresh.
- [x] **Order Ticket (`OrderTicket.tsx`):**
    - [x] The "Time ago" feature is good, ensure it's accurate and updates every minute.
    - [x] Status update buttons (`Start Preparing`, `Mark as Ready`) must update the order's `status` field in its Firestore document.
    - [x] The component's display of status (color, text) should update based on real-time data changes, not just local state.
    - [x] Clicking a status update button should optimistically move the ticket to the next tab (e.g., from `New Orders` to `In Progress`) while the backend update confirms. This provides instant feedback to the staff.
- [x] **Layout and Tabs (`PDSPage.tsx`):**
    - [x] The tabbed layout (`New`, `Preparing`, `Ready`) is effective. Ensure the counts displayed on each tab (e.g., "New Orders (3)") are updated in real-time as orders are created and moved through the workflow.
    - [x] The UI must be highly readable from a distance, as it will be used in a busy kitchen or café environment. Review and potentially increase font sizes and ensure high-contrast colors for text and status badges.
- [x] **Service Staff / Runner View:**
    - [x] The "Ready" tab serves as the interface for runners. When an order is marked `Ready`, it should be prominent here.
    - [x] Add a final `Mark Delivered` or `Complete` button to the ticket when it's in the "Ready" state, which will move the order to a `Completed` state in Firestore, removing it from the PDS.
