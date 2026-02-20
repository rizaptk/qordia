# Qordia Platform Admin Guide

This document explains how to operate the Qordia Platform Admin section and how to grant administrative privileges to a user.

---

## 1. Overview

The Qordia Platform Admin is the central control panel for managing the entire Qordia SaaS platform. It is intended for internal use by the Qordia team to oversee all tenant accounts, monitor system health, and manage billing.

The admin platform is accessible via the `/platform` route in the application.

---

## 2. How to Become a Platform Admin

Access to the admin platform is highly restricted and based on a user's role, which is defined using **Firebase Authentication custom claims**.

To grant a user platform admin privileges, their Firebase Auth user record must have a specific custom claim set.

### Required Custom Claim:
- **Claim Name:** `platform_admin`
- **Claim Value:** `true`

**Example Claim Payload:**
```json
{
  "platform_admin": true
}
```

### How to Set Custom Claims for Platform Admins

Setting custom claims is a **privileged, server-side operation** used to grant special, system-wide permissions. It cannot be done from the client-side application for security reasons and requires the **Firebase Admin SDK**.

In Qordia, this process is **only required to create a Platform Admin**. Roles for regular staff and managers are handled automatically through their user profile in the database.

#### To make a user a Platform Admin:
1.  **Identify the User's UID:** Get the unique Firebase UID of the user from the Firebase Console's "Authentication" section.
2.  **Use a Secure Server Environment:** Run a script in a secure environment (like your local machine with authenticated credentials or a secure cloud function) that uses the Firebase Admin SDK.
3.  **Run the Script:** The script will programmatically set the `platform_admin` custom claim for the specified user UID.

#### Conceptual Script Example (Node.js):
This is a conceptual example. Do not run this directly in the app.

```javascript
// This code uses the Firebase Admin SDK and must be run in a secure server environment.
const admin = require('firebase-admin');

// Initialize the Admin SDK with your service account credentials
const serviceAccount = require('./path/to/your-service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// The UID of the user you want to make an admin
const uid = 'USER_UID_TO_MAKE_ADMIN';

// Set the custom claim for the user
admin.auth().setCustomUserClaims(uid, { platform_admin: true })
  .then(() => {
    console.log(`Successfully set platform_admin claim for user ${uid}`);
    // The user will have the new role the next time they sign in and their ID token is refreshed.
  })
  .catch(error => {
    console.error('Error setting custom claims:', error);
  });
```

Once the claim is set, the user must sign out and sign back in for the new claim to be included in their ID token and for access to the Platform Admin area to be granted.

---

## 3. Core Admin Modules

The admin platform is divided into three main sections:

### Tenant Management (`/platform/tenants`)
- **Purpose:** To manage all the individual businesses (tenants) using Qordia.
- **Features:**
    - **List & View:** See a list of all registered tenant accounts (cafés, restaurants).
    - **Create:** Register a new tenant on the platform.
    - **Edit:** Modify tenant details, such as their name or subscription plan.
    - **User Management:** View the staff members associated with a specific tenant.
    - **Feature Flags:** Enable or disable specific Qordia features for individual tenants.

### System Monitoring (`/platform/monitoring`)
- **Purpose:** To provide a high-level overview of the platform's operational health.
- **Features:**
    - **Dashboard:** View key metrics like system uptime, API response times, and the number of active connections.
    - **Error Logs:** A centralized place to view system-wide error logs to quickly identify and diagnose issues.

### Billing & Subscriptions (`/platform/billing`)
- **Purpose:** To manage the financial and subscription aspects of the SaaS platform.
- **Features:**
    - **Subscription Overview:** View the current subscription status (e.g., Paid, Overdue) for all tenants.
    - **Plan Management:** Define and manage the available subscription plans (e.g., Basic, Pro, Enterprise) and the features included in each.
    - **Invoice Generation (Conceptual):** Functionality to generate and track invoices for tenants.

---

## 4. Security Reminder

The Platform Admin section has access to all data across the entire Qordia platform. Access is strictly controlled by the `platform_admin` custom claim. This claim is checked by:
1.  **The Frontend:** To render the correct UI and navigation.
2.  **Firestore Security Rules:** To authorize database read/write operations.

Always exercise caution when granting admin privileges.
