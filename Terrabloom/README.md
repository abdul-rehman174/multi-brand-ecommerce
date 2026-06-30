# Terrabloom — A Friendly Handbook to the Online Garden Store

> A full-stack web application for a small plants and garden shop.
> *Tagline: "Bring the outside in."*

---

| | |
|---|---|
| **Student Name** | Demo Student |
| **Roll / Registration No.** | DEMO-0000 |
| **Course** | E-commerce |
| **Instructor** | Demo Instructor |
| **Submission Date** | 10-06-2026 |

---

Welcome! Think of this document as the little card that comes tucked into a new plant pot — it tells you what you are looking after, how to keep it thriving, and what to expect as it grows. Terrabloom is a complete online store for plant lovers, and the pages below walk you through it gently, from the soil up.

## What is Terrabloom?

Terrabloom is a working online garden shop you can run on your own computer. A visitor can wander through a catalogue of houseplants, outdoor greenery, planters, seeds, tools, and plant-care goodies, drop favourites into a basket, create an account, and check out — just like a real storefront. Behind the counter, a shop owner (the administrator) can tend the catalogue and keep an eye on incoming orders.

It is built as a *full-stack* application, which simply means it has two halves that talk to each other: a front-of-shop that runs in your web browser, and a back room (a small server with a database) that remembers everything and does the careful work like checking passwords and totalling up baskets.

## Why was it built? (Goals)

The project sets out to do a handful of things well rather than many things halfway:

- Grow a believable, end-to-end shopping experience — browse, search, register, add to cart, and place a real order.
- Keep customer accounts safe by storing passwords as scrambled hashes, never as plain text.
- Give the shop owner a private back-office for adding, editing, and removing products and for reviewing every order placed.
- Stay small, readable, and honest — no heavy frameworks, so the code is easy to follow and learn from.
- Show a clean separation between the part you see and the part that stores and protects the data.

## What can you do with it?

**As a shopper, you can:**

- Browse all 22 products and filter them by any of the six categories (Indoor Plants, Outdoor Plants, Planters, Seeds, Tools, and Plant Care).
- Search by name, category, or description, and sort by price (low or high) or by customer rating.
- Open a product to read its description, see its photo gallery, rating, and review count, and spot sale or "new" badges.
- Add items to a cart and adjust quantities.
- Register an account and sign in securely.
- Check out by entering shipping details and a payment method, with shipping and tax worked out automatically.
- Look back over your own order history at any time.

**As the administrator, you can:**

- Add brand-new products, update existing ones, or remove items from the catalogue.
- See every order from every customer in one place.
- Glance at quick shop statistics — total products, orders, registered users, and revenue.

A friendly note on the numbers: shipping is **free on orders of $75 or more**, otherwise a flat **$7** is added. Tax is calculated at **8%**, and all prices are shown in **US dollars ($)**.

## How does it all work together?

Picture the shop as a greenhouse with a friendly potting bench in front and a quiet storeroom at the back.

- **The greenhouse window (your browser)** is everything the shopper sees — the pages, buttons, and baskets, built with HTML, CSS, and JavaScript.
- **The potting bench (the Express server)** is where requests are handled. When you ask for something, this is the helper who fetches it, checks it, and hands it back.
- **The storeroom (the SQLite database)** is the cool, dark shelf where every product, account, and order is kept safe on disk.

The browser and the server chat through a small **REST API** — a tidy set of web addresses the front-end can call to ask for or send information.

Here is what actually happens when a shopper places an order:

1. The shopper fills their basket in the browser and presses **Checkout**.
2. The browser sends the basket and shipping details to the server, along with the sign-in token that proves who they are.
3. The server checks the token, then — importantly — looks up the *real* price of every item in the database, never trusting the totals sent by the browser.
4. It works out the subtotal, adds shipping and tax, and saves the order plus each of its line items, all in one safe transaction.
5. A tidy confirmation (including a friendly order number like `#TB-100231`) travels back to the browser, and the shopper sees their receipt.

## What is it made of? (Technologies)

| Layer | Tools used |
|---|---|
| Front-of-shop | HTML5, CSS3, vanilla JavaScript (no framework) |
| Server | Node.js with the Express.js web framework |
| Storeroom | SQLite, accessed through the `better-sqlite3` library |
| Keeping accounts safe | `bcryptjs` for password hashing, JSON Web Tokens (JWT) for sign-in sessions |

## How is the information stored?

Everything lives in a single file, `database.sqlite`, which the app creates and fills for you on first run. Inside, four tables hold the shop's memory. The easiest way to picture them: **a user can place many orders, and each order is made up of many order items.**

**`users`** — everyone with an account, including the shop owner.

