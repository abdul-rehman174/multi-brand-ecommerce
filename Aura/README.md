# Aura — A Design Dossier

*Considered objects for everyday life.*

A full-stack web application: a premium, design-led concept store, presented as an academic submission.

---

| | |
|---|---|
| **Student Name** | Demo Student |
| **Roll / Registration No.** | DEMO-0000 |
| **Course** | E commerce |
| **Instructor** | Demo Instructor |
| **Submission Date** | 10 June 2026 |

---

## The Premise

Aura is not meant to feel like a database with a shop bolted on top. It is meant to feel like walking into a quiet, well-lit room where every object has earned its place on the shelf. That intention shaped every decision in this project. The result is a complete online store — catalogue, cart, checkout, accounts, and an administrative back office — built from the ground up as a single, self-contained full-stack web application.

Behind the calm surface sits a working commerce engine. Visitors can browse nineteen curated products, search and filter them, read individual product pages, register an account, fill a cart, and place an order that is priced, taxed, and recorded on the server. A separate administrative layer lets a shopkeeper add, edit, and remove products and review every order and sales figure the store has accumulated. Everything runs locally from one folder, with no external services to configure.

## What This Project Sets Out to Prove

This dossier accompanies a piece of coursework, and so it carries a set of explicit goals beneath its retail clothing. The work aims to:

- Demonstrate an end-to-end web application in which a browser front-end, a server, and a database each play a clearly separated role.
- Show a REST API designed and built by hand, rather than scaffolded by a framework's generator.
- Handle authentication responsibly — passwords are never stored in readable form, and sessions are carried by signed tokens.
- Keep the codebase small, readable, and honest, so that the reasoning behind each layer can be followed line by line.
- Wrap all of the above in a deliberate brand voice, treating visual and editorial polish as part of the engineering, not an afterthought.

## The Shopping Experience

A first-time visitor lands on a storefront that leads with featured pieces and an invitation to browse by category. The catalogue spans five families of objects — **Audio**, **Wearables**, **Home**, **Bags**, and **Apparel** — and a shopper can move through them by category, sort the results from low to high price (or the reverse), order them by customer rating, or simply type a few letters into the search field and have the catalogue narrow itself in response. Prices are shown in dollars, and items on sale carry their original price struck through alongside a small badge.

Choosing a product opens its own page: a larger image with a small gallery, the written description, its rating and review count, and the controls to set a quantity and add it to the cart. The cart itself remembers what has been gathered and tallies the running cost. At checkout the shopper supplies a shipping address and a payment method, and the order is finalised. Shipping is free once the basket passes **$200**; below that a flat **$12** is applied, and **8%** tax is added on top. Crucially, those totals are never trusted from the browser — the server recalculates every line from its own records before an order is allowed to stand.

Accounts tie the experience together. A visitor can register or sign in, and once authenticated can place orders and return later to review their order history, each entry stamped with a human-readable number such as `#AU-100231`.

## The Shopkeeper's Side

Signing in as an administrator unlocks a second set of capabilities that the ordinary customer never sees. From here the store's catalogue becomes editable: new products can be created, existing ones revised, and discontinued lines removed entirely. The administrator can also read the full ledger of orders placed by every customer, and call up a compact dashboard of statistics — how many products are listed, how many orders have been taken, how many accounts exist, and the total revenue collected. These routes are fenced off by a guard that checks the signed-in user's privileges before allowing anything through; a customer's token simply will not open these doors.

## Built With

The application is intentionally built from a modest, well-understood toolkit, chosen so the moving parts stay visible.

The front-end is plain **HTML5**, **CSS3**, and **vanilla JavaScript** — no framework, no build step, just the language of the browser. On the server, **Node.js** runs an **Express.js** application that serves those static files and answers the API. Data lives in **SQLite**, reached through the synchronous **better-sqlite3** driver, which keeps the database code linear and easy to read. Account security rests on two libraries: **bcryptjs** hashes every password before it touches storage, and **jsonwebtoken** issues the signed **JSON Web Tokens** that carry a user's session for seven days at a time.

## How the Pieces Fit Together

The architecture is a straightforward three-tier arrangement, and it helps to read it as a conversation rather than a diagram.

The **browser front-end** is where the shopper actually is. It renders pages and reacts to clicks, but it owns no data of its own — whenever it needs something real, it asks for it. Those questions travel as HTTP requests to the **Express REST API**, the middle tier and the only place where business rules live. The API decides who is allowed to do what, recalculates prices, enforces the shipping and tax rules, and translates between the friendly shapes the browser expects and the raw rows the database keeps. Behind it sits **SQLite**, the single file on disk that remembers everything: the products, the accounts, and every order ever placed.

The flow of a single action makes the separation concrete:

> **Browser** → sends an HTTP request (e.g. *"place this order"*) →
> **Express API** → authenticates the token, re-prices every line, applies shipping and tax →
> **SQLite** → records the order and its items inside one transaction →
> **Express API** → returns the finished order with its number →
> **Browser** → shows the confirmation.

Nothing in the browser is trusted to be correct, and nothing in the database is exposed without passing through the API first. That single rule is what makes the three tiers worth keeping apart.

### The API at a Glance

The conversation above is conducted over a small, deliberate set of endpoints.

