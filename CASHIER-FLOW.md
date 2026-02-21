# Qordia — Detailed Cashier Flow Documentation

This document defines the complete operational flow for the **Cashier Role** in Qordia.

The cashier is responsible for:
- Payment confirmation
- Walk-in order entry (if enabled)
- Refund handling
- Closing orders
- End-of-day reconciliation

The cashier interface must be:
- Fast
- Minimal clicks
- Peak-hour optimized
- Error-resistant

---

# 1. Cashier Role Overview

## Primary Objectives

- Ensure every order is paid correctly
- Minimize queue waiting time
- Maintain accurate financial records
- Handle payment disputes quickly

## Access Scope

Cashier can:
- View active orders
- Process payments
- Update payment status
- Issue refunds (limited by policy)
- Print receipts (optional)
- View shift summary

Cashier cannot:
- Edit menu
- Access analytics dashboard (unless permitted)
- Modify system settings

---

# 2. Cashier Dashboard (Landing Screen)

## Overview Layout

```
[ Header ]
- Outlet Name
- Shift Status
- User Profile

[ Main Panel ]
Tabs:
- Pending Payments
- Paid Orders
- Walk-in Orders
- Refunded

[ Side Summary ]
- Total Today
- Cash Collected
- Digital Payments
- Pending Count
```

---

# 3. Flow 1 — QR Order Payment Processing

## Scenario
Customer orders via QR and selects "Pay at Counter".

---

## Step 1: Order Appears in Pending Payments

Order Status:
```
CONFIRMED
Payment Status: UNPAID
```

Displayed Info:
- Order ID
- Table number
- Items summary
- Total amount
- Payment method selected (if pre-chosen)

---

## Step 2: Select Order

Cashier taps order.

Order Detail Screen:

```
Order #A1204
Table 05

2x Latte
1x Croissant

Subtotal: $12.00
Tax: $1.20
Total: $13.20
```

Actions:
- Select Payment Method
- Add discount (if permitted)
- Cancel order (if authorized)

---

## Step 3: Choose Payment Method

Options:
- Cash
- Card
- QR Payment
- E-wallet
- Split Payment (optional advanced feature)

---

## Step 4: Confirm Payment

On payment confirmation:

System updates:
```
Payment Status → PAID
Order Status → COMPLETED
```

Triggers:
- Notification to service/barista (if needed)
- Receipt generation
- Daily sales aggregation update

UI Feedback:
- Green confirmation banner
- Sound notification (optional)
- Auto-return to dashboard

---

# 4. Flow 2 — Walk-In Order Entry

## Scenario
Customer orders directly at cashier.

---

## Step 1: Create New Order

Cashier taps:
```
+ New Order
```

---

## Step 2: Select Items

Interface:
- Category tabs
- Search bar
- Fast add buttons

Features:
- Quick quantity increment
- Modifier selection popup
- Real-time total calculation

---

## Step 3: Assign Order Type

Options:
- Dine-in (assign table)
- Takeaway
- Delivery (if enabled)

---

## Step 4: Proceed to Payment

Same as QR flow:
- Select payment method
- Confirm payment

System automatically:
```
Order Status → PREPARING
Payment Status → PAID
```

Order appears on:
- Kitchen display
- Service display

---

# 5. Flow 3 — Payment Verification (Digital)

## Scenario
Customer selects online payment from table.

Payment Status:
```
PENDING_VERIFICATION
```

---

## Step 1: Cashier Views Pending Verification

Displays:
- Order ID
- Claimed payment method
- Uploaded proof (if manual transfer)

---

## Step 2: Verify Payment

Options:
- Approve
- Reject

If Approved:
```
Payment Status → PAID
Order Status → CONFIRMED / PREPARING
```

If Rejected:
```
Payment Status → FAILED
Customer notified
```

---

# 6. Flow 4 — Refund Handling

## Refund Types

- Full refund
- Partial refund

---

## Step 1: Locate Completed Order

Search by:
- Order ID
- Table
- Customer name
- Time

---

## Step 2: Initiate Refund

System requires:
- Refund reason
- Manager PIN (if policy requires)

---

## Step 3: Confirm Refund

System updates:

```
Payment Status → REFUNDED
Order Status → CANCELLED (if applicable)
```

Log entry created:
- Who processed refund
- Timestamp
- Reason

---

# 7. Flow 5 — End-of-Shift Closing

## Step 1: Open Shift Summary

Displays:

```
Total Orders: 124
Cash: $2,430
Card: $1,280
QR Payment: $950
Refunds: $120
```

---

## Step 2: Count Cash

Cashier enters:
```
Declared Cash: $2,425
```

System calculates variance.

---

## Step 3: Close Shift

Actions:
- Lock cashier access
- Generate shift report
- Notify manager

Status:
```
Shift → CLOSED
```

---

# 8. Error Handling Scenarios

## Duplicate Payment Attempt

System blocks:
```
Error: Order Already Paid
```

---

## Payment Gateway Timeout

Order status:
```
Payment → PENDING
```

Cashier must verify manually.

---

## Network Failure During Payment

System should:
- Use transaction idempotency
- Prevent duplicate processing

---

# 9. Performance Requirements

Cashier system must support:

- < 300ms order load
- < 500ms payment confirmation
- Instant UI feedback
- Offline-safe temporary caching (optional)

Peak-hour optimization is critical.

---

# 10. Security Controls

- Session auto-timeout
- Role-based permissions
- Refund PIN authorization
- Payment log audit trail
- Shift-based login control

---

# 11. UI/UX Principles for Cashier

- Large tap targets
- High-contrast totals
- Minimal animation
- No deep navigation layers
- One primary action per screen

Designed for:
- Speed
- Accuracy
- Low cognitive load

---

# 12. Cashier State Model Summary

Order States relevant to cashier:

```
UNPAID
PENDING_VERIFICATION
PAID
REFUNDED
CANCELLED
```

Cashier influences:
- Payment state
- Completion state
- Refund state

---

# 13. Cashier KPIs

- Average payment processing time
- Refund frequency
- Cash variance rate
- Peak-hour processing capacity

---

# 14. Final Principle

The cashier flow must feel:

- Immediate
- Clear
- Controlled
- Reliable

In a busy café or food court environment, hesitation equals queue buildup.

The cashier system must be built for speed under pressure.
