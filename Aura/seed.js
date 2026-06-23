/* ===========================================================
   Seed data
   Fills the database with realistic sample products and two demo
   accounts the first time the server runs (or when you run
   `npm run seed`). Safe to run repeatedly — it only seeds when a
   table is empty.
   =========================================================== */
const bcrypt = require("bcryptjs");
const db = require("./db");

// Build a sized Unsplash CDN url from a photo id.
const IMG = (id) => `assets/img/${id}.jpg`;

const PRODUCTS = [
  // --- Audio ---
  { id: "aura-one-headphones", name: "Aura One Headphones", category: "Audio", price: 289, old_price: 349, rating: 4.8, reviews: 1284, badge: "Sale", image: IMG("1505740420928-5e560c06d30e"), gallery: [IMG("1505740420928-5e560c06d30e"), IMG("1484704849700-f032a568e944")], description: "The Aura One wraps studio-grade sound in cushioned memory-foam comfort. Adaptive noise cancellation reads your environment 200 times a second, while a 40-hour battery keeps the music going from one timezone to the next.", featured: 1 },
  { id: "pebble-wireless-earbuds", name: "Pebble Wireless Earbuds", category: "Audio", price: 129, old_price: null, rating: 4.6, reviews: 842, badge: "New", image: IMG("1606220588913-b3aacb4d2f46"), gallery: [IMG("1606220588913-b3aacb4d2f46"), IMG("1590658268037-6bf12165a8df")], description: "Pebble disappears into your day. Spatial audio puts you in the centre of the mix, and the matte case charges wirelessly so you are never left searching for a cable.", featured: 1 },
  { id: "monolith-portable-speaker", name: "Monolith Portable Speaker", category: "Audio", price: 169, old_price: null, rating: 4.7, reviews: 503, badge: "New", image: IMG("1608043152269-423dbba4e7e1"), gallery: [IMG("1608043152269-423dbba4e7e1")], description: "A single anodised aluminium column that fills a room with warm, directional sound. Pair two for true stereo, or carry one to the garden — it shrugs off rain and dust alike.", featured: 0 },
  { id: "studio-condenser-mic", name: "Studio Condenser Mic", category: "Audio", price: 219, old_price: null, rating: 4.5, reviews: 312, badge: null, image: IMG("1590602847861-f357a9332bbc"), gallery: [IMG("1590602847861-f357a9332bbc")], description: "Broadcast-clean vocals straight out of the box. A cardioid capsule rejects room noise while the built-in shock mount keeps desk bumps out of your recording.", featured: 0 },

  // --- Wearables ---
  { id: "meridian-automatic-watch", name: "Meridian Automatic Watch", category: "Wearables", price: 459, old_price: 540, rating: 4.9, reviews: 671, badge: "Sale", image: IMG("1523275335684-37898b6baf30"), gallery: [IMG("1523275335684-37898b6baf30"), IMG("1524592094714-0f0654e20314")], description: "A quietly confident automatic that never needs a battery. The exhibition caseback reveals a 42-jewel movement, framed by a scratch-resistant sapphire crystal and an Italian leather strap.", featured: 1 },
  { id: "pulse-smartwatch", name: "Pulse Smartwatch", category: "Wearables", price: 299, old_price: null, rating: 4.6, reviews: 1542, badge: "New", image: IMG("1579586337278-3befd40fd17a"), gallery: [IMG("1579586337278-3befd40fd17a")], description: "Pulse keeps a finger on your wellbeing — ECG, blood oxygen and sleep staging on a bright always-on display that lasts five days between charges.", featured: 1 },
  { id: "horizon-polarised-sunglasses", name: "Horizon Polarised Sunglasses", category: "Wearables", price: 145, old_price: null, rating: 4.4, reviews: 288, badge: null, image: IMG("1572635196237-14b3f281503f"), gallery: [IMG("1572635196237-14b3f281503f")], description: "Cut from Italian acetate and finished by hand, Horizon softens harsh light without dulling the world. Polarised lenses cut glare from water, snow and screens.", featured: 0 },

  // --- Home ---
  { id: "halo-table-lamp", name: "Halo Table Lamp", category: "Home", price: 189, old_price: null, rating: 4.7, reviews: 421, badge: "New", image: IMG("1507473885765-e6ed057f782c"), gallery: [IMG("1507473885765-e6ed057f782c"), IMG("1513506003901-1e6a229e2d15")], description: "Halo throws a soft, shadow-free pool of light — ideal for the corner of a reading nook. A touch-sensitive base dims through five warm temperatures.", featured: 1 },
  { id: "terra-ceramic-planter", name: "Terra Ceramic Planter", category: "Home", price: 58, old_price: 72, rating: 4.5, reviews: 197, badge: "Sale", image: IMG("1485955900006-10f4d324d411"), gallery: [IMG("1485955900006-10f4d324d411")], description: "Each Terra planter is thrown on the wheel and glazed by hand, so no two share the same speckle. A matching saucer keeps your shelf dry.", featured: 0 },
  { id: "drift-ceramic-mug-set", name: "Drift Ceramic Mug Set", category: "Home", price: 44, old_price: null, rating: 4.8, reviews: 356, badge: null, image: IMG("1514228742587-6b1558fcca3d"), gallery: [IMG("1514228742587-6b1558fcca3d")], description: "A pair of generous stoneware mugs that feel right in the hand. The reactive glaze pools into quiet gradients around the rim.", featured: 0 },
  { id: "ember-soy-candle", name: "Ember Soy Candle", category: "Home", price: 36, old_price: null, rating: 4.6, reviews: 612, badge: "Best seller", image: IMG("1602874801006-9a4b0d83b6a1"), gallery: [IMG("1602874801006-9a4b0d83b6a1")], description: "Ember fills a room with woodsmoke and warm amber. Poured into a reusable tinted-glass vessel with a 50-hour burn time.", featured: 0 },

  // --- Bags ---
  { id: "voyager-leather-weekender", name: "Voyager Leather Weekender", category: "Bags", price: 379, old_price: 440, rating: 4.9, reviews: 248, badge: "Sale", image: IMG("1548036328-c9fa89d128fa"), gallery: [IMG("1548036328-c9fa89d128fa"), IMG("1547949003-9792a18a2601")], description: "Cut from a single hide of vegetable-tanned leather, the Voyager is built to outlast a decade of trips. Solid brass hardware and a cotton-twill lining finish it inside and out.", featured: 1 },
  { id: "field-commuter-backpack", name: "Field Commuter Backpack", category: "Bags", price: 159, old_price: null, rating: 4.7, reviews: 934, badge: null, image: IMG("1553062407-98eeb64c6a62"), gallery: [IMG("1553062407-98eeb64c6a62")], description: "A clean, structured commuter pack with a roll-top that expands when the day demands it. Recycled ripstop sheds rain; a fleece-lined sleeve guards your laptop.", featured: 1 },
  { id: "carry-canvas-tote", name: "Carry Canvas Tote", category: "Bags", price: 68, old_price: null, rating: 4.5, reviews: 421, badge: null, image: IMG("1591561954557-26941169b49e"), gallery: [IMG("1591561954557-26941169b49e")], description: "An everyday workhorse in 18oz organic canvas, reinforced with a wipe-clean leather base. Roomy enough for groceries, structured enough for the office.", featured: 0 },
  { id: "fold-leather-wallet", name: "Fold Leather Wallet", category: "Bags", price: 79, old_price: null, rating: 4.6, reviews: 288, badge: null, image: IMG("1627123424574-724758594e93"), gallery: [IMG("1627123424574-724758594e93")], description: "A pared-back bifold that holds eight cards and folded notes without the bulk. RFID-blocking lining keeps your cards quiet in a crowd.", featured: 0 },

  // --- Apparel ---
  { id: "atlas-quilted-jacket", name: "Atlas Quilted Jacket", category: "Apparel", price: 198, old_price: 240, rating: 4.7, reviews: 356, badge: "Sale", image: IMG("1551028719-00167b16eac5"), gallery: [IMG("1551028719-00167b16eac5"), IMG("1544022613-e87ca75a784a")], description: "Warmth without the weight. The Atlas pairs a wind-resistant recycled shell with responsibly sourced insulation, packing down small enough to live in your bag.", featured: 1 },
  { id: "everyday-organic-tee", name: "Everyday Organic Tee", category: "Apparel", price: 38, old_price: null, rating: 4.5, reviews: 1893, badge: "Best seller", image: IMG("1521572163474-6864f9cf17ab"), gallery: [IMG("1521572163474-6864f9cf17ab")], description: "The tee you reach for first. Garment-dyed heavyweight organic cotton that holds its shape wash after wash, with a relaxed-but-tidy fit.", featured: 0 },
  { id: "loom-merino-knit", name: "Loom Merino Knit", category: "Apparel", price: 128, old_price: null, rating: 4.8, reviews: 274, badge: null, image: IMG("1576566588028-4147f3842f27"), gallery: [IMG("1576566588028-4147f3842f27")], description: "Spun from traceable merino, Loom regulates temperature whether you are commuting or escaping the city. Naturally odour-resistant, so it needs washing less often.", featured: 0 },
  { id: "summit-leather-sneaker", name: "Summit Leather Sneaker", category: "Apparel", price: 149, old_price: 179, rating: 4.6, reviews: 712, badge: "Sale", image: IMG("1542291026-7eec264c27ff"), gallery: [IMG("1542291026-7eec264c27ff"), IMG("1460353581641-37baddab0fa2")], description: "A clean, low-profile sneaker in soft full-grain leather, set on a cushioned cork-and-rubber sole that moulds to your stride.", featured: 1 },
];

