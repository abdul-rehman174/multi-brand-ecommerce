/* ===========================================================
   Cart engine + shared UI helpers.
   The cart is a simple { id: qty } map persisted to localStorage,
   so it survives page reloads and works across every page.
   =========================================================== */
const CART_KEY = "terrabloom_cart";
const WISH_KEY = "terrabloom_wishlist";
const SHIPPING = 7;          // flat shipping shown in summaries
const FREE_OVER = 75;        // free shipping threshold
const PROMO = { GROW10: 0.10, WELCOME15: 0.15 }; // promo codes -> discount %

/* ---------- storage ---------- */
const LEGACY_CART_KEY = "terra_cart"; // previous key — adopt any cart saved before the rename
function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) return JSON.parse(raw) || {};
    // one-time migration: a cart saved under the old key shouldn't vanish
    const legacy = localStorage.getItem(LEGACY_CART_KEY);
    if (legacy) {
      localStorage.setItem(CART_KEY, legacy);
      localStorage.removeItem(LEGACY_CART_KEY);
      return JSON.parse(legacy) || {};
    }
    return {};
  } catch { return {}; }
}
function writeCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    // localStorage can be unavailable on file:// or in private mode — warn so
    // the empty cart isn't a silent mystery.
    console.warn("Terrabloom: couldn't save your cart — storage is unavailable. " +
                 "Run the site through a local web server (not file://) so the cart persists.", e);
  }
  updateCartCount();
}

/* ---------- mutations ---------- */
function addToCart(id, qty = 1) {
  const cart = readCart();
  cart[id] = (cart[id] || 0) + qty;
  writeCart(cart);
  const p = getProduct(id);
  toast(`${p ? p.name : "Item"} added to cart`);
}
function setQty(id, qty) {
  const cart = readCart();
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  writeCart(cart);
}
function removeFromCart(id) {
  const cart = readCart();
  delete cart[id];
  writeCart(cart);
}
function cartCount() {
  return Object.values(readCart()).reduce((a, b) => a + b, 0);
}
/** Returns [{ ...product, qty, line }] for items still in the catalog. */
function cartDetailed() {
  const cart = readCart();
  return Object.entries(cart)
    .map(([id, qty]) => {
      const p = getProduct(id);
      return p ? { ...p, qty, line: p.price * qty } : null;
    })
    .filter(Boolean);
}
function cartSubtotal() {
  return cartDetailed().reduce((sum, i) => sum + i.line, 0);
}

