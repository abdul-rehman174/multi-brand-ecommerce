# Lumora — A Full-Stack E-Commerce Store

### Project Documentation & Technical Report

---

## Title Page

| | |
|---|---|
| **Project Title** | Lumora — Modern Essentials E-Commerce Store |
| **Type** | Full-Stack Web Application (Frontend + Backend + Database) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js with Express.js |
| **Database** | SQLite |
| **Student Name** | Demo Student |
| **Roll / Registration No.** | DEMO-0000 |
| **Course** | E-Commerce |
| **Instructor** | Demo Instructor |
| **Submission Date** | 10-06-2026 |

---

## 1. Project Overview

**Lumora** is a complete, fully functional online store for modern everyday essentials —
audio, wearables, footwear, bags, home goods and tech accessories. It is a *full-stack*
web application: a clean browser-based storefront (frontend) talks to a Node.js/Express
server (backend), which stores all of its information in a SQLite database.

A visitor can browse the catalogue, search and filter products, view product details,
add items to a shopping cart, create an account, log in, place an order, and review their
past orders. A store administrator can sign in to a protected dashboard and create, edit
and delete products, as well as review all customer orders.

All data — products, users (with securely hashed passwords) and orders — is **persisted**
in the SQLite database, so it survives server restarts.

---

## 2. Objectives

The objectives of this project are to:

1. Design and build a realistic, end-to-end e-commerce application using only lightweight,
   widely understood technologies.
2. Implement a RESTful backend with Express.js that exposes a clean API.
3. Use a relational database (SQLite) for persistent storage of products, users and orders.
4. Demonstrate user authentication with securely hashed passwords and token-based sessions.
5. Implement full CRUD (Create, Read, Update, Delete) operations through an admin panel.
6. Connect a plain HTML/CSS/JavaScript frontend to the backend through `fetch()` calls.
7. Produce a project that is independent, portable and runnable on any computer with Node.js.

---

## 3. Features

### Customer-facing (Frontend)
- **Home page** — hero banner, trust badges, and a curated set of featured products.
- **Product catalogue** — responsive grid of all products.
- **Product search** — search by name, category or description.
- **Category filtering** — filter the catalogue by category, plus sorting (price / rating).
- **Product details page** — image gallery, description, quantity selector, related products.
- **Shopping cart** — add/remove items, change quantities, promo codes, live totals.
- **User registration & login** — create an account and sign in.
- **Checkout** — shipping form, payment method selection and order placement.
- **Order history** — a logged-in customer can see every order they have placed.
- **Responsive design** — works on desktop, tablet and mobile.

### Administration & Backend
- **Admin dashboard** — protected page with store statistics.
- **Product management (CRUD)** — create, edit and delete products through a form.
- **Order management** — view all customer orders.
- **REST API** — JSON endpoints for products, categories, authentication and orders.
- **Authentication & authorization** — JWT tokens; passwords hashed with bcrypt; admin-only routes.
- **Server-side validation** — order totals are recalculated on the server, never trusted from the client.
- **Persistent storage** — all data stored in a SQLite database file.

---

## 4. Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | **HTML5** | Page structure |
| Frontend | **CSS3** | Styling, layout, responsive design |
| Frontend | **JavaScript (ES6+)** | Interactivity, `fetch()` API calls |
| Backend | **Node.js** | JavaScript runtime |
| Backend | **Express.js** | Web server & REST API routing |
| Database | **SQLite** (`better-sqlite3`) | Persistent relational storage |
| Security | **bcryptjs** | One-way password hashing |
| Security | **jsonwebtoken (JWT)** | Stateless login sessions |

No build step, bundler or frontend framework is required.

---

## 5. System Architecture

Lumora follows a simple **three-tier architecture**:

```
   ┌──────────────────────┐        HTTP / JSON        ┌──────────────────────┐         SQL        ┌──────────────┐
   │      FRONTEND         │  ───── fetch() ────────▶  │       BACKEND        │  ──── queries ───▶ │   DATABASE   │
   │  HTML · CSS · JS      │                           │  Node.js + Express   │                    │   SQLite     │
   │  (runs in browser)    │  ◀──── JSON responses ──  │  REST API routes     │  ◀─── rows ──────  │  database.   │
   │                       │                           │                      │                    │  sqlite      │
   └──────────────────────┘                           └──────────────────────┘                    └──────────────┘
```

1. **Frontend (Presentation tier).** Static HTML pages styled with CSS. JavaScript uses the
   browser's `fetch()` function to request data from the backend and renders it into the page.
   The login token is stored in the browser's `localStorage`.

2. **Backend (Application tier).** An Express.js server exposes a REST API under `/api`. It
   handles business logic: validating input, hashing passwords, issuing JWT tokens, calculating
   order totals, and enforcing admin permissions. It also serves the static frontend files.

3. **Database (Data tier).** A single SQLite file (`database.sqlite`) holds four tables. The
   backend is the *only* component that talks to the database.

