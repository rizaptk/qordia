# Qordia — Cashier UI/UX Wireframe & App Flow Design

This document defines the **visual wireframe structure and interaction flow** for the Cashier role in Qordia.

Design Goal:
- Ultra-fast interaction
- Minimal navigation depth
- Large tap targets
- Clear financial visibility
- Built for peak-hour café rush

---

# 1. Design Principles

## 1.1 Core UX Priorities

- 1–2 taps maximum for core actions
- High-contrast totals
- Persistent payment visibility
- No unnecessary animations
- Real-time updates

## 1.2 Layout Structure

Desktop-first (Tablet-compatible).

```
┌────────────────────────────────────────────┐
│ Header                                     │
├────────────────────────────────────────────┤
│ Main Content (70%)      │ Summary (30%)   │
│                         │                 │
└────────────────────────────────────────────┘
```

---

# 2. Cashier App Flow Overview

```
Login
  ↓
Open Shift
  ↓
Dashboard
  ↓
(Select Flow)
  ├─ Process QR Payment
  ├─ Create Walk-In Order
  ├─ Verify Digital Payment
  ├─ Process Refund
  └─ Close Shift
```

---

# 3. Login Screen Wireframe

## Purpose
Authenticate cashier before shift.

```
[ QORDIA LOGO ]

Email / Username
[______________]

Password
[______________]

[ Login Button ]
```

UX Notes:
- Autofocus on first input
- Enter key triggers login
- Error displayed inline

---

# 4. Open Shift Screen

If shift not active:

```
Welcome, Sarah

[ Open Shift ]

Starting Cash (Optional):
[ 0.00 ]

[ Confirm & Start ]
```

System sets:
```
Shift Status → ACTIVE
```

---

# 5. Cashier Dashboard Wireframe

## Layout

```
┌────────────────────────────────────────────┐
│ Qordia | Cashier | Shift Active | Logout  │
├────────────────────────────────────────────┤
│ Tabs: [Pending] [Walk-in] [Paid] [Refund] │
├───────────────────────────────┬────────────┤
│ Order List                    │ Summary    │
│                               │            │
│ #A102  Table 04  $12.50       │ Total Today│
│ #A103  Table 02  $9.80        │ $2,430     │
│ #A104  Takeaway   $7.20       │            │
│                               │ Cash:      │
│                               │ $1,200     │
│                               │            │
│                               │ Digital:   │
│                               │ $1,230     │
└───────────────────────────────┴────────────┘
```

UX Features:
- Orders sorted by time (oldest first)
- Highlight unpaid in amber
- Auto-refresh in real-time

---

# 6. Flow 1 — Process QR Order Payment

## Step 1: Select Order

Tap order → Opens detail panel (modal or side panel).

---

## Step 2: Order Detail Wireframe

```
Order #A102
Table 04

2x Latte
1x Croissant

Subtotal: $12.00
Tax: $1.20
----------------
TOTAL: $13.20

[ Apply Discount ]
[ Select Payment ]
```

Total is:
- Bold
- Large font
- High contrast

---

## Step 3: Payment Method Selection

```
Select Payment Method

[ Cash ]
[ Card ]
[ QR Pay ]
[ E-Wallet ]

[ Confirm Payment ]
```

---

## Step 4: Confirmation State

```
✓ Payment Successful

Order #A102 Completed
```

System updates:
```
Payment → PAID
Order → COMPLETED
```

Auto-return to dashboard after 2 seconds.

---

# 7. Flow 2 — Walk-In Order Creation

## Step 1: Click "Walk-in" Tab

Wireframe:

```
Categories:
[ Coffee ] [ Snacks ] [ Dessert ]

---------------------------------

Latte       +  -
Americano   +  -
Cappuccino  +  -
```

Cart panel (right side):

```
Cart

2x Latte
1x Muffin

Total: $9.80

[ Assign Table ]
[ Proceed to Payment ]
```

---

## Step 2: Modifier Popup

```
Latte Options

Size:
( ) Small
(•) Medium
( ) Large

Sugar:
[ 50% ]

[ Confirm ]
```

---

## Step 3: Payment (Same as QR Flow)

After payment:
```
Order → PREPARING
Payment → PAID
```

Order pushed to kitchen display instantly.

---

# 8. Flow 3 — Digital Payment Verification

## Pending Verification Tab

```
#A105  Table 06  $18.00
Status: Awaiting Confirmation
```

Tap order:

```
Payment Method: Bank Transfer
Reference: TRX129384

[ View Proof ]
[ Approve ]
[ Reject ]
```

---

## Approval Action

```
✓ Payment Approved
```

System triggers preparation.

---

# 9. Flow 4 — Refund Process

## Access via Paid Tab

Search bar at top:

```
Search Order ID / Table
[______________________]
```

Open order:

```
Order #A099
Total: $15.00

[ Refund Full ]
[ Refund Partial ]
```

If partial:

```
Enter Amount:
[ 5.00 ]

Reason:
[ Damaged Item ]

[ Confirm Refund ]
```

If manager approval required:

```
Enter Manager PIN:
[ **** ]
```

---

# 10. Flow 5 — Close Shift

Access from header.

---

## Shift Summary Wireframe

```
Shift Summary

Orders: 124
Cash: $2,430
Digital: $1,280
Refunds: $120

Declared Cash:
[ 2,425 ]

Variance:
- $5

[ Close Shift ]
```

After closing:
```
Shift → LOCKED
```

User redirected to login.

---

# 11. UX Interaction Guidelines

## Button Hierarchy

Primary:
- Confirm Payment
- Close Shift

Secondary:
- Apply Discount
- Assign Table

Destructive:
- Cancel Order
- Refund

---

## Color Usage

- Purple: Primary actions
- Mint Green: Success
- Amber: Pending
- Red: Refund / Cancel
- Neutral Gray: Inactive elements

---

# 12. Error Handling UX

### Duplicate Payment

Modal:
```
⚠ Order Already Paid
```

---

### Network Failure

```
Connection Lost
Retrying...
```

Auto-retry mechanism preferred.

---

# 13. Accessibility Considerations

- Minimum 16px font
- 44px tap targets
- High contrast totals
- Keyboard shortcuts (optional desktop enhancement)

---

# 14. Cashier Performance Optimization

- Instant search
- Preloaded menu cache
- Fast payment modal
- Minimal page reload
- Real-time socket update

---

# 15. Final Design Intent

The cashier system must feel:

- Fast under pressure
- Visually clear
- Financially transparent
- Impossible to misuse
- Optimized for coffee rush environments

In Qordia, the cashier interface is not decorative —  
it is a high-speed operational control surface.
