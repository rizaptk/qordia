# Qordia — Menu Management Flow & UI/UX Wireframe  
For Cafés, Coffee Shops, Food Courts & Small Restaurants

Design Goals:
- Simple enough for small cafés
- Structured enough for multi-tenant food courts
- Fast bulk editing
- Modifier-driven flexibility
- Zero technical complexity for owners

Primary Users:
- Admin (Owner)
- Outlet Manager

---

# 1. Menu Management Core Concept

Menu is built from modular components:

```
Category
  └── Product
        ├── Variants (Size / Type)
        ├── Modifiers (Add-ons)
        ├── Price Rules
        ├── Availability Rules
        └── Stock Rules (Optional)
```

System must support:

- Single outlet café
- Multi-outlet food court
- Time-based menu (breakfast/lunch)
- Promo items
- Out-of-stock auto-hide

---

# 2. Menu Management Flow Overview

```
Dashboard
  ↓
Menu Management
  ↓
Select Outlet (if multi-tenant)
  ↓
Manage:
   ├─ Categories
   ├─ Products
   ├─ Modifiers
   ├─ Availability
   ├─ Pricing
   └─ Preview Menu
  ↓
Publish Changes
```

---

# 3. Menu Management Dashboard Wireframe

```
┌────────────────────────────────────────────┐
│ Qordia | Menu Management | Outlet: Main   │
├────────────────────────────────────────────┤
│ Tabs: [Categories] [Products] [Modifiers] │
│       [Availability] [Preview]            │
├────────────────────────────────────────────┤
│ Main Content Area                         │
└────────────────────────────────────────────┘
```

UX Requirements:
- Tab-based navigation
- No deep nested routing
- Autosave drafts
- Clear publish button

---

# 4. Category Management Flow

## 4.1 Category List Wireframe

```
Categories

[ + Add Category ]

--------------------------------
☰ Coffee        (12 items)
☰ Non-Coffee    (8 items)
☰ Snacks        (15 items)
☰ Dessert       (6 items)
--------------------------------
```

Features:
- Drag-and-drop reorder
- Item count indicator
- Quick edit (hover)
- Toggle active/inactive

---

## 4.2 Add / Edit Category Modal

```
Category Name:
[ Coffee ]

Icon (Optional):
[ Upload ]

Visibility:
(•) Active
( ) Hidden

[ Cancel ]   [ Save ]
```

UX Notes:
- Instant preview update
- No page reload
- Auto-save optional

---

# 5. Product Management Flow

---

## 5.1 Product List View

```
Products

[ + Add Product ]   [ Bulk Upload ]

Search: [__________]

--------------------------------------------------
Latte           Coffee       $3.50     Active
Cappuccino      Coffee       $3.50     Active
Croissant       Snacks       $2.00     Out of Stock
--------------------------------------------------
```

Features:
- Quick toggle stock
- Inline price editing
- Filter by category
- Filter by status

---

# 6. Add Product Flow

## Step 1 — Basic Info

```
Product Name:
[ Latte ]

Category:
[ Coffee ▼ ]

Base Price:
[ 3.50 ]

Image:
[ Upload ]

Description:
[ Rich espresso with milk ]

[ Next ]
```

---

## Step 2 — Variants (Optional)

Used for:
- Size (S/M/L)
- Type (Hot/Iced)
- Portion size

```
Enable Variants?  [✓]

Variant Group Name:
[ Size ]

--------------------------------
Small    $3.00
Medium   $3.50
Large    $4.00
--------------------------------

[ + Add Variant ]
```

Rules:
- Each variant overrides base price
- Variants can stack (advanced mode)

---

## Step 3 — Modifiers

Used for:
- Extra shot
- Sugar level
- Toppings
- Add-ons

```
Attach Modifier Group:

[✓] Milk Options
[✓] Add-ons
[ ] Sugar Level
```

Modifiers created in separate module.

---

## Step 4 — Availability

```
Availability:

(•) Always Available
( ) Schedule

If scheduled:

Start Time: 07:00
End Time:   11:00
```

