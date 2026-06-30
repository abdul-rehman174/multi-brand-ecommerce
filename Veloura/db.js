/* ===========================================================
   Database layer (SQLite via better-sqlite3)
   Creates the database file on first run and defines the schema.
   better-sqlite3 is synchronous, which keeps the code simple and
   easy to follow — perfect for a small project like this.
   =========================================================== */
const path = require("path");
const Database = require("better-sqlite3");

// The database is a single file stored next to the server.
const db = new Database(path.join(__dirname, "database.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---- Schema -------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,         -- bcrypt hash, never plain text
    is_admin    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id          TEXT    PRIMARY KEY,      -- url-friendly slug
    name        TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    price       REAL    NOT NULL,
    old_price   REAL,                     -- nullable: original price when on sale
    rating      REAL    NOT NULL DEFAULT 4.5,
    reviews     INTEGER NOT NULL DEFAULT 0,
    badge       TEXT,                     -- "Sale" | "New" | null
    image       TEXT    NOT NULL,
    gallery     TEXT    NOT NULL DEFAULT '[]',  -- JSON array of image urls
    description TEXT    NOT NULL DEFAULT '',
    stock       INTEGER NOT NULL DEFAULT 100,
    featured    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

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

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL,
    product_id TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    price      REAL    NOT NULL,
    qty        INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );
`);

module.exports = db;
