# LOADOUT — Technical Reference Manual

**Document type:** Engineering Specification & Operating Manual
**System class:** Full-Stack Web Application (client/server, REST)
**Project title:** Loadout — Gaming Gear & Tech E-Commerce Platform

---

### Submission Record

| Field | Value |
|-------|-------|
| Student Name | Demo Student |
| Roll / Registration No. | DEMO-0000 |
| Course | E-Commerce |
| Instructor | Demo Instructor |
| Submission Date | 10-06-2026 |

> This manual documents a self-contained full-stack web application built on a browser front end, an Express REST API and an embedded SQLite database. Read it as a specification sheet: chapters are numbered, requirements are enumerated, and the data model is given as DDL.

---

## Chapter Index

1. Abstract
2. Design Objectives
3. System Requirements
4. Capability Matrix
5. Technology Stack
6. System Architecture & Data Flow
7. Data Model (Schema Definition)
8. Build & Provisioning
9. Runtime Procedure
10. Operating Guide (Operator & Customer)
11. API Endpoint Reference
12. Roadmap
13. Summary

---

## 1. Abstract

Loadout is a single-vendor gaming gear and consumer-tech retail platform. It presents a browsable product catalogue, a session-based shopping cart, an authenticated checkout pipeline, and a privileged administration console. The application is delivered as a static front end (HTML5 / CSS3 / vanilla JavaScript) communicating over a JSON REST API with a Node.js + Express back end. Persistence is handled by an embedded SQLite database accessed through `better-sqlite3`. No external services are required at runtime; the database file is created and seeded automatically on first start.

**Identity parameters**

| Parameter | Value |
|-----------|-------|
| Store name | Loadout |
| Tagline | Gear up. Game on. |
| Listen port | `4003` |
| Display currency | `$` (USD) |
| Order number prefix | `LO-` (e.g. `#LO-100001`) |
| Catalogue size | 21 products / 6 categories |

---

## 2. Design Objectives

- **2.1** Deliver a complete purchase loop — discovery, cart, authentication, checkout, order history — with no third-party services at runtime.
- **2.2** Enforce server-side authority on all pricing; client-supplied totals are never trusted (see §6.2).
- **2.3** Secure credentials at rest using `bcrypt` hashing and protect privileged routes with signed JSON Web Tokens.
- **2.4** Keep the storage layer zero-configuration: a single file database that self-provisions on first run.
- **2.5** Separate store-specific configuration (§3.3) from generic application logic so the same engine can be re-skinned per store.
- **2.6** Maintain a strict role boundary between customer and administrator capabilities (§4).

---

## 3. System Requirements

### 3.1 Runtime Prerequisites

| Component | Requirement |
|-----------|-------------|
| Node.js | v16 or later (native module support for `better-sqlite3`) |
| npm | Bundled with Node.js |
| Browser | Any modern evergreen browser (Chromium, Firefox, Safari) |
| Network | Localhost only; outbound access optional (product imagery is fetched from a CDN with a local fallback) |

### 3.2 Disk & State

The application maintains exactly one stateful artefact: `database.sqlite` (plus its WAL sidecar files). Deleting this file resets the system to a clean, re-seeded state.

### 3.3 Configurable Constants (`store.config.js`)

| Key | Value | Effect |
|-----|-------|--------|
| `port` | `4003` | HTTP listen port (overridable via `PORT`) |
| `currency` | `$` | Display symbol |
| `freeShippingOver` | `150` | Subtotal threshold for waived shipping |
| `flatShipping` | `9` | Flat shipping fee below threshold |
| `taxRate` | `0.08` | Applied tax rate (8%) |
| `orderPrefix` | `LO` | Order number prefix |
| `jwtSecret` | env or default | HMAC signing key for tokens (overridable via `JWT_SECRET`) |

---

## 4. Capability Matrix

### 4.1 Customer-Facing (Front End)

| ID | Capability | Notes |
|----|-----------|-------|
| C-1 | Browse catalogue | 21 products across 6 categories |
| C-2 | Keyword search | Matches name, category, description |
| C-3 | Category filter | Laptops, Smartphones, Audio, Gaming, Components, Smart Home |
| C-4 | Sort | Price ↑, price ↓, rating |
| C-5 | Product detail | Gallery, rating, review count, sale badge, stock |
| C-6 | Cart | Add / update quantity / remove |
| C-7 | Account | Register, log in, session via JWT |
| C-8 | Checkout | Shipping form, payment method, server-computed totals |
| C-9 | Order history | Per-user list of placed orders with line items |