const USERS = [
  { name: "Aura Admin", email: "admin@aura.com", password: "admin123", is_admin: 1 },
  { name: "Demo Customer", email: "demo@aura.com", password: "demo123", is_admin: 0 },
];

function seed() {
  const productCount = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
  if (productCount === 0) {
    const insert = db.prepare(`
      INSERT INTO products (id, name, category, price, old_price, rating, reviews, badge, image, gallery, description, stock, featured)
      VALUES (@id, @name, @category, @price, @old_price, @rating, @reviews, @badge, @image, @gallery, @description, @stock, @featured)
    `);
    const tx = db.transaction((rows) => {
      for (const p of rows) {
        insert.run({
          ...p,
          old_price: p.old_price ?? null,
          badge: p.badge ?? null,
          gallery: JSON.stringify(p.gallery || [p.image]),
          stock: p.stock ?? 100,
          featured: p.featured ?? 0,
        });
      }
    });
    tx(PRODUCTS);
    console.log(`Seeded ${PRODUCTS.length} products.`);
  }

  const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  if (userCount === 0) {
    const insert = db.prepare("INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)");
    for (const u of USERS) {
      insert.run(u.name, u.email, bcrypt.hashSync(u.password, 10), u.is_admin);
    }
    console.log(`Seeded ${USERS.length} demo users (admin@aura.com / admin123, demo@aura.com / demo123).`);
  }
}

module.exports = seed;

if (require.main === module) seed();