/* ---------- wishlist (saved items) ---------- */
function readWishlist() {
  try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; }
  catch { return []; }
}
function isWished(id) {
  return readWishlist().includes(id);
}
/** Toggle an item in the wishlist; returns the new state (true = now saved). */
function toggleWishlist(id) {
  const list = readWishlist();
  const i = list.indexOf(id);
  let saved;
  if (i === -1) { list.push(id); saved = true; }
  else { list.splice(i, 1); saved = false; }
  try { localStorage.setItem(WISH_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  const p = getProduct(id);
  toast(saved ? `${p ? p.name : "Item"} saved to wishlist` : "Removed from wishlist");
  return saved;
}

/* ---------- formatting ---------- */
function money(n) {
  const sym = (typeof STORE !== "undefined" && STORE && STORE.currency) || "$";
  return sym + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function starRow(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/* ---------- image fallback ----------
   Product photos are hosted on Unsplash (royalty-free) and need a connection.
   If one fails to load (offline, or a blocked request), swap in a lightweight
   inline SVG placeholder so the layout never shows a broken-image icon. */
const IMG_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E" +
  "%3Crect width='100%25' height='100%25' fill='%23e7efe2'/%3E" +
  "%3Cg fill='none' stroke='%239bb593' stroke-width='3' stroke-linecap='round'%3E" +
  "%3Cpath d='M200 250 V160'/%3E" +
  "%3Cpath d='M200 185c-30 0-52-22-52-50 28 0 52 22 52 50z' fill='%23bcd4b3' stroke='none'/%3E" +
  "%3Cpath d='M200 210c30 0 52-22 52-50-28 0-52 22-52 50z' fill='%23a8c79e' stroke='none'/%3E%3C/g%3E" +
  "%3Ctext x='50%25' y='300' font-family='Georgia, serif' font-size='22' fill='%236b7464' text-anchor='middle'%3ETerrabloom%3C/text%3E" +
  "%3C/svg%3E";
function imgError(el) { el.onerror = null; el.src = IMG_FALLBACK; }

/* ---------- header cart badge ---------- */
function updateCartCount() {
  const n = cartCount();
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = n;
    el.dataset.empty = n === 0 ? "true" : "false";
  });
}

/* ---------- toast ---------- */
function toast(msg) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span class="ok">${ICONS.check}</span> ${msg}`;
  wrap.appendChild(t);
  setTimeout(() => {
    t.classList.add("out");
    t.addEventListener("animationend", () => t.remove());
  }, 2200);
}

/* ---------- inline SVG icons (no icon font needed) ---------- */
const ICONS = {
  cart:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
  heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  truck: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  shield:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  refresh:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.7 4.4A9 9 0 0 0 20.5 15"/></svg>',
  tag:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  bag:   '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  menu:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  user:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  box:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>'
};

/* ---------- account menu (header) ----------
   Shows a "Sign in" link when logged out, or a dropdown with the user's
   orders / admin panel / sign-out when logged in. */
function accountMarkup() {
  if (!Auth.isLoggedIn()) {
    return `<a class="icon-btn" href="login.html" aria-label="Sign in" title="Sign in">${ICONS.user}</a>`;
  }
  const u = Auth.user() || { name: "Account" };
  const first = (u.name || "Account").split(" ")[0];
  return `
    <div class="account" id="account">
      <button class="icon-btn" id="acctBtn" aria-label="Account" aria-haspopup="true">${ICONS.user}</button>
      <div class="account-menu" id="acctMenu">
        <div class="account-head">Hi, ${first}</div>
        <a href="orders.html">${ICONS.box} My orders</a>
        ${Auth.isAdmin() ? `<a href="admin.html">${ICONS.tag} Admin panel</a>` : ""}
        <button type="button" id="logoutBtn">Sign out</button>
      </div>
    </div>`;
}

function wireAccountMenu(scope) {
  const acctBtn = scope.querySelector("#acctBtn");
  const menu = scope.querySelector("#acctMenu");
  if (acctBtn && menu) {
    acctBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
    document.addEventListener("click", () => menu.classList.remove("open"));
  }
  const logoutBtn = scope.querySelector("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Auth.clear();
      toast("Signed out");
      setTimeout(() => (location.href = "index.html"), 400);
    });
  }
}

/** Redirect to the login page (preserving where to return) if not signed in.
    Returns true when a redirect happened. */
function requireLogin(returnTo) {
  if (Auth.isLoggedIn()) return false;
  const back = returnTo || (location.pathname.split("/").pop() + location.search);
  location.href = "login.html?next=" + encodeURIComponent(back);
  return true;
}

/* ---------- shared chrome (header + footer) ----------
   Injected so every page stays identical without duplicating markup. */
function mountChrome(active) {
  const header = document.getElementById("site-header");
  if (header) {
    header.className = "site-header";
    const q = new URLSearchParams(location.search).get("q") || "";
    header.innerHTML = `
      <div class="container nav">
        <a class="brand" href="index.html"><span class="dot"></span>Terrabloom</a>
        <nav class="nav-links" id="navLinks">
          <a href="index.html" ${active === "home" ? 'class="active"' : ""}>Home</a>
          <a href="products.html" ${active === "products" ? 'class="active"' : ""}>Shop</a>
          <a href="index.html#features">Why Terrabloom</a>
          <a href="index.html#newsletter">Contact</a>
        </nav>
        <form class="nav-search" action="products.html" method="get" role="search">
          <span class="ic">${ICONS.search}</span>
          <input type="search" name="q" placeholder="Search plants & more…" aria-label="Search products" value="${q.replace(/"/g, "&quot;")}">
        </form>
        <div class="nav-right">
          <button class="icon-btn hamburger" id="hamburger" aria-label="Menu">${ICONS.menu}</button>
          ${accountMarkup()}
          <a class="icon-btn" href="cart.html" aria-label="Cart">
            ${ICONS.cart}<span class="cart-count" data-empty="true">0</span>
          </a>
        </div>
      </div>`;
    const burger = header.querySelector("#hamburger");
    const links = header.querySelector("#navLinks");
    burger.addEventListener("click", () => links.classList.toggle("open"));
    wireAccountMenu(header);

    // Drive search navigation with JS so it works identically whether the site
    // is served over http:// or opened directly from a file:// path.
    const searchForm = header.querySelector(".nav-search");
    searchForm.addEventListener("submit", e => {
      e.preventDefault();
      const term = searchForm.querySelector("input[name=q]").value.trim();
      location.href = "products.html" + (term ? "?q=" + encodeURIComponent(term) : "");
    });
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-about">
            <a class="brand" href="index.html"><span class="dot"></span>Terrabloom</a>
            <p>Plants, planters and garden goods to help you grow something beautiful. Bring the outside in.</p>
            <div class="socials">
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">◎</a>
              <a href="#" aria-label="Facebook">f</a>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <a href="products.html">All plants</a>
            <a href="products.html">New arrivals</a>
            <a href="products.html">On sale</a>
          </div>
          <div>
            <h4>Grow with us</h4>
            <a href="#">Our story</a>
            <a href="#">Plant care blog</a>
            <a href="#">Sustainability</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#">Help center</a>
            <a href="#">Shipping & care</a>
            <a href="#">Returns</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Terrabloom. Grown with care.</span>
          <span>Secure checkout · 30-day healthy-plant guarantee</span>
        </div>
      </div>`;
  }

  updateCartCount();
}