### 4.2 Administrator-Facing (Back End Console)

| ID | Capability | Guard |
|----|-----------|-------|
| A-1 | Create product | `auth` + `adminOnly` |
| A-2 | Edit product | `auth` + `adminOnly` |
| A-3 | Delete product | `auth` + `adminOnly` |
| A-4 | View all orders | `auth` + `adminOnly` |
| A-5 | Dashboard statistics | Product / order / user counts and total revenue |

---

## 5. Technology Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Markup | HTML5 | Document structure |
| Style | CSS3 | Presentation, layout, theming |
| Client logic | Vanilla JavaScript | DOM, fetch calls, cart/session state |
| Runtime | Node.js | Server execution environment |
| Web framework | Express.js | Routing, static serving, JSON middleware |
| Database | SQLite via `better-sqlite3` | Synchronous embedded persistence |
| Password hashing | `bcryptjs` | One-way credential hashing (cost 10) |
| Authentication | JSON Web Tokens (`jsonwebtoken`) | Stateless 7-day bearer sessions |

No front-end framework, bundler, or transpiler is used. The client is served verbatim from `/public`.

---

## 6. System Architecture & Data Flow

### 6.1 Layered Stack

```
[ Layer 4 ]  Browser client      — HTML5 / CSS3 / vanilla JS (served from /public)
[ Layer 3 ]  REST boundary       — JSON over HTTP, Bearer-token authenticated
[ Layer 2 ]  Express application — routing, middleware, business rules (server.js)
[ Layer 1 ]  Persistence         — SQLite engine via better-sqlite3 (database.sqlite)
```

The client never speaks to the database directly. Every read and write crosses the REST boundary, where the Express layer applies validation, authentication and pricing authority before touching storage.

### 6.2 Request/Response Walkthrough — Authenticated Checkout

1. The browser collects cart items plus a shipping form and issues `POST /api/orders` with the JWT in an `Authorization: Bearer <token>` header.
2. Express middleware `auth` verifies the token signature and expiry, then attaches the decoded user to the request. An invalid or absent token yields `401`.
3. The handler validates that the cart is non-empty and that every required shipping field (`name`, `email`, `address`, `city`, `zip`) is present, returning `400` on failure.
4. For each line, the server re-reads the canonical product row from SQLite and recomputes `subtotal` from trusted prices — **client-submitted totals are discarded**.
5. Shipping is set to `0` when `subtotal ≥ 150`, otherwise `9`. Tax is `subtotal × 0.08`. `total = subtotal + shipping + tax`.
6. Within a single database transaction, one `orders` row and N `order_items` rows are inserted atomically.
7. The server responds `201` with the persisted order, including a human-readable order number formatted as `LO-<100000 + id>`.

### 6.3 Authorisation Model

- Requests presenting no/invalid token are rejected by `auth` with `401`.
- Privileged routes additionally pass through `adminOnly`, which rejects non-admin tokens with `403`.
- Tokens carry `{ id, email, isAdmin }` and expire after 7 days.

---

## 7. Data Model (Schema Definition)

The schema comprises **four tables**. Relationships: one **user** owns many **orders**; one **order** owns many **order_items**. The DDL below is created idempotently on first run.

### 7.1 `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,        -- bcrypt hash, never plaintext
  is_admin    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `id` | INTEGER | PK, auto | Surrogate key |
| `name` | TEXT | NOT NULL | Display name |
| `email` | TEXT | NOT NULL, UNIQUE | Login identifier |
| `password` | TEXT | NOT NULL | bcrypt hash |
| `is_admin` | INTEGER | DEFAULT 0 | Role flag (0/1) |
| `created_at` | TEXT | DEFAULT now | Creation timestamp |

### 7.2 `products`

