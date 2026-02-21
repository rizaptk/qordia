# Qordia — Detailed Walk-In Order UI/UX Design  
(Cashier-Side Interaction Flow)

This document defines **how a cashier adds items into cart**, manages modifiers,
handles quantity changes, and completes a walk-in transaction.

Design Goal:
- Ultra-fast item entry
- Zero confusion during rush hour
- Large tap-friendly interface
- Real-time total visibility
- Minimal cognitive load

---

# 1. Screen Layout Structure

## Desktop / Tablet Layout (Recommended)

```
┌──────────────────────────────────────────────────────────┐
│ Header (Shift | Outlet | User | Search | Quick Actions) │
├───────────────────────────────┬──────────────────────────┤
│ Product Panel (70%)          │ Cart Panel (30%)         │
│                               │                          │
│ Categories                    │ Cart Items               │
│ Product Grid                  │ Total Summary            │
│                               │ Payment CTA              │
└───────────────────────────────┴──────────────────────────┘
```

---

# 2. Entry Point

From Dashboard → Click:

```
[ + New Walk-In Order ]
```

System state:
```
Order Status → DRAFT
Cart → EMPTY
```

---

# 3. Product Panel Design

## 3.1 Category Navigation

Top horizontal scroll or left sidebar:

```
[ All ]
[ Coffee ]
[ Non-Coffee ]
[ Snacks ]
[ Dessert ]
[ Promo ]
```

Behavior:
- Sticky at top
- One-tap filter
- Default: "All"

---

## 3.2 Product Grid

Each product card:

```
┌────────────────────┐
│   Product Image    │
│                    │
│ Latte              │
│ $3.50              │
│                    │
│ [+ Add]            │
└────────────────────┘
```

Interaction:
- Tap anywhere → Add to cart (if no modifiers)
- If modifiers exist → Open Modifier Popup

Performance Requirement:
- Product grid preloaded
- No loading spinner per item
- Add action < 200ms response

---

# 4. Add Item to Cart Flow

## Case A — Product Without Modifiers

### Step 1: Tap Product

System:
```
If product not in cart → Add with qty = 1
If already in cart → Increment qty +1
```

Cart updates instantly.

---

## Case B — Product With Modifiers (Example: Latte Size)

### Step 1: Tap Product

Open Modal:

```
Latte Options

Size:
( ) Small  - $3.00
(•) Medium - $3.50
( ) Large  - $4.00

Sugar:
[ 50% ]

Add-ons:
[ ] Extra Shot (+$1)
[ ] Oat Milk (+$0.5)

[ Cancel ]      [ Add to Cart ]
```

### Step 2: Confirm

System creates unique cart item:

```
Latte (Medium, 50%, Oat Milk)
Qty: 1
Price: $4.00
```

Important:
Each modifier combination is treated as unique cart line.

---

# 5. Cart Panel Design

Cart must always be visible.

---

## 5.1 Cart Item Display

```
Cart

1x Latte (Medium)
   - Oat Milk
   $4.00

2x Croissant
   $6.00
```

Each item row contains:

```
[ - ]  Qty  [ + ]
[ Edit ]
[ Remove ]
```

---

## 5.2 Quantity Adjustment

### Tap [+]

```
Qty +1
Recalculate subtotal instantly
```

### Tap [-]

```
If qty > 1 → reduce
If qty = 1 → confirm removal
```

Popup:

```
Remove this item?
[ Cancel ] [ Remove ]
```

---

# 6. Real-Time Pricing Engine

Cart automatically calculates:

```
Subtotal
Tax
Service Charge (if applicable)
Discount
-----------------
TOTAL
```

Displayed in bold:

```
TOTAL: $13.80
```

Rules:
- Total always visible (sticky bottom)
- High contrast
- Large font (20–24px minimum)

---

# 7. Discount Flow

Optional feature (permission-based).

Tap:

```
[ Apply Discount ]
```

Options:

```
Discount Type:
( ) Percentage
( ) Fixed Amount

Value:
[ 10 ]

Reason:
[ Staff Promo ]

[ Apply ]
```

Cart updates instantly.

---

# 8. Assign Order Type

Before payment:

```
Order Type:
(•) Dine-in
( ) Takeaway
( ) Delivery
```

If Dine-in:

```
Select Table:
[ Table 01 ]
```

Table availability should show:
- Green = Available
- Red = Occupied

---

# 9. Proceed to Payment

Bottom sticky button:

```
[ Proceed to Payment ]
```

Disabled if:
- Cart empty
- Network disconnected

---

# 10. Payment Screen Transition

When tapped:

System state:
```
Order Status → PENDING_PAYMENT
```

UI:

```
Total: $13.80

Select Payment:

[ Cash ]
[ Card ]
[ QR Pay ]
[ E-Wallet ]
```

---

# 11. Cash Payment Flow

If Cash selected:

```
Total: $13.80

Amount Received:
[ 20.00 ]

Change:
$6.20

[ Confirm Payment ]
```

Auto-calculation required.

---

# 12. Post-Payment State

On confirm:

System updates:
```
Payment → PAID
Order → PREPARING
```

Triggers:
- Push to kitchen display
- Update dashboard
- Add to shift summary

---

# 13. Micro Interaction Design

When item added:

- Cart briefly highlights
- Small scale animation (100–150ms)
- Subtle sound (optional)

When total updates:
- Smooth number transition
- No layout jump

---

# 14. Error Handling

## Out of Stock

When adding item:

```
⚠ Item Out of Stock
```

Add button disabled automatically.

---

## Price Changed Mid-Order

System alert:

```
Price Updated
Latte now $4.00
[ Accept Update ]
```

---

## Network Failure

Show:

```
Offline Mode
Order will sync automatically
```

If offline mode supported.

---

# 15. UX Optimization for Peak Hour

- No deep nested screens
- No page reload
- No heavy animation
- Fast search bar at top
- Barcode scanning support (optional)

---

# 16. Keyboard Shortcut Enhancement (Desktop)

Optional:

- F1 → New Order
- F2 → Focus Search
- Enter → Confirm Payment
- ESC → Close modal

---

# 17. State Lifecycle (Walk-In Order)

```
DRAFT
  ↓
PENDING_PAYMENT
  ↓
PAID
  ↓
PREPARING
  ↓
COMPLETED
```

Cashier controls:
- DRAFT
- PENDING_PAYMENT
- PAID

Kitchen controls:
- PREPARING
- COMPLETED

---

# 18. Final UX Philosophy

Walk-in order flow must:

- Feel instant
- Require zero explanation
- Be operable under stress
- Prevent accidental mistakes
- Minimize taps

In café rush hour,
speed is revenue.
Clarity is control.