/* ---------- reusable product card markup ---------- */
function productCardHTML(p) {
  const badge = p.badge
    ? `<span class="tag ${p.badge === "Sale" ? "sale" : ""}">${p.badge}</span>` : "";
  const old = p.oldPrice ? `<span class="was">${money(p.oldPrice)}</span>` : "";
  return `
    <article class="card">
      <div class="card-media">
        ${badge}
        <button class="wish ${isWished(p.id) ? "active" : ""}" data-wish="${p.id}" aria-label="Save to wishlist" aria-pressed="${isWished(p.id)}">${ICONS.heart}</button>
        <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="imgError(this)"></a>
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3 class="card-title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="rating"><span class="stars">${starRow(p.rating)}</span> ${p.rating} (${p.reviews})</div>
        <div class="card-foot">
          <div class="price">${money(p.price)}${old}</div>
          <button class="add-btn" data-add="${p.id}">${ICONS.cart} Add</button>
        </div>
      </div>
    </article>`;
}

/* Delegate [data-add] (cart) and [data-wish] (wishlist) clicks — works for
   cards rendered now or later. */
document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) { addToCart(add.dataset.add); return; }

  const wish = e.target.closest("[data-wish]");
  if (wish) {
    e.preventDefault();
    const saved = toggleWishlist(wish.dataset.wish);
    wish.classList.toggle("active", saved);
    wish.setAttribute("aria-pressed", saved);
  }
});

/* ---------- keep every page in sync with the one shared cart ----------
   The cart lives in a single localStorage key, but a page's UI can fall out
   of date in two cases: (1) returning via the browser's Back button, which can
   restore a page from the bfcache without re-running scripts, and (2) changes
   made in another tab. Re-reading storage on these events keeps the header
   badge — and any page that defines a global render()/refreshCart() — accurate. */
function syncCartUI() {
  updateCartCount();
  if (typeof window.refreshCart === "function") window.refreshCart();
}
window.addEventListener("pageshow", syncCartUI);
window.addEventListener("storage", e => {
  if (e.key === CART_KEY || e.key === WISH_KEY || e.key === null) syncCartUI();
});