```sql
CREATE TABLE IF NOT EXISTS products (
  id          TEXT    PRIMARY KEY,     -- url-friendly slug
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  price       REAL    NOT NULL,
  old_price   REAL,                    -- nullable; original price when on sale
  rating      REAL    NOT NULL DEFAULT 4.5,
  reviews     INTEGER NOT NULL DEFAULT 0,
  badge       TEXT,                    -- "Sale" | "New" | NULL
  image       TEXT    NOT NULL,
  gallery     TEXT    NOT NULL DEFAULT '[]',  -- JSON array of image URLs
  description TEXT    NOT NULL DEFAULT '',
  stock       INTEGER NOT NULL DEFAULT 100,
  featured    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `id` | TEXT | PK | URL-friendly slug |
| `name` | TEXT | NOT NULL | Product title |
| `category` | TEXT | NOT NULL | One of six categories |
| `price` | REAL | NOT NULL | Current price |
| `old_price` | REAL | nullable | Pre-sale price |
| `rating` | REAL | DEFAULT 4.5 | Average rating |
| `reviews` | INTEGER | DEFAULT 0 | Review count |
| `badge` | TEXT | nullable | Merchandising label |
| `image` | TEXT | NOT NULL | Primary image URL |
| `gallery` | TEXT | DEFAULT '[]' | JSON image array |
| `description` | TEXT | DEFAULT '' | Marketing copy |
| `stock` | INTEGER | DEFAULT 100 | Units available |
| `featured` | INTEGER | DEFAULT 0 | Homepage flag (0/1) |
| `created_at` | TEXT | DEFAULT now | Creation timestamp |

### 7.3 `orders`

```sql
CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL,
  customer_name  TEXT    NOT NULL,
  email          TEXT    NOT NULL,
  address        TEXT    NOT NULL,
  city           TEXT    NOT NULL,
  zip            TEXT    NOT NULL,
  country        TEXT    NOT NULL DEFAULT '',
  payment_method TEXT    NOT NULL DEFAULT 'card',
  subtotal       REAL    NOT NULL,
  shipping       REAL    NOT NULL DEFAULT 0,
  tax            REAL    NOT NULL DEFAULT 0,
  total          REAL    NOT NULL,
  status         TEXT    NOT NULL DEFAULT 'Processing',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `id` | INTEGER | PK, auto | Order key |
| `user_id` | INTEGER | FK → users(id) | Owning customer |
| `customer_name` | TEXT | NOT NULL | Recipient name |
| `email` | TEXT | NOT NULL | Contact email |
| `address` | TEXT | NOT NULL | Street address |
| `city` | TEXT | NOT NULL | City |
| `zip` | TEXT | NOT NULL | Postal code |
| `country` | TEXT | DEFAULT '' | Country |
| `payment_method` | TEXT | DEFAULT 'card' | Selected method |
| `subtotal` | REAL | NOT NULL | Sum of line items |
| `shipping` | REAL | DEFAULT 0 | Shipping fee |
| `tax` | REAL | DEFAULT 0 | Computed tax |
| `total` | REAL | NOT NULL | Grand total |
| `status` | TEXT | DEFAULT 'Processing' | Fulfilment state |
| `created_at` | TEXT | DEFAULT now | Placement timestamp |

### 7.4 `order_items`

```sql
CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL,
  product_id TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  price      REAL    NOT NULL,
  qty        INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `id` | INTEGER | PK, auto | Line key |
| `order_id` | INTEGER | FK → orders(id), CASCADE | Parent order |
| `product_id` | TEXT | NOT NULL | Referenced product slug |
| `name` | TEXT | NOT NULL | Snapshot of product name |
| `price` | REAL | NOT NULL | Snapshot of unit price |
| `qty` | INTEGER | NOT NULL | Quantity ordered |

> Line items snapshot the name and price at purchase time, so historical orders remain accurate even after a product is later edited or deleted.

---

## 8. Build & Provisioning

### 8.1 Installation

```bash
npm install
```

This resolves Express, `better-sqlite3`, `bcryptjs` and `jsonwebtoken`.

### 8.2 First-Run Provisioning

On the first start the database layer creates `database.sqlite`, applies the schema from §7, and the seed routine populates:

- **21 products** across the six categories.
- **2 demo accounts** (see §10.1).

Seeding is idempotent — it only inserts into a table that is empty, so restarting never duplicates data.

### 8.3 Reset Procedure

To return to a pristine state, stop the server and delete the database file:

```bash
rm database.sqlite database.sqlite-wal database.sqlite-shm
```

The next start re-creates and re-seeds it.

---

## 9. Runtime Procedure

```bash
npm start
```

On success the console prints the bound URL. Open:

```
http://localhost:4003
```

The Express process serves the static client from `/public` and the REST API under `/api`. To override the port, set the `PORT` environment variable before starting.

---

## 10. Operating Guide

### 10.1 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | `admin@loadout.com` | `admin123` |
| Customer | `demo@loadout.com` | `demo123` |

### 10.2 Customer Procedure

1. Open the storefront at `http://localhost:4003`.
2. Browse, search, filter by category, or sort the catalogue.
3. Open a product to view its gallery and details; add it to the cart.
4. Register a new account or log in (the demo customer above is available).
5. Proceed to checkout: complete the shipping form and select a payment method.
6. Submit the order. Totals are computed server-side; an order number `LO-1000xx` is issued.
7. Review placed orders in the account/order-history view.