Used for:
- Breakfast menu
- Happy hour
- Seasonal items

---

## Step 5 — Stock Management

Optional:

```
Enable Stock Tracking? [✓]

Initial Stock:
[ 50 ]

Auto-hide when stock = 0? [✓]
```

---

## Step 6 — Save & Publish

```
[ Save Draft ]
[ Publish ]
```

System behavior:
- Draft not visible to customers
- Publish triggers real-time update

---

# 7. Modifier Management Flow

---

## 7.1 Modifier Group List

```
Modifier Groups

[ + Add Modifier Group ]

----------------------------------
Milk Options
Add-ons
Sugar Level
----------------------------------
```

---

## 7.2 Create Modifier Group

```
Group Name:
[ Add-ons ]

Selection Type:
(•) Multiple
( ) Single

Required?
[ ] Yes

----------------------------------
Extra Shot     +$1.00
Oat Milk       +$0.50
Caramel Syrup  +$0.70
----------------------------------

[ + Add Option ]
```

UX Rules:
- Required modifier must be selected by cashier/customer
- Single selection auto-closes modal

---

# 8. Availability Management (Advanced)

Used for:
- Food court rotating menus
- Small restaurant lunch/dinner split

Wireframe:

```
Availability Rules

--------------------------------------
Breakfast Menu
07:00 - 11:00

Lunch Menu
11:00 - 15:00

Happy Hour
16:00 - 18:00
--------------------------------------
```

Drag items into time blocks (optional advanced UI).

---

# 9. Multi-Outlet Support (Food Court Case)

Top dropdown:

```
Outlet:
[ Main Branch ▼ ]
```

Admin can:
- Duplicate menu across outlets
- Override price per outlet
- Sync changes globally

Flow:

```
Edit Product
  ↓
Apply to:
(•) This Outlet Only
( ) All Outlets
```

---

# 10. Menu Preview Mode

Admin can preview:

```
Customer View
Cashier View
Kitchen View
```

Preview Wireframe:

```
Mobile Simulation

[ Coffee ]
  Latte
  Cappuccino

[ Snacks ]
  Croissant
```

Purpose:
- Prevent configuration mistakes
- Visual QA before publish

---

# 11. Bulk Operations

For food courts & larger setups:

- Bulk price update
- Bulk category move
- Bulk stock reset
- CSV import/export

Wireframe:

```
Select Products [✓][✓][✓]

[ Bulk Edit ]
   - Change Category
   - Change Price (+10%)
   - Set Inactive
```

---

# 12. Publish Workflow

System uses versioning:

```
Draft Version → Published Version
```

Publish Confirmation Modal:

```
You have 4 unpublished changes.

[ Review Changes ]
[ Publish Now ]
```

Real-time propagation:
- Cashier system
- QR ordering system
- Kitchen display

---

# 13. UX Guidelines for Café Environments

- Large readable fonts
- Minimal modal stacking
- Inline editing preferred
- Drag-and-drop ordering
- Sticky save button
- Undo last change option

---

# 14. Performance Requirements

- Menu load < 500ms
- Instant category reorder
- Optimistic UI update
- No full page reload

---

# 15. Error Handling

## Duplicate Product Name

```
⚠ Product name already exists in this category
```

## Active Product Without Price

```
⚠ Cannot publish — missing price
```

## Modifier Conflict

```
⚠ Required modifier group missing
```

---

# 16. Menu Lifecycle State

```
Draft
  ↓
Published
  ↓
Archived
```

Admin can:
- Restore archived items
- Clone products
- Duplicate categories

---

# 17. Final Design Philosophy

Menu management must:

- Feel structured but simple
- Support cafés (small menu)
- Support food courts (multi-outlet)
- Handle complex modifiers
- Prevent accidental misconfiguration

For small restaurants:
Clarity > Complexity.

For food courts:
Control > Chaos.

Qordia’s menu system is built to scale
from a single coffee counter
to a multi-tenant food ecosystem.
