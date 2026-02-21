# Sprint 13: Cashier Refund Handling

## Objective:
Implement the complete refund handling flow for cashiers, allowing them to process full or partial refunds for completed orders, as specified in `CASHIER-FLOW.md` and `CASHIER-WAIREFRAME.md`.

### Atomic Tasks:

- [ ] **Task 1: Foundational UI for Refunds.**
    - [ ] Add a "Paid" and a "Refunded" tab to the cashier dashboard at `src/app/staff/cashier/page.tsx`.
    - [ ] In the "Paid" tab, fetch and display a list of all orders with the `Completed` status.
    - [ ] Implement a search bar within the "Paid" tab to allow cashiers to find specific orders by Order ID or Table ID.
    - [ ] Each order in the list should have a "Process Refund" button.

- [ ] **Task 2: Implement the Refund Dialog.**
    - [ ] Create a new dialog component for handling refunds.
    - [ ] When "Process Refund" is clicked, this dialog should open, showing key order details (Order ID, total amount, items).
    - [ ] The dialog must include options for "Full Refund" and "Partial Refund".
    - [ ] If "Partial Refund" is selected, an input field for the refund amount should appear.
    - [ ] Add a required "Reason" text field for logging purposes.
    - [ ] Add a "Confirm Refund" button that will trigger the refund logic.

- [ ] **Task 3: Backend Logic & Data Model Update.**
    - [ ] Update the `Order` entity in `docs/backend.json` to include a new status enum `Refunded`.
    - [ ] Add a `refundDetails` property to the `Order` schema, containing `refundAmount`, `reason`, `processedAt`, and `processedByUid`.
    - [ ] Implement the `onConfirmRefund` function. This will update the order document in Firestore, setting its status to `Refunded` and populating the `refundDetails` field.
    - [ ] In the "Refunded" tab on the cashier dashboard, fetch and display all orders with the `Refunded` status, showing the refund details clearly.
