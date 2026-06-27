# Brume — A Full-Stack Web Application for a Specialty Coffee Roastery

### A Project Report Submitted in Partial Fulfilment of the Requirements of the Course

| | |
|---|---|
| **Project Title** | Brume: A Full-Stack E-Commerce Platform for a Specialty Coffee Roastery |
| **Student Name** | Demo Student |
| **Roll / Registration No.** | DEMO-0000 |
| **Course** | E-Commerce |
| **Instructor** | Demo Instructor |
| **Date of Submission** | 10-06-2026 |

> This document reports on the design and implementation of *Brume*, a complete full-stack web application comprising a browser-based storefront, a RESTful application server, and a relational data store.

---

## Abstract

This report documents the conception, design, and realisation of **Brume**, a full-stack electronic-commerce application built around the concept of a contemporary specialty coffee roastery selling single-origin beans, signature blends, espresso machines and brewing equipment. The system unites a static, framework-free browser client with a compact REST application programming interface served by Node.js and the Express framework, and persists all state in an embedded SQLite database accessed through the synchronous `better-sqlite3` driver. The application supports the complete commercial cycle: catalogue browsing across six merchandise categories, full-text and faceted search, account registration, credential-based authentication secured by bcrypt password hashing and JSON Web Tokens, cart assembly, server-validated checkout, and order history. A privileged administrative surface additionally permits catalogue management and the inspection of orders and aggregate trading statistics. The remainder of this report describes the project's aims, its functional scope, the technologies employed, its layered architecture, the design of its data schema, and the procedures by which the system is installed, executed, and operated. The report concludes with a candid appraisal of the system's present limitations and a discussion of avenues for future development.

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Context and Motivation](#11-context-and-motivation)
   - 1.2 [Scope of the System](#12-scope-of-the-system)
2. [Aims and Objectives](#2-aims-and-objectives)
3. [Functional Overview](#3-functional-overview)
   - 3.1 [Customer-Facing Capabilities](#31-customer-facing-capabilities)
   - 3.2 [Administrative Capabilities](#32-administrative-capabilities)
   - 3.3 [Catalogue Composition](#33-catalogue-composition)
4. [Technologies Employed](#4-technologies-employed)
5. [System Design and Architecture](#5-system-design-and-architecture)
   - 5.1 [The Presentation Layer](#51-the-presentation-layer)
   - 5.2 [The Application Layer](#52-the-application-layer)
   - 5.3 [The Data Layer](#53-the-data-layer)
   - 5.4 [Security Considerations](#54-security-considerations)
   - 5.5 [Application Programming Interface Reference](#55-application-programming-interface-reference)
6. [Database Design](#6-database-design)
   - 6.1 [Entities and Their Attributes](#61-entities-and-their-attributes)
   - 6.2 [Relationships and Integrity Constraints](#62-relationships-and-integrity-constraints)
7. [Installation and Configuration](#7-installation-and-configuration)
8. [Execution Procedure](#8-execution-procedure)
9. [User Manual](#9-user-manual)
   - 9.1 [Guidance for the Customer](#91-guidance-for-the-customer)
   - 9.2 [Guidance for the Administrator](#92-guidance-for-the-administrator)
10. [Limitations and Future Work](#10-limitations-and-future-work)
11. [Concluding Remarks](#11-concluding-remarks)
12. [References](#12-references)

---

## 1. Introduction

### 1.1 Context and Motivation

Brume is presented as a specialty coffee roastery trading in small-batch beans, signature blends and brewing equipment under the maxim *"Small-batch coffee, roasted with care."* The undertaking serves a pedagogical purpose: to demonstrate, end to end, the construction of a modern web application in which a browser client, an application server, and a persistent data store cooperate to deliver a complete commercial experience. Rather than relying upon a heavyweight client-side framework, the project deliberately favours transparency, employing only standard web technologies on the client so that the flow of data between the three tiers remains legible and instructive.

### 1.2 Scope of the System

The system addresses the principal concerns of a small online retailer. It exposes a curated catalogue to anonymous visitors, permits visitors to establish accounts and authenticate themselves, allows authenticated customers to assemble a basket and submit an order whose monetary totals are recomputed and validated on the server, and furnishes a restricted administrative surface through which a privileged operator may curate the catalogue and review trading activity. All monetary figures are denominated in United States dollars (`$`).

---

## 2. Aims and Objectives

The project was undertaken with the following objectives:

1. To realise a genuinely full-stack application in which presentation, application logic, and persistence are cleanly separated yet operate in concert.
2. To implement a stateless, token-based authentication scheme that distinguishes ordinary customers from administrative operators.
3. To guarantee transactional integrity at checkout by deriving all prices and totals from authoritative server-side records rather than trusting figures supplied by the client.
4. To model the commercial domain — accounts, products, orders, and order line items — in a normalised relational schema enforcing referential integrity.
5. To provide a self-initialising data store that seeds a representative catalogue and demonstration accounts on first execution, thereby lowering the barrier to evaluation.
6. To expose a small, coherent REST interface whose endpoints map naturally onto the operations of the domain.

---

## 3. Functional Overview

### 3.1 Customer-Facing Capabilities

The storefront affords the following to visitors and registered customers:

- **Catalogue discovery.** Products may be browsed in their entirety or narrowed by category, queried by free-text search across name, category, and description, and ordered by ascending price, descending price, or customer rating.
- **Featured merchandise.** Editorially highlighted items are surfaced prominently on the storefront.
- **Product detail.** Each item presents a gallery of imagery, a descriptive narrative, customer rating and review count, current and (where applicable) former pricing, and an indication of stock.
- **Account lifecycle.** A visitor may register an account and subsequently authenticate; the active session is carried by a JSON Web Token valid for seven days.
- **Basket and checkout.** Customers assemble a basket and submit shipping and payment particulars at checkout. The server independently recomputes the subtotal, shipping charge, and tax before persisting the order.
- **Order history.** Authenticated customers may review their previously placed orders, each identified by a human-readable order number.

Shipping and taxation follow a transparent policy: orders whose subtotal reaches **$50** qualify for complimentary shipping, while smaller orders incur a flat shipping charge of **$6**; sales tax is levied at **8%** of the subtotal.

### 3.2 Administrative Capabilities

An operator authenticating with administrative privileges gains access to a back-office surface providing:

- **Catalogue management.** The creation of new products, the amendment of existing products, and the removal of products from the catalogue.
- **Order oversight.** Inspection of every order placed across all customers, together with its constituent line items.
- **Trading statistics.** Aggregate measures comprising the total number of products, orders, and registered users, and the cumulative revenue recorded.

### 3.3 Catalogue Composition

The seeded catalogue comprises **twenty-three products** distributed across **six categories**: Single Origin, Blends, Espresso Machines, Brewing Gear, Drinkware, and Gifts & Accessories. Each product carries a URL-friendly identifier, descriptive copy, product imagery, a rating and review tally, optional promotional badging, and stock and feature flags.

---

## 4. Technologies Employed

The implementation rests upon a deliberately compact technology stack, chosen to keep the relationship between the tiers transparent.

| Concern | Technology |
|---|---|
| Document structure (client) | HTML5 |
| Presentation and layout (client) | CSS3 |
| Client behaviour | Vanilla JavaScript (no client framework) |
| Server runtime | Node.js |
| HTTP routing and middleware | Express.js |
| Persistence | SQLite, accessed via `better-sqlite3` |
| Password protection | `bcryptjs` (salted hashing) |
| Session authentication | JSON Web Tokens (`jsonwebtoken`) |

The selection of the synchronous `better-sqlite3` driver, in preference to an asynchronous alternative, was a conscious decision to render the server's data-access code linear and readable, an attribute of particular value in a project of instructional intent.

---

## 5. System Design and Architecture

Brume is organised as a classical three-tier application. A browser-resident **presentation layer** communicates over HTTP with an **application layer** implemented as an Express REST service, which in turn reads from and writes to an embedded SQLite **data layer**. The three tiers and the principal channels of communication between them may be characterised as follows.

### 5.1 The Presentation Layer

The presentation layer is a collection of static assets — markup, stylesheets, and scripts — delivered to the browser by the application server from its `public` directory. All interface state and interaction are managed in vanilla JavaScript, which issues asynchronous requests to the REST interface and renders the returned JSON. No server-side templating is involved; the client is wholly responsible for composing the visible interface from data it retrieves at runtime. Where an operation requires authentication, the client attaches its JSON Web Token to the request as a bearer credential.

### 5.2 The Application Layer

The application layer is a single Express server that fulfils two roles. First, it serves the static presentation assets. Second, it exposes a JSON REST interface beneath the `/api` prefix. Incoming request bodies are parsed as JSON. Two middleware functions govern access: an *authentication guard* that validates the bearer token and attaches the decoded identity to the request, and an *administrative guard* that, running after authentication, admits only operators bearing administrative privilege. The server is responsible for all business rules of consequence — most notably the recomputation of order totals at checkout, which it performs from authoritative product records, and the persistence of an order and its line items within a single database transaction so that an order is never recorded in part. The service listens on **port 4005**.

### 5.3 The Data Layer

The data layer is an embedded SQLite database held in a single file, `database.sqlite`, situated alongside the server. The database operates with write-ahead logging enabled for resilience and with foreign-key enforcement active so that referential constraints are honoured. The schema, comprising four tables, is created idempotently at startup, and a seeding routine populates the catalogue and demonstration accounts when the relevant tables are found empty.

### 5.4 Security Considerations

User passwords are never stored in plaintext; each is subjected to a salted bcrypt hash before persistence, and authentication proceeds by comparison against that hash. Successful authentication yields a signed JSON Web Token encoding the user's identity and administrative status, with a validity of seven days. Privileged operations are protected by the layered authentication and administrative guards described above. Critically, the server treats all client-supplied monetary figures as untrusted: at checkout it disregards any totals submitted by the client and recomputes subtotal, shipping, and tax from its own records.

### 5.5 Application Programming Interface Reference

The following table enumerates the endpoints exposed by the application layer. The *Access* column indicates whether an endpoint is open to all, requires an authenticated customer, or requires an administrator.

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products; accepts `search`, `category`, and `sort` query parameters |
| `GET` | `/api/products/:id` | Public | Retrieve a single product by its identifier |
| `GET` | `/api/categories` | Public | List the distinct merchandise categories |
| `POST` | `/api/auth/register` | Public | Register a new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain a token |
| `GET` | `/api/auth/me` | Customer | Return the profile of the authenticated user |
| `POST` | `/api/orders` | Customer | Place an order; totals are recomputed server-side |
| `GET` | `/api/orders` | Customer | List the authenticated user's own orders |
| `POST` | `/api/products` | Administrator | Create a product |
| `PUT` | `/api/products/:id` | Administrator | Amend an existing product |
| `DELETE` | `/api/products/:id` | Administrator | Remove a product |
| `GET` | `/api/admin/orders` | Administrator | List all orders across all customers |
| `GET` | `/api/admin/stats` | Administrator | Retrieve aggregate trading statistics |

---

## 6. Database Design

The persistent state of the system is modelled by four relations. This chapter describes each entity and its attributes before turning to the relationships and integrity constraints that bind them.

### 6.1 Entities and Their Attributes

**`users` — registered accounts.**

| Attribute | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, auto-incrementing |
| `name` | TEXT | Display name |
| `email` | TEXT | **Unique**; the login identifier |
| `password` | TEXT | bcrypt hash; never stored in plaintext |
| `is_admin` | INTEGER | Administrative flag (0 or 1) |
| `created_at` | TEXT | Timestamp of account creation |

**`products` — the catalogue.**

| Attribute | Type | Notes |
|---|---|---|
| `id` | TEXT | Primary key; a URL-friendly slug |
| `name` | TEXT | Product name |
| `category` | TEXT | One of the six categories |
| `price` | REAL | Current price |
| `old_price` | REAL | Former price when on sale (nullable) |
| `rating` | REAL | Average customer rating |
| `reviews` | INTEGER | Count of reviews |
| `badge` | TEXT | Promotional badge, e.g. "New" or "Sale" (nullable) |
| `image` | TEXT | Principal image URL |
| `gallery` | TEXT | JSON-encoded array of image URLs |
| `description` | TEXT | Descriptive copy |
| `stock` | INTEGER | Quantity available |
| `featured` | INTEGER | Featured flag (0 or 1) |
| `created_at` | TEXT | Timestamp of insertion |

**`orders` — placed orders.**

| Attribute | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, auto-incrementing |
| `user_id` | INTEGER | **Foreign key → `users(id)`** |
| `customer_name` | TEXT | Recipient name |
| `email` | TEXT | Contact email |
| `address` | TEXT | Shipping address |
| `city` | TEXT | Shipping city |
| `zip` | TEXT | Postal code |
| `country` | TEXT | Country |
| `payment_method` | TEXT | Payment method (defaults to `card`) |
| `subtotal` | REAL | Sum of line items before charges |
| `shipping` | REAL | Shipping charge applied |
| `tax` | REAL | Tax levied |
| `total` | REAL | Grand total |
| `status` | TEXT | Fulfilment status (defaults to `Processing`) |
| `created_at` | TEXT | Timestamp of the order |

**`order_items` — the line items of an order.**

| Attribute | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, auto-incrementing |
| `order_id` | INTEGER | **Foreign key → `orders(id)`**, cascading on delete |
| `product_id` | TEXT | The ordered product's identifier |
| `name` | TEXT | Product name at time of purchase |
| `price` | REAL | Unit price at time of purchase |
| `qty` | INTEGER | Quantity ordered |

### 6.2 Relationships and Integrity Constraints

Two relationships govern the schema:

- A **user has many orders**: each row in `orders` references exactly one row in `users` through `user_id`, while a given user may own arbitrarily many orders.
- An **order comprises many order items**: each row in `order_items` references exactly one row in `orders` through `order_id`, while a given order may contain arbitrarily many line items. This relationship is declared with cascading deletion, so that removing an order necessarily removes its constituent line items, leaving no orphaned records.

Conceptually, the entities and their cardinalities may be read as:

```
users (1) ───< (many) orders (1) ───< (many) order_items
                                          │
                products  ·····(referenced by product_id)····· order_items
```

Foreign-key enforcement is enabled at the connection level so that these constraints are upheld by the database engine itself. The capture of `name` and `price` directly within `order_items` deliberately preserves a historical record of each line as it stood at the moment of purchase, insulating past orders from subsequent changes to the catalogue.

---

## 7. Installation and Configuration

The system requires only a contemporary installation of Node.js together with its bundled package manager. No external database server, build pipeline, or additional service is necessary; the data store is embedded and self-creating.

To prepare the application, the user obtains the project sources and installs the declared dependencies from within the project directory:

```bash
npm install
```

This single step retrieves Express, `better-sqlite3`, `bcryptjs`, and `jsonwebtoken` and their transitive dependencies. Store-specific parameters — the store name, currency, listening port, free-shipping threshold, flat shipping charge, and tax rate — are gathered in `store.config.js` and may be reviewed or adjusted there. Sensitive values, namely the listening port and the token-signing secret, may alternatively be supplied through the `PORT` and `JWT_SECRET` environment variables.

---

## 8. Execution Procedure

With dependencies installed, the application is launched by:

```bash
npm start
```

Upon first execution the database file `database.sqlite` is created automatically, the schema is established, and the seeding routine populates the catalogue of twenty-three products together with the two demonstration accounts. The server then reports its readiness, after which the application may be reached in a browser at:

```
http://localhost:4005
```

Should the user wish to return the system to its pristine state — for instance to clear test orders or restore the original catalogue — it suffices to delete the `database.sqlite` file; the store is reseeded from scratch on the next launch.

For the convenience of evaluation, two demonstration accounts are provisioned:

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@brume.com` | `admin123` |
| Customer | `demo@brume.com` | `demo123` |

---

## 9. User Manual

### 9.1 Guidance for the Customer

A visitor begins at the storefront, where the catalogue is displayed. The visitor may filter the catalogue by category, enter a search term to locate items by name or description, and reorder the results by price or by rating. Selecting a product reveals its detail view, including its imagery, description, and pricing. To purchase, the visitor adds desired items to the basket; placing an order requires an account, so an unauthenticated visitor is invited to register or to sign in — the demonstration customer account above may be used for this purpose. At checkout the customer provides shipping particulars and a payment method and confirms the order, whereupon the server validates the request, computes the definitive totals, and records the order. The customer may thereafter consult the history of their orders, each bearing a distinct order number.

### 9.2 Guidance for the Administrator

An operator signs in with the administrative account above to reach the back-office surface. From there the operator may add a new product by supplying at minimum its name, price, and category; amend any existing product's attributes; or remove a product from the catalogue altogether. The operator may additionally review every order placed across all customers, examine the line items of each, and consult the aggregate statistics — product, order, and user counts together with cumulative revenue — that summarise the store's trading. Administrative endpoints are inaccessible without administrative privilege, and an attempt to reach them without it is refused.

---

## 10. Limitations and Future Work

The present implementation, while complete in its core commercial cycle, is bounded in several respects that suggest directions for further development:

1. **Payment processing.** Checkout records a nominal payment method but performs no real settlement; integration with a payment gateway would be a natural next step.
2. **Stock reconciliation.** Although stock levels are recorded, they are not decremented upon purchase, and so the system does not presently guard against overselling.
3. **Order fulfilment workflow.** Orders are assigned an initial status but no mechanism exists for an administrator to advance that status through subsequent stages of fulfilment.
4. **Communication.** The system dispatches no electronic mail, whether for account confirmation, order receipts, or password recovery.
5. **Configurable secret management.** The token-signing secret carries a development default and ought, in any production deployment, to be supplied exclusively through the environment.
6. **Automated testing.** The project would benefit from a suite of automated tests exercising the API and the integrity of the checkout computation.

Addressing these matters would carry the system appreciably closer to a production-grade retail platform.

---

## 11. Concluding Remarks

This report has set out the design and implementation of Brume, a full-stack web application that exercises, within a modest and legible codebase, the principal concerns of modern electronic commerce: a framework-free browser client, a stateless and security-conscious REST application layer, and a normalised relational data store with enforced integrity. By keeping each tier transparent and by insisting that the server remain the sole authority on prices and totals, the project demonstrates not merely that the pieces can be assembled, but that they can be assembled soundly. The limitations identified above mark the boundary of the present work and, equally, a clear agenda for its continuation.

---

## 12. References

1. OpenJS Foundation. *Node.js Documentation.* https://nodejs.org/en/docs/
2. OpenJS Foundation. *Express — Fast, unopinionated, minimalist web framework for Node.js.* https://expressjs.com/
3. SQLite Consortium. *SQLite Documentation.* https://www.sqlite.org/docs.html
4. *bcrypt.js — Optimized bcrypt in JavaScript.* https://github.com/dcodeIO/bcrypt.js
5. *JSON Web Tokens — Introduction and the jsonwebtoken library.* https://jwt.io/ and https://github.com/auth0/node-jsonwebtoken
