# Qordia — Barista / Kitchen Staff Flow & UI/UX Wireframe  
### For Cafés, Coffee Shops, Food Courts & Small Restaurants  
### Device Strategy: Tablet-First (Responsive to Desktop & Mobile)

---

# 1. Design Philosophy

The Barista / Kitchen interface must:

- Be glanceable within 1–2 seconds
- Require minimal interaction
- Support high-pressure peak hours
- Clearly show modifiers
- Avoid complex navigation
- Work primarily on tablets (10–13 inch)

Primary Device:
- Tablet mounted near preparation area

Secondary Support:
- Desktop (food court central kitchen)
- Mobile (backup or lightweight mode)

---

# 2. Kitchen Flow Overview

```
Login
  ↓
Select Station (Bar / Kitchen / Dessert)
  ↓
Live Order Board
  ↓
Accept Order
  ↓
Prepare Items
  ↓
Mark Item Complete
  ↓
Order Ready
  ↓
Completed Archive
```

---

# 3. Role-Based Station Logic

Each staff member selects station:

```
[ Barista ]
[ Kitchen ]
[ Dessert ]
[ All Items ]
```

System filters items based on:

```
Product → Assigned Station
```

Example:
- Latte → Bar
- Croissant → Kitchen
- Ice Cream → Dessert

---

# 4. Tablet-First Layout (Landscape Mode)

```
┌─────────────────────────────────────────────────────────────┐
│ Qordia | Station: BAR | Active Orders: 8 | Logout          │
├─────────────────────────────────────────────────────────────┤
│ Filter: [All] [New] [Preparing] [Ready]                    │
├─────────────────────────────────────────────────────────────┤
│ Order Cards Grid (3–4 Columns Responsive)                  │
│                                                             │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│ │ Order A102 │  │ Order A103 │  │ Order A104 │             │
│ │ Table 05   │  │ Takeaway   │  │ Table 02   │             │
│ │ 2 Items    │  │ 1 Item     │  │ 3 Items    │             │
│ └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

Design Rules:
- Card-based layout
- High contrast
- Large tap targets
- Color-coded states

---

# 5. Order Card Wireframe

```
┌──────────────────────────────┐
│ Order #A102                  │
│ Table 05                     │
│ 10:21 AM                     │
├──────────────────────────────┤
│ 1x Latte (Medium)            │
│   - Oat Milk                 │
│   - Extra Shot               │
│                              │
│ 1x Cappuccino (Large)        │
├──────────────────────────────┤
│ Status: NEW                  │
│ [ Accept ]                   │
└──────────────────────────────┘
```

---

# 6. Order State Flow

```
NEW → ACCEPTED → PREPARING → READY → COMPLETED
```

Color System:

- NEW → Amber
- ACCEPTED → Blue
- PREPARING → Purple
- READY → Green
- COMPLETED → Grey (archived)

---

# 7. Accept Order Flow

When tapped:

```
Status → ACCEPTED
Assigned to current staff
Timer starts
```

UI changes:

- Card border turns blue
- “Accept” button replaced with:

```
[ Start Preparing ]
```

---

# 8. Preparing Mode (Expanded View)

Tap card to expand:

```
┌──────────────────────────────┐
│ Order #A102 | Table 05       │
│ Elapsed: 02:14               │
├──────────────────────────────┤
│ 1x Latte (Medium)            │
│   - Oat Milk                 │
│   - Extra Shot               │
│   Notes: Less foam           │
│   [ Mark Item Ready ]        │
│                              │
│ 1x Cappuccino (Large)        │
│   [ Mark Item Ready ]        │
├──────────────────────────────┤
│ [ Mark All Ready ]           │
└──────────────────────────────┘
```

Item-level completion supported.

---

# 9. Modifier Display Design

Modifiers must be:

- Indented
- High contrast
- Smaller but readable font
- Clearly grouped

Example:

```
Latte (Medium)
   • Oat Milk
   • Extra Shot x2
   • 50% Sugar
```

Important:
No truncation allowed on tablet view.

---

# 10. Mark Item Ready Logic

When item marked ready:

- Item turns green
- Strike-through or fade effect
- System checks if all items ready

If all ready:

```
Order Status → READY
```

Notification sent to:
- Cashier
- Customer (if QR order)

---

# 11. Ready State Wireframe

```
┌──────────────────────────────┐
│ Order #A102                  │
│ READY                        │
│                              │
│ All Items Completed          │
│                              │
│ [ Complete Order ]           │
└──────────────────────────────┘
```

On completion:

```
Order → COMPLETED
Move to archive
```

---

# 12. Food Court Mode (Multi-Order High Volume)

Tablet grid expands:

```
Auto-layout:
2 columns (small tablet)
3 columns (large tablet)
4 columns (desktop)
```

Priority sorting:
- Oldest first
- Priority flag
- Takeaway highlighted

---

# 13. Priority & Special Flags

Special labels:

```
[ VIP ]
[ Allergy Alert ]
[ High Priority ]
```

Allergy items highlighted in red border.

---

# 14. Desktop Mode (Kitchen Central Display)

Desktop optimized layout:

```
Split screen:

Left: NEW Orders
Right: PREPARING Orders
```

Larger font.
Minimal interaction.
Mouse or touch compatible.

---

# 15. Mobile Compact Mode

For small screens:

```
Vertical stack
Single column
Swipe to change state
```

Example:

Swipe right → Accept  
Swipe left → Mark Ready  

Designed as lightweight backup.

---

# 16. Real-Time Sync Behavior

System must support:

- WebSocket live updates
- Instant order appearance
- Modifier updates synced
- Auto-scroll to newest order

---

# 17. Sound & Visual Alerts

Optional:

- Soft sound when new order arrives
- Flash border animation (1 time only)
- Timer color shift if exceeding SLA

Example:
- >5 min → Orange timer
- >10 min → Red timer

---

# 18. Error Handling

If network drops:

```
Offline Mode
Orders will sync when reconnected
```

If duplicate acceptance attempt:

```
Order already accepted by Anna
```

---

# 19. Performance Requirements

- Render 20+ orders smoothly
- No heavy animation
- No screen reload
- Minimal modal usage
- One-tap state transitions

---

# 20. Station Filtering (Advanced)

Top filter:

```
Items Filter:
[ All ]
[ Drinks Only ]
[ Hot Drinks ]
[ Cold Drinks ]
```

For large cafés:
Allows sub-station segmentation.

---

# 21. Kitchen KPI Support

Optional overlay:

```
Avg Prep Time: 4m 12s
Active Orders: 8
Delayed: 2
```

Small badge display in header.

---

# 22. Accessibility & Visibility

- Minimum 18px font
- High contrast backgrounds
- Large tap zones (≥ 48px)
- Dark mode support (recommended for kitchen lighting)

---

# 23. Final UX Principles

For Baristas:
- Immediate clarity
- Modifier visibility first
- Fast state changes

For Kitchen Staff:
- No cognitive overload
- Station-based filtering
- Large readable text

Tablet-first ensures:
- Balanced layout
- Clear grid structure
- Easy interaction with gloves or wet hands

The kitchen interface is not decorative.  
It is an operational command surface.

Speed = Efficiency.  
Clarity = Accuracy.  
Consistency = Quality.
