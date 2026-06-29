/* ===========================================================
   API client + auth state
   A thin wrapper around fetch() that talks to the Express backend,
   plus helpers for storing the logged-in user and JWT token.
   Loaded before every other script.
   =========================================================== */
const TOKEN_KEY = "loadout_token";
const USER_KEY = "loadout_user";

const Auth = {
  token() { return localStorage.getItem(TOKEN_KEY); },
  user() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
  isLoggedIn() { return !!this.token(); },
  isAdmin() { const u = this.user(); return !!(u && u.isAdmin); },
  set(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

const API = {
  async request(path, { method = "GET", body, auth = false } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth && Auth.token()) headers["Authorization"] = "Bearer " + Auth.token();

    let res;
    try {
      res = await fetch("/api" + path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error("Can't reach the server. Make sure the backend is running (npm start).");
    }

    let data = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
    return data;
  },
  get(path, auth) { return this.request(path, { auth }); },
  post(path, body, auth) { return this.request(path, { method: "POST", body, auth }); },
  put(path, body, auth) { return this.request(path, { method: "PUT", body, auth }); },
  del(path, auth) { return this.request(path, { method: "DELETE", auth }); },
};

// Store settings (currency etc.), loaded once and cached.
let STORE = { name: "Loadout", currency: "$" };

/* Page bootstrap: load store settings + product catalog, then render.
   Wrapping page logic in boot() guarantees the catalog is ready before
   any page tries to use it. */
async function boot(render) {
  try {
    STORE = await API.get("/store");
  } catch (e) { console.warn("Could not load store settings:", e.message); }
  try {
    await loadCatalog();
  } catch (e) { console.error("Could not load catalog:", e.message); }
  try {
    await render();
  } catch (e) { console.error(e); }
}
