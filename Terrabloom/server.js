/* ===========================================================
   Terrabloom — Express + SQLite backend
   A single, well-commented server file that exposes a small REST
   API and serves the static front-end from /public.
   =========================================================== */
const path = require("path");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./db");
const seed = require("./seed");
const config = require("./store.config");

seed(); // populate the database on first run

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------- helpers ---------------------------------------- */

// Convert a database row into the shape the front-end expects.
function toProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    oldPrice: row.old_price,
    rating: row.rating,
    reviews: row.reviews,
    badge: row.badge,
    image: row.image,
    gallery: JSON.parse(row.gallery || "[]"),
    desc: row.description,
    stock: row.stock,
    featured: !!row.featured,
  };
}

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: !!user.is_admin },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, isAdmin: !!user.is_admin };
}

function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "item";
}

// Auth middleware — verifies the Bearer token and attaches req.user.
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Please sign in to continue." });
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}

// Admin guard — must run after auth.
function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

/* ---------- store info ------------------------------------- */
app.get("/api/store", (req, res) => {
  res.json({
    name: config.name,
    tagline: config.tagline,
    currency: config.currency,
    freeShippingOver: config.freeShippingOver,
    flatShipping: config.flatShipping,
    taxRate: config.taxRate,
  });
});

/* ---------- auth ------------------------------------------- */
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are all required." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(String(email).toLowerCase());
  if (exists) return res.status(409).json({ error: "An account with that email already exists." });

  const hash = bcrypt.hashSync(String(password), 10);
  const info = db.prepare("INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, 0)")
    .run(name, String(email).toLowerCase(), hash);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(String(email).toLowerCase());
  if (!user || !bcrypt.compareSync(String(password), user.password)) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }
  res.json({ token: makeToken(user), user: publicUser(user) });
});

app.get("/api/auth/me", auth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: publicUser(user) });
});

/* ---------- catalog --------------------------------------- */
app.get("/api/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM products ORDER BY category").all();
  res.json(rows.map((r) => r.category));
});

app.get("/api/products", (req, res) => {
  const { search, category, sort, featured } = req.query;
  const where = [];
  const params = {};

  if (category && category !== "All") {
    where.push("category = @category");
    params.category = category;
  }
  if (search) {
    where.push("(LOWER(name) LIKE @q OR LOWER(category) LIKE @q OR LOWER(description) LIKE @q)");
    params.q = `%${String(search).toLowerCase()}%`;
  }
  if (featured === "true") where.push("featured = 1");

  let sql = "SELECT * FROM products";
  if (where.length) sql += " WHERE " + where.join(" AND ");

  if (sort === "low") sql += " ORDER BY price ASC";
  else if (sort === "high") sql += " ORDER BY price DESC";
  else if (sort === "rating") sql += " ORDER BY rating DESC";
  else sql += " ORDER BY featured DESC, created_at ASC, name ASC";

  res.json(db.prepare(sql).all(params).map(toProduct));
});

app.get("/api/products/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Product not found." });
  res.json(toProduct(row));
});

/* ---------- admin: product CRUD --------------------------- */
app.post("/api/products", auth, adminOnly, (req, res) => {
  const b = req.body || {};
  if (!b.name || b.price == null || !b.category) {
    return res.status(400).json({ error: "Name, price and category are required." });
  }
  // Build a unique id from the name.
  let id = b.id ? slugify(b.id) : slugify(b.name);
  let base = id, n = 2;
  while (db.prepare("SELECT 1 FROM products WHERE id = ?").get(id)) id = `${base}-${n++}`;

  const image = b.image || "assets/img/placeholder.svg";
  const gallery = Array.isArray(b.gallery) && b.gallery.length ? b.gallery : [image];

  db.prepare(`
    INSERT INTO products (id, name, category, price, old_price, rating, reviews, badge, image, gallery, description, stock, featured)
    VALUES (@id, @name, @category, @price, @old_price, @rating, @reviews, @badge, @image, @gallery, @description, @stock, @featured)
  `).run({
    id,
    name: b.name,
    category: b.category,
    price: Number(b.price),
    old_price: b.oldPrice != null && b.oldPrice !== "" ? Number(b.oldPrice) : null,
    rating: b.rating != null ? Number(b.rating) : 4.5,
    reviews: b.reviews != null ? Number(b.reviews) : 0,
    badge: b.badge || null,
    image,
    gallery: JSON.stringify(gallery),
    description: b.desc || b.description || "",
    stock: b.stock != null ? Number(b.stock) : 100,
    featured: b.featured ? 1 : 0,
  });
  res.status(201).json(toProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(id)));
});