**Example request flow (placing an order):**
`Checkout page → fetch POST /api/orders (with JWT) → server validates & recomputes totals →
inserts rows into orders + order_items → returns the saved order → page shows confirmation.`

---

## 6. Database Structure

The database contains four tables:

### `users`
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER (PK) | Unique user id |
| name | TEXT | Full name |
| email | TEXT (unique) | Login email |
| password | TEXT | **bcrypt hash** of the password (never plain text) |
| is_admin | INTEGER | `1` for admin, `0` for normal customer |
| created_at | TEXT | Account creation timestamp |

### `products`
| Field | Type | Description |
|-------|------|-------------|
| id | TEXT (PK) | URL-friendly slug, e.g. `aurora-headphones` |
| name | TEXT | Product name |
| category | TEXT | Category name |
| price | REAL | Current price |
| old_price | REAL | Original price (shown struck-through when on sale) |
| rating | REAL | Average star rating |
| reviews | INTEGER | Number of reviews |
| badge | TEXT | `New`, `Sale`, or none |
| image | TEXT | Main image path |
| gallery | TEXT | JSON array of image paths |
| description | TEXT | Product description |
| stock | INTEGER | Units in stock |
| featured | INTEGER | `1` if shown on the home page |
| created_at | TEXT | Creation timestamp |

### `orders`
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER (PK) | Unique order id |
| user_id | INTEGER (FK → users.id) | Who placed the order |
| customer_name, email, address, city, zip, country | TEXT | Shipping details |
| payment_method | TEXT | card / paypal / cod |
| subtotal, shipping, tax, total | REAL | Money breakdown |
| status | TEXT | Order status (default `Processing`) |
| created_at | TEXT | Order timestamp |

### `order_items`
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER (PK) | Line id |
| order_id | INTEGER (FK → orders.id) | Parent order |
| product_id | TEXT | Product reference |
| name | TEXT | Product name at time of purchase |
| price | REAL | Unit price at time of purchase |
| qty | INTEGER | Quantity |

**Relationships:** one *user* has many *orders*; one *order* has many *order_items*.

---

## 7. Installation

> **Prerequisite:** [Node.js](https://nodejs.org/) version 18 or newer. Check with `node -v`.

1. Copy the `Lumora` folder onto your computer (or extract it from the submitted zip).
2. Open a terminal **inside** the `Lumora` folder.
3. Install the dependencies:

   ```bash
   npm install
   ```

   This downloads Express, better-sqlite3, bcryptjs and jsonwebtoken into `node_modules`.

---

## 8. How to Run

1. From inside the `Lumora` folder, start the server:

   ```bash
   npm start
   ```

2. You will see:

   ```
   Lumora store running →  http://localhost:4001
   ```

   On first run, the database is created automatically and filled with 24 sample products
   and two demo accounts.

3. Open a web browser and go to **http://localhost:4001**

4. To stop the server, press `Ctrl + C` in the terminal.

> To reset the store to its original state, stop the server, delete the `database.sqlite`
> file, and start again — it will be re-seeded.

---

## 9. Admin & User Guide

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| **Customer** | `demo@lumora.com` | `demo123` |
| **Administrator** | `admin@lumora.com` | `admin123` |

### As a Customer
1. Click **Shop** to browse, or use the search bar / category chips to narrow results.
2. Click any product to open its details page; choose a quantity and **Add to cart**.
3. Open the **Cart** (top-right icon), review items, then **Proceed to checkout**.
4. **Sign in** (or register) when prompted, fill in the shipping form and **Place order**.
5. Open the account menu → **My orders** to see your order history.

### As an Administrator
1. Sign in with the admin account above.
2. Open the account menu → **Admin panel**.
3. Use **+ Add product** to create a product, **Edit** to change one, or **Delete** to remove one.
4. Switch to the **Orders** tab to review every customer order.

---

## 10. API Reference (Summary)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | List products (supports `?search=`, `?category=`, `?sort=`) |
| GET | `/api/products/:id` | — | Single product |
| GET | `/api/categories` | — | List of categories |
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Log in, returns a token |
| POST | `/api/orders` | User | Place an order |
| GET | `/api/orders` | User | The logged-in user's orders |
| POST | `/api/products` | Admin | Create a product |
| PUT | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Delete a product |
| GET | `/api/admin/orders` | Admin | All orders |

---

## 11. Future Improvements

- Online payment gateway integration (e.g. Stripe) instead of the demo checkout.
- Product reviews and ratings submitted by customers.
- Order status updates (Processing → Shipped → Delivered) controlled by the admin.
- Email confirmation of orders.
- Product image uploads from the admin panel.
- Pagination for very large catalogues.

---

## 12. Conclusion

Lumora demonstrates a complete, working e-commerce system built with a deliberately simple
and transparent technology stack. It covers the full journey from browsing products to placing
an order, backed by a real REST API and a persistent SQLite database, and includes a secure
administrative area for managing the catalogue. The project meets its objectives: it is
functional end-to-end, easy to install and run on any machine with Node.js, and structured
clearly enough to serve as a solid foundation for further development.