| Field | Meaning |
|---|---|
| `id` | unique number for the account |
| `name` | the person's display name |
| `email` | their email (must be unique) |
| `password` | a bcrypt hash — never the real password |
| `is_admin` | 1 for the shop owner, 0 for a shopper |
| `created_at` | when the account was made |

**`products`** — the catalogue of plants and supplies.

| Field | Meaning |
|---|---|
| `id` | a readable slug, e.g. `monstera-deliciosa` |
| `name` | product name |
| `category` | which of the six sections it belongs to |
| `price` | current price |
| `old_price` | the previous price when on sale (may be empty) |
| `rating` | average star rating |
| `reviews` | how many reviews it has |
| `badge` | a label such as "Sale" or "New" (optional) |
| `image` | main product photo |
| `gallery` | extra photos, stored as a JSON list |
| `description` | the friendly write-up |
| `stock` | how many are available |
| `featured` | 1 if it appears on the highlights row |
| `created_at` | when it was added |

**`orders`** — one row each time someone checks out.

| Field | Meaning |
|---|---|
| `id` | unique order number |
| `user_id` | links back to the `users` table (who ordered) |
| `customer_name`, `email` | who the parcel is for |
| `address`, `city`, `zip`, `country` | where it is going |
| `payment_method` | how it was paid |
| `subtotal`, `shipping`, `tax`, `total` | the maths of the order |
| `status` | e.g. "Processing" |
| `created_at` | when the order was placed |

**`order_items`** — the individual lines within each order.

| Field | Meaning |
|---|---|
| `id` | unique line number |
| `order_id` | links back to the `orders` table |
| `product_id` | which product was bought |
| `name`, `price`, `qty` | a snapshot of the item and quantity at purchase time |

## The doors into the back room (API endpoints)

If the front-end is a shopper, the API is the set of doors it knocks on. Here they are, grouped by who may use them.

**Open to everyone**

- `GET /api/products` — list products (accepts `?search`, `?category`, and `?sort`)
- `GET /api/products/:id` — details for one product
- `GET /api/categories` — the list of category names
- `POST /api/auth/register` — create a new account
- `POST /api/auth/login` — sign in and receive a token

**For a signed-in shopper**

- `GET /api/auth/me` — who am I?
- `POST /api/orders` — place an order
- `GET /api/orders` — my own order history

**For the administrator only**

- `POST /api/products` — add a product
- `PUT /api/products/:id` — edit a product
- `DELETE /api/products/:id` — remove a product
- `GET /api/admin/orders` — every order in the shop
- `GET /api/admin/stats` — quick totals for the dashboard

## How do I get it running?

You will need **Node.js** installed. After that, it is a two-step routine:

```bash
npm install      # gather the dependencies
npm start        # open the shop
```

Then point your browser at **http://localhost:4004** and Terrabloom is open for business.

A few things worth knowing:

- The database plants and waters itself on the very first run — it is created and filled with sample products and demo accounts automatically.
- Want a completely fresh start? Simply delete the `database.sqlite` file and run the app again; it will re-seed from scratch.
- The shop runs on **port 4004**.

## A quick guide for shoppers

1. Open **http://localhost:4004** in your browser.
2. Browse, search, or filter by category until something catches your eye.
3. Open a product to read more and add it to your cart.
4. Register a new account, or sign in with the demo customer below.
5. Head to the cart, review your items, and choose **Checkout**.
6. Enter your shipping details and payment method, then confirm. Shipping and tax are added for you.
7. Visit your orders page any time to revisit past purchases.

**Demo shopper account**

```
Email:    demo@terrabloom.com
Password: demo123
```

## A quick guide for the administrator

1. Sign in with the administrator account below — the admin tools appear once you do.
2. Use the product tools to add a new item, edit an existing one, or remove something from the catalogue.
3. Open the orders view to see every customer order in one place.
4. Check the statistics for a quick pulse on products, orders, users, and revenue.

**Administrator account**

```
Email:    admin@terrabloom.com
Password: admin123
```

## Room to grow

Like any garden, Terrabloom could keep growing. Some natural next steps:

- Real online payments through a payment provider.
- Email receipts and order-status updates.
- Customer reviews that shoppers can write themselves.
- Wishlists and saved favourites.
- Live stock that decreases automatically as orders come in.
- Discount codes and seasonal promotions.
- Letting the admin move an order through stages (Processing → Shipped → Delivered).

## Closing thoughts

Terrabloom set out to be a small, honest, end-to-end shop — and it grows into exactly that. The browser handles the shopfront, Express tends the requests, and SQLite quietly remembers everything, with passwords kept safe and prices always re-checked on the server. It is compact enough to read in an afternoon, yet complete enough to behave like a real store. Like a well-tended plant, it is simple to care for and ready to grow whenever you are.
