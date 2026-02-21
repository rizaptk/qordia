# Sprint 14: Cashier End-of-Shift Closing

## Objective:
Implement the end-of-shift closing flow for cashiers, allowing them to review their shift summary, declare cash, and formally close their session, as defined in `CASHIER-FLOW.md` and `CASHIER-WAIREFRAME.md`.

### Atomic Tasks:

- [x] **Task 1: Add Shift Management to Data Model & UI.**
    - [x] Update `docs/backend.json` with a new `Shift` entity to track shift status (active/closed), start/end times, and totals.
    - [x] Add a "Shift" status indicator and a "Close Shift" button to the header of the cashier interface in `src/app/staff/cashier/page.tsx`.

- [x] **Task 2: Implement the Shift Summary Dialog.**
    - [x] Create a new dialog component for the shift summary.
    - [x] When the "Close Shift" button is clicked, this dialog should open.
    - [x] Inside the dialog, fetch and calculate the shift's summary: Total Orders, Total Cash payments, Total Digital payments, and Total Refunds processed during the active shift.

- [x] **Task 3: Implement Cash Declaration and Variance.**
    - [x] Add an input field to the dialog for the cashier to enter the "Declared Cash" amount.
    - [x] Automatically calculate and display the variance between the system's expected cash total and the declared amount.

- [x] **Task 4: Implement the Final "Close Shift" Action.**
    - [x] When the final "Close Shift" button in the dialog is clicked, update the corresponding `Shift` document in Firestore to mark it as `CLOSED`.
    - [x] Store the final declared cash and variance in the shift document.
    - [x] After closing, redirect the cashier to the login screen or a locked "Shift Closed" screen.
