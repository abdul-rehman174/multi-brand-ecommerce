# Multi-Brand E-Commerce

Seven fully-branded online storefronts built on **one shared engine** —
a generic Express + SQLite backend that's customised per store through a single
`store.config.js` file. Same codebase, seven different brands, products and designs.

## The stores

| Store | Category | Tagline | Default port |
|-------|----------|---------|-------------|
| **Aura** | Premium lifestyle goods | _Considered objects for everyday life_ | 4002 |
| **Brume** | Specialty coffee roastery | _Small-batch coffee, roasted with care_ | 4005 |
| **Loadout** | Consumer electronics / gaming | _Gear up. Game on._ | 4003 |
| **Lumora** | Modern home essentials | _Modern essentials, beautifully made_ | 4001 |
| **Terrabloom** | Plants, garden & greenery | _Bring the outside in_ | 4004 |
| **Veloura** | Fashion & apparel boutique | _Timeless pieces, considered design_ | 4005 |
| **Voltix** | Pro-grade electronics | _Engineered for speed. Pro-grade gear._ | 4003 |

> Some stores share a default port — set `PORT` to run more than one at the same time
> (e.g. `PORT=5001 npm start`).

## Project status

Active development. The shared engine is in place and the **Aura** store is the
reference implementation; the remaining storefronts are being rolled out one at a time.

## Tech stack

- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`)
- **Auth:** JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)
- **Frontend:** vanilla HTML / CSS / JavaScript (served from each store's `public/`)

## Architecture

Every store follows the same structure:

```
<store>/
├── server.js          # Express server — shared, generic across all stores
├── db.js              # SQLite setup — identical across all stores
├── store.config.js    # ← the ONE file that defines the brand (name, tagline, shipping, tax…)
├── seed.js            # store-specific product catalogue
└── public/            # store-specific frontend (HTML/CSS/JS, images)
```

The backend is intentionally brand-agnostic: to spin up a new store you copy the
template, edit `store.config.js`, write a new `seed.js`, and drop in a new `public/`.

## Running a store locally

```bash
cd Aura            # or any store folder
npm install        # install dependencies
npm run seed       # create & populate the SQLite database
npm start          # start the server
```

Then open the printed `http://localhost:<port>` in your browser.

## Note on the database

SQLite database files (`*.sqlite`) are **not** committed — they're generated
locally by `npm run seed`. Run the seed step before starting any store for the
first time.
