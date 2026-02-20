# Qordia API Usage Guide

This document outlines how to use the Qordia API to programmatically interact with your business data.

---

## 1. Overview

The Qordia API provides programmatic access to your business's data, allowing you to build custom integrations, connect to external systems like a Point-of-Sale (POS), or create your own analytics dashboards.

The API is RESTful, uses predictable resource-oriented URLs, and responds with JSON-encoded data.

---

## 2. Authentication

All API requests must be authenticated using an API key generated from your Qordia dashboard (`Staff > API Access`).

To authenticate, provide your API key as a Bearer token in the `Authorization` header of your request.

**Example Header:**
```
Authorization: Bearer qordia_live_sk_xxxxxxxxxxxxxxxxxxxxxxxx
```

Requests made without authentication or with an invalid key will fail with a `401 Unauthorized` error.

---

## 3. Rate Limiting

To ensure platform stability, API requests are rate-limited. The current limit is **100 requests per minute** per API key. If you exceed this limit, you will receive a `429 Too Many Requests` response.

---

## 4. Endpoints

All endpoints are prefixed with `/api/v1`. The base URL depends on your environment.

### Menu Endpoints

#### `GET /api/v1/menu`
-   **Description:** Retrieves a list of all menu items and categories for your tenant.
-   **Response:** An array of `MenuItem` objects.

#### `GET /api/v1/menu/{itemId}`
-   **Description:** Retrieves a single menu item by its ID.
-   **Response:** A single `MenuItem` object.

### Order Endpoints

#### `GET /api/v1/orders`
-   **Description:** Retrieves a list of orders for your tenant.
-   **Query Parameters:**
    -   `status`: (Optional) Filter orders by status (e.g., `Placed`, `In Progress`, `Ready`).
    -   `limit`: (Optional) Number of orders to return (default: 50).
    -   `offset`: (Optional) Number of orders to skip for pagination.
-   **Response:** An array of `Order` objects.

#### `POST /api/v1/orders`
-   **Description:** Creates a new order. This is useful for POS integrations where an order is taken in person but needs to be sent to the Qordia Kitchen Display System.
-   **Request Body:** A JSON object representing the new order.
-   **Response:** The newly created `Order` object.

#### `GET /api/v1/orders/{orderId}`
-   **Description:** Retrieves a single order by its ID.
-   **Response:** A single `Order` object.

#### `PATCH /api/v1/orders/{orderId}`
-   **Description:** Updates the status of an existing order.
-   **Request Body:**
    ```json
    {
      "status": "In Progress"
    }
    ```
-   **Response:** The updated `Order` object.

---

## 5. Example Request (cURL)

Here is an example of how to fetch your menu items using cURL:

```bash
curl "https://<your-qordia-domain>/api/v1/menu" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 6. Security Reminder

Your API keys grant significant access to your account. Treat them like passwords and keep them secure.
-   Do not expose them in client-side code (e.g., in your website's JavaScript).
-   Do not commit them to version control (e.g., Git).
-   Revoke and regenerate keys immediately if you suspect they have been compromised.
