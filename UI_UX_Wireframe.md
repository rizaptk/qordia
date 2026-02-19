# Qordia UI/UX Wireframe Flow Suggestion

This document outlines the recommended UI/UX wireframe flow for Qordia, optimized for:

- Cafés
- Coffee shops
- Food courts
- Small restaurants

The focus is on:
- Speed
- Simplicity
- Minimal training required
- Peak-hour usability
- Mobile-first experience

---

# 📱 1. Customer Mobile Web Flow (Primary Experience)

Qordia’s most critical UX surface is the mobile ordering interface.

---

## 🟣 Entry Screen — QR Landing

### Screen: Table Session Start

**Wireframe Layout**

```
---------------------------------
[ Qordia Logo ]

You're seated at:
Table A12

[ Start Ordering ]

Small Text:
No app required • Secure session
---------------------------------
```

### UX Goals
- Confirm correct table
- Reduce confusion
- Clear primary CTA
- Zero friction entry

---

## 🟣 Home Menu Screen

### Screen: Menu Categories

**Wireframe Layout**

```
---------------------------------
[ Table A12 ]     [ Cart 🛒 2 ]

Search...

Categories:
[ Coffee ]
[ Non-Coffee ]
[ Food ]
[ Snacks ]
[ Desserts ]

Popular Items:
[ Latte ]      $4.50
[ Croissant ]  $3.00
---------------------------------
```

### UX Goals
- Sticky cart indicator
- Quick category access
- Search visibility
- Highlight best sellers

---

## 🟣 Menu Item Detail Screen

### Screen: Product Customization

**Wireframe Layout**

```
[ Back ]

Latte
$4.50

Size:
( ) Small
(•) Medium
( ) Large

Sugar Level:
( ) 25%
(•) 50%
( ) 75%
( ) 100%

Add-ons:
[ ] Extra Shot (+$1)
[ ] Oat Milk (+$0.5)

Notes:
[___________________]

[ Add to Cart ]
```

### UX Goals
- Clear customization grouping
- Radio buttons for variants
- Checkboxes for add-ons
- Persistent CTA at bottom

---

## 🟣 Cart Screen

### Screen: Order Review

```
---------------------------------
Your Order (Table A12)

1x Latte (Medium, 50%)
1x Croissant

Subtotal: $7.50
Tax: $0.75
Total: $8.25

[ Place Order ]
---------------------------------
```

### UX Goals
- Transparent pricing
- Easy edit/remove items
- Clear confirmation button

---

## 🟣 Order Confirmation Screen

```
🎉 Order Received!

Order #A12034

Status: Preparing

Estimated time: 8 minutes

[ Track Order ]
```

### UX Goals
- Reduce anxiety
- Show progress
- Reinforce system reliability

---

## 🟣 Order Tracking Screen

```
Order #A12034

● Received
● Preparing
○ Ready
○ Completed
```

### UX Goals
- Visual progress indicator
- Real-time updates
- Optional push notification (if PWA)

---

# 🧑‍🍳 2. Kitchen / Barista Display Flow (Tablet UI)

Design must prioritize clarity and speed over aesthetics.

---

## 🟣 Kitchen Dashboard

### Screen: Order Queue

```
---------------------------------
LIVE ORDERS (12)

[ #034 ]  Table A12
2 Items
- Latte (Medium, 50%)
- Croissant

[ Start ]
---------------------------------
```

### UX Goals
- Large readable text
- Color-coded status
- Minimal distraction
- One-tap status change

---

## 🟣 Order Preparation Screen

```
#034 — Table A12

Items:
☐ Latte (Medium, 50%)
☐ Croissant

[ Mark as Ready ]
```

### UX Goals
- Checkbox per item
- Batch completion option
- Prevent accidental taps

---

# 🏃 3. Service Staff Flow

---

## 🟣 Ready Orders Screen

```
READY TO SERVE (3)

#034 — Table A12
#035 — Table B03

[ Mark Delivered ]
```

### UX Goals
- Group by table
- Quick confirmation
- Avoid duplicate delivery

---

# 💳 4. Cashier Flow (Optional)

---

## 🟣 Open Tables Screen

```
Active Tables

A12 — $8.25
B03 — $12.50

[ Select Table ]
```

---

## 🟣 Payment Screen

```
Table A12

Total: $8.25

Payment Method:
( ) Cash
( ) Card
( ) QR Pay

[ Complete Payment ]
```

---

# 🏪 5. Manager Dashboard (Desktop First)

---

## 🟣 Overview Dashboard

```
---------------------------------
Today’s Sales: $1,250
Active Orders: 6
Top Item: Latte

[ View Reports ]
[ Manage Menu ]
[ Manage Tables ]
---------------------------------
```

---

## 🟣 Menu Management Screen

```
Menu Items

[ + Add Item ]

Latte         $4.50  [Edit]
Croissant     $3.00  [Edit]
Matcha Latte  $5.00  [Edit]
```

---

## 🟣 Table Management Screen

```
Tables

A01 [Active]
A02 [Available]
A03 [Reserved]

[ Generate QR ]
```

---

# 🎨 UX Design Principles for Qordia

## 1. Mobile-First Design
Customers primarily use mobile devices.

## 2. Peak Hour Optimization
- Large tap targets
- Minimal input typing
- Fast load times

## 3. Color Status System

- Purple → Primary actions
- Mint → Success / Ready
- Amber → Attention
- Red → Cancel / Error

---

# 🔄 End-to-End Interaction Flow

```
Customer → Scan QR
         → Browse Menu
         → Place Order
         ↓
System Routes Order
         ↓
Kitchen / Barista Prepares
         ↓
Service Staff Delivers
         ↓
Payment Completed
         ↓
Manager Reviews Analytics
```

---

# 🧠 UX Strategy Recommendations

## Reduce Friction
- No forced login
- No app download required
- Auto-detect table

## Increase Upselling
- “Frequently ordered together”
- “Add extra shot?”
- “Popular add-on”

## Improve Speed
- Lazy-load images
- Preload popular categories
- Instant cart feedback

---

# ⭐ Future UX Enhancements

- Loyalty points system
- Customer reorder history
- Multi-language toggle
- Split bill support
- Table-to-table order merging
- Smart recommendations based on peak hours

---

# ✅ Final Design Direction Summary

Qordia’s UI/UX should feel:

- Fast
- Clean
- Modern
- Friendly
- Stress-free for café teams
- Effortless for customers

The design must prioritize operational efficiency over decorative complexity while maintaining strong brand identity.
