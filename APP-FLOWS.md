# Qordia Complete Application Flow by User Roles

This document describes the full operational flow of Qordia based on each user role within the ecosystem. The flows are designed primarily for cafés, coffee shops, food courts, and small restaurants.

---

# 👥 Role Overview

Qordia supports the following primary roles:

1. Customer
2. Service Staff / Runner
3. Barista / Kitchen Staff
4. Cashier (Optional depending on workflow)
5. Outlet Manager / Owner
6. Qordia Platform Admin (Internal SaaS Role)

---

# ☕ 1. Customer Flow

## Entry Point

### Step 1 — Scan Table / Seating QR Code
- Customer arrives and sits at a table or seating area
- Customer scans QR code using mobile phone
- Browser automatically opens Qordia ordering page
- System identifies:
  - Table / seating zone
  - Outlet / branch
  - Active menu availability

---

## Menu Browsing

### Step 2 — Browse Digital Menu
Customer can:

- View categories (Coffee, Drinks, Food, Desserts, Snacks)
- View item images and descriptions
- View pricing and availability
- Customize items:
  - Sugar level
  - Ice level
  - Toppings
  - Milk options
  - Add-ons
  - Special preparation notes

---

## Ordering Process

### Step 3 — Add Items to Cart
Customer can:

- Adjust item quantities
- Review item customization
- Add notes for preparation
- View order total

---

### Step 4 — Confirm Order
Customer submits order.

System automatically:
- Assigns order to table / seating zone
- Sends order to preparation station
- Records order timestamp

Optional customer actions:
- Input customer name
- Join group order
- Select payment method (if enabled)

---

## Order Monitoring

### Step 5 — Track Order Status
Customer can view order progress:

- Order received
- Preparing
- Ready to serve / pickup
- Completed

---

## Payment Flow

### Step 6 — Payment Completion
Depending on outlet configuration:

- Pay before preparation
- Pay after dining
- Pay via digital payment gateway
- Pay at cashier

---

## Exit

### Step 7 — Session Completion
- Order marked completed
- Table session remains open or auto resets
- Customer leaves outlet

---

# 🧑‍🍳 2. Barista / Kitchen Staff Flow

## Order Reception

### Step 1 — View Incoming Orders
Preparation staff sees orders via Kitchen Display System.

Orders display:
- Item list
- Customization details
- Table or pickup reference
- Order queue priority
- Order timestamp

---

## Preparation Process

### Step 2 — Start Preparation
Staff marks order as:

- In preparation

System updates customer order tracking.

---

### Step 3 — Complete Preparation
Staff marks items or entire order as:

- Ready to serve
- Ready for pickup

System notifies:
- Service staff
- Customer order status

---

# 🏃 3. Service Staff / Runner Flow

## Order Delivery

### Step 1 — Monitor Ready Orders
Runner or service staff sees:

- Completed orders
- Table or seating assignment
- Order grouping

---

### Step 2 — Deliver Orders
Staff:

- Serves items to correct table
- Confirms order delivery inside system

---

### Step 3 — Table Monitoring
Staff may:

- Assist customers
- Verify table completion
- Reset table if required

---

# 💳 4. Cashier Flow (Optional Role)

Some cafés and food courts may still use cashier-based payments.

---

## Payment Processing

### Step 1 — Access Active Orders
Cashier views:

- Open table sessions
- Pending payments
- Order history

---

### Step 2 — Process Payment
Cashier:

- Confirms payment amount
- Selects payment method
- Records transaction
- Generates receipt

---

### Step 3 — Close Table Session
Cashier or system:

- Marks order fully paid
- Closes table session

---

# 🏪 5. Outlet Manager / Owner Flow

## Daily Operations Dashboard

### Step 1 — Monitor Live Operations
Manager can view:

- Active orders
- Table usage
- Sales summary
- Order queue status
- Staff activity

---

## Menu Management

### Step 2 — Manage Menu Items
Manager can:

- Create new menu items
- Edit pricing and variants
- Upload item images
- Mark items as sold out
- Schedule menu availability

---

## Table and Seating Configuration

### Step 3 — Manage Tables
Manager can:

- Create seating zones
- Assign QR codes
- Merge or split tables
- Reset table sessions

---

## Analytics and Reporting

### Step 4 — Review Business Insights
Manager can access:

- Sales reports
- Best-selling items
- Peak business hours
- Customer ordering behavior
- Table turnover metrics

---

## Staff Management

### Step 5 — Manage Outlet Users
Manager can:

- Assign staff roles
- Control permission levels
- Monitor staff activity logs

---

# 🧩 6. Qordia Platform Admin Flow (SaaS Internal Role)

This role manages the overall Qordia platform.

---

## Tenant Management

### Step 1 — Manage Business Accounts
Platform admin can:

- Register new outlets
- Configure subscription plans
- Manage tenant data
- Enable or disable features

---

## System Monitoring

### Step 2 — Monitor Platform Health
Admin can:

- Monitor system uptime
- Track API performance
- Monitor error logs
- Manage deployment versions

---

## Billing and Subscription

### Step 3 — Manage Billing
Admin can:

- Track outlet subscription usage
- Generate invoices
- Manage payment plans
- Handle subscription upgrades or downgrades

---

## Feature Configuration

### Step 4 — Feature Flag Control
Admin can:

- Enable experimental features
- Roll out new product modules
- Manage rollout by tenant or region

---

# 🔄 Cross-Role Interaction Flow

```
Customer → Places Order  
     ↓  
System → Sends Order to Preparation Station  
     ↓  
Barista/Kitchen → Prepares Order  
     ↓  
Service Staff → Delivers Order  
     ↓  
Customer → Receives Order & Completes Payment  
     ↓  
Manager → Receives Sales & Analytics Data  
     ↓  
Platform Admin → Maintains System Infrastructure
```

---

# ⚙ Exception Handling Flow

## Sold Out Item Handling
- Manager marks item unavailable
- Menu auto updates for customers

---

## Order Modification
- Staff may adjust order before preparation starts
- System logs all modifications

---

## Table Reset Flow
- Staff or system closes completed sessions
- Table becomes available for next customer

---

# 📱 Multi-Device Flow

Qordia supports multiple devices simultaneously:

- Customer mobile browser
- Kitchen display tablet
- Staff service device
- Manager dashboard desktop
- Platform admin console

---

# 🧠 Design Philosophy

Qordia app flow is designed to:

- Reduce manual order handling
- Improve café operational speed
- Maintain intuitive user interaction
- Support small team workflows
- Scale with growing business needs

---

# ⭐ Summary

Qordia provides an end-to-end digital ordering and operational system connecting customers, staff, and business management into one seamless workflow optimized for cafés, coffee shops, food courts, and small restaurants.
