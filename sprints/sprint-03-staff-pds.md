# Sprint 3: Preparation Display System (PDS)

## Objective:
Enhance the PDS to be a reliable, real-time tool for kitchen and barista staff.

### Atomic Tasks:
- [ ] **Real-time Orders:**
    - [ ] Modify `PDSPage` to listen for new orders from Firestore in real-time instead of using `mockOrders`.
    - [ ] New orders should appear automatically without a page refresh.
- [ ] **Order Ticket (`OrderTicket.tsx`):**
    - [ ] The "Time ago" feature is good, ensure it's accurate.
    - [ ] Status updates (`Start Preparing`, `Mark as Ready`) must update the order's state in Firestore.
    - [ ] The component's display of status (color, text) should update based on real-time data changes.
    - [ ] Clicking a status update button should optimistically move the ticket to the next tab (`New Orders` -> `In Progress`) and then confirm with the backend.
- [ ] **Layout and Tabs (`PDSPage.tsx`):**
    - [ ] The tabbed layout (`New`, `Preparing`, `Ready`) is good. Ensure the counts on each tab are updated in real-time.
    - [ ] The UI must be highly readable from a distance (large text, high contrast), as it will be used in a kitchen environment. Review font sizes and colors.
