# Qordia — Digital Menu (Customer) & Walk-In Order (Cashier)  
## Advanced Modifier-Supported UI/UX Flow & Wireframe

This document defines:

1. Customer-side QR Digital Menu Flow  
2. Cashier Walk-In Order Flow  
3. Unified Modifier Engine Behavior  
4. Wireframe Layout Structures  
5. Validation & Pricing Logic  
6. UX Optimization for Café Environments  

The goal is to ensure:
- Modifier consistency across roles
- Clear pricing logic
- Zero ambiguity
- Fast ordering during peak hours

---

# PART 1 — CUSTOMER SIDE DIGITAL MENU

---

# 1. Customer Entry Flow (QR-Based)

```
Scan QR
  ↓
Load Outlet Context
  ↓
Load Published Menu
  ↓
Browse Categories
  ↓
Select Product
  ↓
Configure Modifiers
  ↓
Add to Cart
  ↓
Checkout
  ↓
Select Payment
  ↓
Order Submitted
```

System loads:
- Outlet
- Table number
- Menu version
- Availability rules

---

# 2. Digital Menu Layout Structure (Mobile First)

```
┌──────────────────────────┐
│ Outlet Name              │
│ Table 05                 │
├──────────────────────────┤
│ Search 🔍               │
├──────────────────────────┤
│ Category Scroll (Sticky) │
│ [Coffee][Snacks][Dessert]│
├──────────────────────────┤
│ Product List             │
│                          │
│ Latte        $3.50       │
│ Cappuccino   $3.50       │
│ Croissant    $2.00       │
│                          │
├──────────────────────────┤
│ Cart (Sticky Bottom Bar) │
│ 2 items | $8.50  → View  │
└──────────────────────────┘
```

---

# 3. Product Detail Screen (With Modifiers)

When product has modifiers:

```
┌──────────────────────────┐
│ ← Back                   │
│ Latte                    │
│ $3.50                    │
│ Rich espresso & milk     │
├──────────────────────────┤

Size (Required - Select 1)
( ) Small  - $3.00
(•) Medium - $3.50
( ) Large  - $4.00

Milk Options (Select 1)
(•) Regular
( ) Oat Milk +$0.50
( ) Almond +$0.50

Add-ons (Optional - Multiple)
[ ] Extra Shot +$1.00
[ ] Caramel    +$0.70

Sugar Level (Optional)
[ 50% ▼ ]

Notes (Optional)
[ No foam please ]

--------------------------------
Quantity [-] 1 [+]

TOTAL: $4.50

[ Add to Cart ]
```

---

# 4. Modifier Logic (Customer Side)

## Required Group
- Must select before Add to Cart enabled

## Single Selection
- Radio button style

## Multiple Selection
- Checkbox style

## Quantity-Based Modifier (Advanced)
Example:
Extra Shot x2

UI:

```
Extra Shot  [-] 0 [+]
```

---

# 5. Cart Screen

```
Your Order

1x Latte (Medium)
   - Oat Milk
   - Extra Shot
   $4.50

2x Croissant
   $4.00

---------------------
Subtotal: $8.50
Tax: $0.85
Total: $9.35

[ Continue to Payment ]
```

Each item editable:

```
[ Edit ]
[ Remove ]
```

Edit reopens modifier screen with pre-filled selections.

---

# 6. Checkout Flow

```
Select Payment Method

(•) Pay at Counter
( ) QR Payment
( ) E-Wallet
```

On confirm:

```
Order Status → PENDING
Payment → UNPAID / PENDING
```

Order pushed to:
- Cashier
- Kitchen

---

# PART 2 — CASHIER WALK-IN ORDER (MODIFIER SUPPORT)

---

# 7. Walk-In Order Layout (Tablet/Desktop)

```
┌────────────────────────────────────────────┐
│ Header (Shift | Search | Quick Actions)   │
├───────────────────────────────┬────────────┤
│ Product Grid                  │ Cart Panel │
│                               │            │
│ [Coffee] [Snacks] [Dessert]   │ Cart Items │
│                               │ Totals     │
│ Latte        $3.50 [+]        │ Payment    │
│ Cappuccino   $3.50 [+]        │            │
└───────────────────────────────┴────────────┘
```

---

# 8. Modifier Popup (Cashier)

When product has modifiers:

```
Latte

Size (Required)
( ) Small
(•) Medium
( ) Large

Milk Options
(•) Regular
( ) Oat Milk +$0.50

Add-ons
Extra Shot  [-] 1 [+]\
Caramel     [-] 0 [+]

[ Cancel ]      [ Add to Cart ]
```

---

# 9. Cart Behavior (Cashier)

Cart item format:

```
1x Latte (Medium)
   - Oat Milk
   - Extra Shot x1
   $4.50
```

Controls per line:

```
[ - ] Qty [ + ]
[ Edit ]
[ Remove ]
```

Editing reopens modifier popup.

---

# 10. Modifier Engine Consistency Rules

Shared across Customer & Cashier:

1. Unique combination = unique cart line
2. Price recalculated in real time
3. Required groups enforced
4. Modifier quantity tracked
5. Tax calculated after modifier total

---

# 11. Pricing Formula

```
Final Item Price =
(Base or Variant Price)
+ Sum(Modifier Prices)
× Quantity
```

Then:

```
Order Total =
Sum(All Items)
+ Tax
+ Service
- Discount
```

---

# 12. Availability Handling

If modifier unavailable:

Customer View:
- Option greyed out
- Marked “Unavailable”

Cashier View:
- Disabled selection
- Tooltip: Out of stock

---

# 13. Performance Optimization

Customer:
- Preload modifier groups
- Lazy load images
- Sticky cart preview

Cashier:
- No full screen navigation
- Modal-based modifier
- Keyboard shortcut supported

---

# 14. UX Safeguards

Customer:
- Disable Add button until required selections made
- Highlight missing required groups
- Show live total update

Cashier:
- Prevent accidental rapid multi-add
- Confirm removal if quantity = 1
- Highlight price changes

---

# 15. Advanced Modifier Scenarios

Supported:

- Required single
- Required multiple (min 2, max 3)
- Optional
- Quantity-based add-ons
- Nested modifiers (advanced mode)
- Conditional modifiers (show only if iced selected)

---

# 16. State Lifecycle (Unified)

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

Modifier selections become immutable after:
```
Order → PREPARING
```

---

# 17. Final UX Philosophy

For Customers:
- Simple
- Visual
- Guided
- Impossible to misconfigure

For Cashiers:
- Fast
- Minimal taps
- Modifier popup lightweight
- No navigation depth

The modifier system must feel invisible —\
powerful underneath,\
simple on the surface.