### 10.3 Administrator Procedure

1. Log in with the administrator account from §10.1.
2. Access the admin console to view dashboard statistics (products, orders, users, revenue).
3. Create a product — `name`, `price` and `category` are mandatory; the server derives a unique slug id automatically.
4. Edit any product field; omitted fields retain their existing values.
5. Delete a product by id.
6. Inspect all customer orders with full line-item detail.

> Privileged operations require a valid administrator token. A non-admin session receives `403 Admin access required.`

---

## 11. API Endpoint Reference

Base path: `/api`. Request and response bodies are JSON. Authenticated routes expect `Authorization: Bearer <token>`.

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 1 | GET | `/api/store` | none | Store identity & commerce constants |
| 2 | GET | `/api/products` | none | List products; query `?search`, `?category`, `?sort`, `?featured` |
| 3 | GET | `/api/products/:id` | none | Single product by slug |
| 4 | GET | `/api/categories` | none | Distinct category names |
| 5 | POST | `/api/auth/register` | none | Create account → token + user |
| 6 | POST | `/api/auth/login` | none | Authenticate → token + user |
| 7 | GET | `/api/auth/me` | user | Current session profile |
| 8 | POST | `/api/orders` | user | Place an order (server-computed totals) |
| 9 | GET | `/api/orders` | user | List the caller's orders |
| 10 | GET | `/api/orders/:id` | user | Single order (owner or admin) |
| 11 | POST | `/api/products` | admin | Create a product |
| 12 | PUT | `/api/products/:id` | admin | Update a product |
| 13 | DELETE | `/api/products/:id` | admin | Remove a product |
| 14 | GET | `/api/admin/orders` | admin | List all orders, store-wide |
| 15 | GET | `/api/admin/stats` | admin | Aggregate counts & total revenue |

**11.1 Query parameters for endpoint 2**

| Param | Accepted values | Effect |
|-------|-----------------|--------|
| `search` | free text | Substring match on name / category / description |
| `category` | category name or `All` | Filter to one category |
| `sort` | `low`, `high`, `rating` | Price ascending / descending / rating descending |
| `featured` | `true` | Restrict to featured products |

**11.2 Status codes** — `200` OK, `201` Created, `400` validation error, `401` unauthenticated, `403` forbidden (non-admin), `404` not found, `409` email already registered.

---

## 12. Roadmap

- **13.1** Payment gateway integration (the payment method is currently recorded but not charged).
- **13.2** Real-time stock decrement on order placement and out-of-stock guarding.
- **13.3** Order status lifecycle (Processing → Shipped → Delivered) with admin transitions.
- **13.4** Product image upload instead of URL references.
- **13.5** Customer-submitted ratings and reviews feeding the `rating`/`reviews` fields.
- **13.6** Pagination and faceted filtering for larger catalogues.
- **13.7** Token refresh / revocation and a password-reset flow.
- **13.8** Automated test suite covering the API contract in §11.

---

## 13. Summary

Loadout demonstrates a complete, self-contained full-stack e-commerce system: a vanilla-JavaScript client, an Express REST API, and an embedded SQLite store, joined by a token-authenticated JSON boundary. The design isolates store configuration from engine logic, enforces server-side pricing authority, secures credentials with bcrypt, and provisions its entire dataset automatically on first run. The four-table relational model (§7) and the fifteen-endpoint API (§11) together form a small but coherent specification that a single operator can install, run and administer in minutes.