app.put("/api/products/:id", auth, adminOnly, (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found." });
  const b = req.body || {};

  const gallery = Array.isArray(b.gallery) && b.gallery.length
    ? b.gallery
    : JSON.parse(existing.gallery || "[]");

  db.prepare(`
    UPDATE products SET
      name = @name, category = @category, price = @price, old_price = @old_price,
      rating = @rating, reviews = @reviews, badge = @badge, image = @image,
      gallery = @gallery, description = @description, stock = @stock, featured = @featured
    WHERE id = @id
  `).run({
    id: req.params.id,
    name: b.name ?? existing.name,
    category: b.category ?? existing.category,
    price: b.price != null ? Number(b.price) : existing.price,
    old_price: b.oldPrice != null ? (b.oldPrice === "" ? null : Number(b.oldPrice)) : existing.old_price,
    rating: b.rating != null ? Number(b.rating) : existing.rating,
    reviews: b.reviews != null ? Number(b.reviews) : existing.reviews,
    badge: b.badge !== undefined ? (b.badge || null) : existing.badge,
    image: b.image || existing.image,
    gallery: JSON.stringify(gallery),
    description: b.desc ?? b.description ?? existing.description,
    stock: b.stock != null ? Number(b.stock) : existing.stock,
    featured: b.featured != null ? (b.featured ? 1 : 0) : existing.featured,
  });
  res.json(toProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id)));
});

app.delete("/api/products/:id", auth, adminOnly, (req, res) => {
  const info = db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Product not found." });
  res.json({ ok: true });
});

/* ---------- orders ---------------------------------------- */
app.post("/api/orders", auth, (req, res) => {
  const { items, shipping, payment } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }
  const s = shipping || {};
  for (const field of ["name", "email", "address", "city", "zip"]) {
    if (!s[field]) return res.status(400).json({ error: `Shipping ${field} is required.` });
  }

  // Recompute every price from the database — never trust client totals.
  let subtotal = 0;
  const lines = [];
  for (const item of items) {
    const p = db.prepare("SELECT * FROM products WHERE id = ?").get(item.id);
    if (!p) return res.status(400).json({ error: `Product not available: ${item.id}` });
    const qty = Math.max(1, parseInt(item.qty) || 1);
    subtotal += p.price * qty;
    lines.push({ product_id: p.id, name: p.name, price: p.price, qty });
  }
  const shippingCost = subtotal >= config.freeShippingOver ? 0 : config.flatShipping;
  const tax = +(subtotal * config.taxRate).toFixed(2);
  const total = +(subtotal + shippingCost + tax).toFixed(2);

  const tx = db.transaction(() => {
    const info = db.prepare(`
      INSERT INTO orders (user_id, customer_name, email, address, city, zip, country, payment_method, subtotal, shipping, tax, total)
      VALUES (@user_id, @customer_name, @email, @address, @city, @zip, @country, @payment_method, @subtotal, @shipping, @tax, @total)
    `).run({
      user_id: req.user.id,
      customer_name: s.name,
      email: s.email,
      address: s.address,
      city: s.city,
      zip: s.zip,
      country: s.country || "",
      payment_method: payment || "card",
      subtotal: +subtotal.toFixed(2),
      shipping: shippingCost,
      tax,
      total,
    });
    const addItem = db.prepare("INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?)");
    for (const l of lines) addItem.run(info.lastInsertRowid, l.product_id, l.name, l.price, l.qty);
    return info.lastInsertRowid;
  });

  const orderId = tx();
  res.status(201).json(getOrder(orderId, req.user.id, req.user.isAdmin));
});

function getOrder(id, userId, isAdmin) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!order) return null;
  if (!isAdmin && order.user_id !== userId) return null;
  order.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(id);
  order.number = `${config.orderPrefix}-${100000 + order.id}`;
  return order;
}

app.get("/api/orders", auth, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC").all(req.user.id);
  for (const o of orders) {
    o.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id);
    o.number = `${config.orderPrefix}-${100000 + o.id}`;
  }
  res.json(orders);
});

app.get("/api/orders/:id", auth, (req, res) => {
  const order = getOrder(Number(req.params.id), req.user.id, req.user.isAdmin);
  if (!order) return res.status(404).json({ error: "Order not found." });
  res.json(order);
});

/* ---------- admin: all orders ----------------------------- */
app.get("/api/admin/orders", auth, adminOnly, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC, id DESC").all();
  for (const o of orders) {
    o.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id);
    o.number = `${config.orderPrefix}-${100000 + o.id}`;
  }
  res.json(orders);
});

app.get("/api/admin/stats", auth, adminOnly, (req, res) => {
  res.json({
    products: db.prepare("SELECT COUNT(*) AS n FROM products").get().n,
    orders: db.prepare("SELECT COUNT(*) AS n FROM orders").get().n,
    users: db.prepare("SELECT COUNT(*) AS n FROM users").get().n,
    revenue: db.prepare("SELECT COALESCE(SUM(total), 0) AS s FROM orders").get().s,
  });
});

/* ---------- start ----------------------------------------- */
app.listen(config.port, () => {
  console.log(`\n  ${config.name} store running →  http://localhost:${config.port}\n`);
});
