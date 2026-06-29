/* ===========================================================
   Catalog loader
   The product data now lives in the SQLite database and is served
   by the backend. This module fetches it once and exposes the same
   globals the pages already use (PRODUCTS, CATEGORIES, getProduct),
   so the rest of the front-end stays simple.
   =========================================================== */
let PRODUCTS = [];
let CATEGORIES = ["All"];

/** Load the full catalog + category list from the API (called by boot()). */
async function loadCatalog() {
  PRODUCTS = await API.get("/products");
  const cats = await API.get("/categories");
  CATEGORIES = ["All", ...cats];
  return PRODUCTS;
}

/** Look up a single product by id from the loaded catalog. */
function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}