| Method & Path | Who | Purpose |
|---|---|---|
| `GET /api/products` | Public | List products; accepts `?search`, `?category`, `?sort` |
| `GET /api/products/:id` | Public | Fetch one product by its slug |
| `GET /api/categories` | Public | List the distinct category names |
| `POST /api/auth/register` | Public | Create an account, returns a token |
| `POST /api/auth/login` | Public | Sign in, returns a token |
| `GET /api/auth/me` | Signed-in | Return the current user |
| `POST /api/orders` | Customer | Place an order from the cart |
| `GET /api/orders` | Customer | List the signed-in user's orders |
| `POST /api/products` | Admin | Create a product |
| `PUT /api/products/:id` | Admin | Update a product |
| `DELETE /api/products/:id` | Admin | Remove a product |
| `GET /api/admin/orders` | Admin | Every order across the store |
| `GET /api/admin/stats` | Admin | Product, order, user, and revenue counts |

## The Data Behind It

All of the store's memory lives in four tables. They are small, and they relate to one another in a way that mirrors how a real shop thinks: people have accounts, accounts place orders, and orders are made of individual lines.

**`users`** holds everyone who has registered. Each email is unique, and the password field never contains a password — only its bcrypt hash. A flag distinguishes administrators from ordinary customers.

| Field | Notes |
|---|---|
| `id` | Primary key |
| `name` | Display name |
| `email` | Unique |
| `password` | bcrypt hash, never plain text |
| `is_admin` | 1 for administrators, 0 otherwise |
| `created_at` | When the account was made |

**`products`** is the catalogue. Its primary key is a readable slug (such as `aura-one-headphones`) rather than a number, which keeps product URLs tidy. The gallery is stored as a JSON array of image links.

| Field | Notes |
|---|---|
| `id` | Slug, primary key |
| `name` | Product name |
| `category` | One of the five families |
| `price` | Current price |
| `old_price` | Original price when on sale (nullable) |
| `rating` | Average star rating |
| `reviews` | Number of reviews |
| `badge` | e.g. "Sale", "New", or none |
| `image` | Primary image |
| `gallery` | JSON array of image URLs |
| `description` | Long-form copy |
| `stock` | Units available |
| `featured` | 1 to surface on the home page |
| `created_at` | When the product was added |

**`orders`** records a completed purchase, including the shipping details supplied at checkout and the server-computed money: subtotal, shipping, tax, and total. Each order points back to the user who placed it.

| Field | Notes |
|---|---|
| `id` | Primary key |
| `user_id` | Foreign key → `users` |
| `customer_name`, `email` | Who the order is for |
| `address`, `city`, `zip`, `country` | Where it ships |
| `payment_method` | e.g. "card" |
| `subtotal`, `shipping`, `tax`, `total` | Server-computed amounts |
| `status` | Defaults to "Processing" |
| `created_at` | When the order was placed |

**`order_items`** breaks each order into its individual lines, capturing the name, price, and quantity of every product at the moment of purchase so the record stays accurate even if the catalogue later changes.

| Field | Notes |
|---|---|
| `id` | Primary key |
| `order_id` | Foreign key → `orders` |
| `product_id` | The product's slug |
| `name`, `price`, `qty` | Snapshot of the line |

The relationships read cleanly: **a user has many orders**, and **an order has many order_items**. Deleting an order cascades to remove its lines, so no orphaned items are ever left behind.

## Setting It Up

The project depends only on Node.js being installed. From the `Aura` folder, fetch the dependencies and start the server:

```bash
npm install
npm start
```

On that first run there is nothing else to do. The database file, `database.sqlite`, does not exist yet — the server creates it, defines the four tables, and seeds it with the nineteen sample products and two demo accounts automatically. If you ever want a clean slate, simply delete `database.sqlite` and start again; it will be rebuilt from scratch.

## Running and Signing In

Once started, the store answers at:

```
http://localhost:4002
```

Two accounts are waiting so that both sides of the application can be explored immediately:

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@aura.com` | `admin123` |
| Customer | `demo@aura.com` | `demo123` |

Sign in with the **customer** account to browse the catalogue, build a cart, and place an order, then revisit the account page to see that order in your history. Sign in with the **administrator** account to reach the management views — add or edit a product, watch it appear in the storefront, and open the orders ledger and statistics dashboard to see the store's activity as a whole. Signing out and back in with the other account is the quickest way to feel the boundary between the two roles.

## Where It Could Go Next

Aura is complete as a coursework piece, but several natural extensions would carry it closer to a production store. Stock could be decremented as orders are placed, with out-of-stock items handled gracefully. A real payment gateway could replace the recorded payment method. Order statuses could move through a fuller lifecycle — confirmed, shipped, delivered — with email notifications at each step. Customer-written reviews could feed the ratings that are currently seeded. And on the front-end, accessibility passes and a refreshable token strategy would harden the experience for everyday use.

## In Closing

Aura set out to be two things at once: a genuine, working full-stack store, and a clear illustration of how the layers of a web application cooperate. The browser asks, the Express API decides, and SQLite remembers — each kept honestly in its lane, with security and price integrity enforced where they belong. The brand voice that runs through the storefront is part of the argument too, a reminder that careful engineering and careful presentation are not separate disciplines. What remains is a small codebase that can be read end to end and a store that behaves the way a real one should.
