# Qordia — Developer Onboarding Guide

Welcome to the Qordia engineering team 👋  
This document will help you understand the product, system architecture, development standards, and workflow expectations.

Qordia is a QR-based self-ordering and operational platform built primarily for cafés, coffee shops, food courts, and small restaurants.

---

# 📌 1. Product Overview

## 🎯 Mission

Enable cafés and small hospitality businesses to:
- Reduce queue congestion
- Improve order accuracy
- Speed up service workflow
- Operate efficiently during peak hours

## 🧩 Core System Modules

Qordia consists of:

1. Customer Ordering (Mobile Web / PWA)
2. Kitchen / Barista Display System
3. Service Staff Interface
4. Cashier (Optional)
5. Manager Dashboard (Web)
6. Platform Admin (Multi-tenant SaaS)
7. API Layer
8. Analytics & Reporting

---

# 🏗 2. System Architecture Overview

## 🧱 High-Level Architecture

```
Customer Mobile (Browser)
        ↓
Frontend App (Web / PWA)
        ↓
API Gateway
        ↓
Application Services
        ↓
Database
        ↓
Realtime Layer (WebSocket / SSE)
```

---

## 🔹 Architecture Principles

- Multi-tenant SaaS design
- Role-based access control
- Event-driven order state management
- Real-time status updates
- Scalable for multi-branch support

---

# 🗂 3. Repository Structure (Suggested)

```
/apps
  /customer-web
  /kitchen-display
  /manager-dashboard
  /admin-panel

/packages
  /ui-components
  /utils
  /types
  /api-client

/services
  /order-service
  /menu-service
  /auth-service
  /analytics-service

/infrastructure
  /docker
  /nginx
  /deployment
```

---

# 🧠 4. Core Domain Concepts

## 🏪 Tenant
A business entity (café, coffee shop, food court tenant).

## 🪑 Table / Seating Zone
QR-linked identifier for ordering session context.

## 🧾 Order
Contains:
- Items
- Customizations
- Status
- Payment state
- Table reference
- Timestamp

## 👤 Role Types

- CUSTOMER
- BARISTA
- SERVICE
- CASHIER
- MANAGER
- ADMIN

---

# 🔄 5. Order Lifecycle

Order status transitions:

```
CREATED
→ CONFIRMED
→ PREPARING
→ READY
→ SERVED
→ COMPLETED
→ CLOSED
```

Status rules:
- Only preparation staff can mark PREPARING or READY
- Only service/cashier can mark SERVED
- Payment completion moves order to COMPLETED

All transitions must be logged for audit trail.

---

# 📡 6. Real-Time Communication

Used for:
- Order status updates
- Kitchen notifications
- Dashboard live metrics

Recommended:
- WebSocket or Server-Sent Events
- Event-driven architecture
- Optimistic UI updates

---

# 🔐 7. Authentication & Authorization

## 🔹 Authentication

- JWT-based session tokens
- Role-based permissions
- Tenant-scoped access

## 🔹 Authorization Matrix Example

| Role     | Menu | Orders | Tables | Reports |
|----------|------|--------|--------|--------|
| Customer | View | Create | Own    | None   |
| Barista  | View | Update | View   | None   |
| Service  | View | Update | Update | None   |
| Manager  | Full | Full   | Full   | Full   |
| Admin    | Global | Global | Global | Global |

---

# 🗃 8. Database Design Overview

Core Tables:

- tenants
- users
- roles
- tables
- menu_categories
- menu_items
- menu_variants
- orders
- order_items
- order_status_logs
- payments
- subscriptions

---

# 📦 9. API Design Principles

## RESTful Convention Example

```
GET    /api/menu
POST   /api/orders
PATCH  /api/orders/:id/status
GET    /api/reports/daily
```

## API Guidelines

- Always tenant-scoped
- Use pagination for lists
- Standard error format
- Consistent response structure

Example:

```
{
  "success": true,
  "data": {},
  "error": null
}
```

---

# 🎨 10. Frontend Guidelines

## UI Principles

- Mobile-first design
- Large tap targets
- Minimal text clutter
- Fast loading performance

## Component Rules

- Reusable components via shared UI package
- Consistent design tokens
- Centralized theme system

---

# ⚡ 11. Performance Standards

Target performance:

- Initial load < 2 seconds
- Order submission < 500ms API response
- Real-time update latency < 300ms
- Optimized image lazy loading

Peak-hour resilience is critical.

---

# 🧪 12. Testing Strategy

## Required Testing Levels

- Unit tests (core logic)
- Integration tests (API layer)
- Role-based access tests
- Order lifecycle tests
- Payment flow validation

Edge case examples:
- Double order submission
- Network interruption during payment
- Simultaneous status update

---

# 🚀 13. Deployment Flow

## Environment Structure

- Development
- Staging
- Production

## Deployment Principles

- Dockerized services
- CI/CD pipeline
- Automated testing before deploy
- Versioned releases
- Rollback capability

---

# 🧰 14. Coding Standards

## Backend

- Clean architecture
- Service-layer separation
- No business logic in controllers
- Centralized validation

## Frontend

- Component-driven structure
- Avoid inline business logic
- Clear state separation
- Consistent naming convention

---

# 📊 15. Observability & Monitoring

Track:

- API latency
- Order submission success rate
- Real-time connection stability
- Error logs per tenant
- Peak usage hours

Log everything related to:
- Order status transitions
- Payment events
- Role-based updates

---

# 🔄 16. Developer Workflow

1. Pull latest changes
2. Create feature branch
3. Implement feature
4. Write tests
5. Submit PR
6. Code review
7. Merge to staging
8. QA validation
9. Production deploy

Branch naming:

```
feature/order-tracking
fix/payment-timeout
refactor/menu-service
```

---

# 📘 17. Documentation Expectations

Every major feature must include:

- Purpose description
- API documentation
- Database changes
- Role access changes
- Edge case handling
- Test coverage summary

---

# 🧠 18. Product Design Philosophy

As a developer at Qordia, remember:

We are building for:
- Small café teams
- Busy peak-hour environments
- Non-technical business owners

Every feature must be:

- Simple
- Reliable
- Fast
- Easy to maintain

---

# ⭐ 19. First Week Checklist

New developer should:

- Understand order lifecycle
- Run project locally
- Explore all roles
- Review database schema
- Read API contracts
- Test order flow end-to-end
- Review authentication flow
- Understand multi-tenant logic

---

# 🎯 Final Reminder

Qordia is a real-time operational system.

Reliability is more important than visual complexity.

Speed is more important than feature overload.

Clarity is more important than abstraction.

Build for peak-hour coffee rush — not empty cafés.

---

Welcome to Qordia engineering 🚀
