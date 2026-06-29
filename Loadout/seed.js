/* ===========================================================
   Seed data
   Fills the database with realistic sample products and two demo
   accounts the first time the server runs (or when you run
   `npm run seed`). Safe to run repeatedly — it only seeds when a
   table is empty.
   =========================================================== */
const bcrypt = require("bcryptjs");
const db = require("./db");

// Product photos come from picsum.photos using a stable per-product seed,
// so every run returns the same real photograph (with a local fallback offline).
const IMG = (slug) => `assets/img/${slug}.jpg`;

const PRODUCTS = [
  // ---------- Laptops ----------
  { id: "nova-14-ultrabook", name: "Voltix Nova 14 Ultrabook", category: "Laptops", price: 1499, old_price: 1699, rating: 4.8, reviews: 312, badge: "Sale", image: IMG("nova-14"), gallery: [IMG("nova-14"), IMG("nova-14-2"), IMG("nova-14-3")], description: "A 1.1kg magnesium chassis wrapped around a 14\" 120Hz OLED and a 14-core CPU. Engineered for speed, it runs cool, silent and all day on a single charge.", featured: 1 },
  { id: "titan-16-creator", name: "Voltix Titan 16 Creator", category: "Laptops", price: 2299, old_price: null, rating: 4.9, reviews: 148, badge: "New", image: IMG("titan-16"), gallery: [IMG("titan-16"), IMG("titan-16-2"), IMG("titan-16-3")], description: "A workstation-class 16\" mini-LED laptop with a discrete GPU and 64GB of fast memory. Built to render, compile and edit 8K without breaking a sweat.", featured: 1 },
  { id: "breeze-13-air", name: "Voltix Breeze 13 Air", category: "Laptops", price: 899, old_price: 1049, rating: 4.6, reviews: 207, badge: "Sale", image: IMG("breeze-13"), gallery: [IMG("breeze-13"), IMG("breeze-13-2")], description: "A featherweight everyday laptop with an all-metal deck and a vivid 13\" display. Pro-grade portability for class, café and commute.", featured: 0 },

  // ---------- Smartphones ----------
  { id: "aero-5g", name: "Voltix Aero 5G Smartphone", category: "Smartphones", price: 999, old_price: null, rating: 4.7, reviews: 421, badge: "New", image: IMG("aero-5g"), gallery: [IMG("aero-5g"), IMG("aero-5g-2"), IMG("aero-5g-3")], description: "A titanium-framed 6.7\" 144Hz flagship with a triple periscope camera and blistering 5G. Spec-driven photography in your pocket.", featured: 1 },
  { id: "pulse-x-phone", name: "Voltix Pulse X Phone", category: "Smartphones", price: 649, old_price: 749, rating: 4.5, reviews: 286, badge: "Sale", image: IMG("pulse-x"), gallery: [IMG("pulse-x"), IMG("pulse-x-2")], description: "Mid-range muscle: a 120Hz AMOLED, two-day battery and 67W fast charging. The smart pick for performance without the flagship price.", featured: 1 },
  { id: "edge-mini-phone", name: "Voltix Edge Mini Phone", category: "Smartphones", price: 549, old_price: null, rating: 4.4, reviews: 162, badge: null, image: IMG("edge-mini"), gallery: [IMG("edge-mini"), IMG("edge-mini-2")], description: "A compact 6.1\" powerhouse that fits one-handed without compromise. Flagship silicon, real battery life, zero bulk.", featured: 0 },

  // ---------- Audio ----------
  { id: "pulse-anc-headset", name: "Pulse ANC Headset", category: "Audio", price: 249, old_price: 299, rating: 4.8, reviews: 538, badge: "Sale", image: IMG("pulse-anc"), gallery: [IMG("pulse-anc"), IMG("pulse-anc-2"), IMG("pulse-anc-3")], description: "Adaptive active noise cancellation, 40mm planar drivers and 40 hours of playback. Studio-grade sound engineered to disappear into the music.", featured: 1 },
  { id: "sonic-buds-pro", name: "Voltix Sonic Buds Pro", category: "Audio", price: 149, old_price: null, rating: 4.6, reviews: 394, badge: "New", image: IMG("sonic-buds"), gallery: [IMG("sonic-buds"), IMG("sonic-buds-2")], description: "True-wireless earbuds with hybrid ANC, spatial audio and a wireless charging case. Crystal-clear calls and 30 hours of total runtime.", featured: 1 },
  { id: "boom-portable-speaker", name: "Voltix Boom Portable Speaker", category: "Audio", price: 119, old_price: 139, rating: 4.5, reviews: 211, badge: "Sale", image: IMG("boom-speaker"), gallery: [IMG("boom-speaker"), IMG("boom-speaker-2")], description: "360° room-filling sound in an IP67 ruggedised body. 24-hour battery, USB-C and stereo pairing for instant outdoor parties.", featured: 0 },

  // ---------- Gaming ----------
  { id: "apex-rtx-tower", name: "Apex RTX Gaming Tower", category: "Gaming", price: 2499, old_price: null, rating: 4.9, reviews: 176, badge: "New", image: IMG("apex-rtx"), gallery: [IMG("apex-rtx"), IMG("apex-rtx-2"), IMG("apex-rtx-3")], description: "A liquid-cooled flagship rig with a top-tier GPU, 32GB DDR5 and a tempered-glass tower lit by addressable RGB. Pro-grade frames, zero compromise.", featured: 1 },
  { id: "hyperboard-keyboard", name: "Hyperboard Mechanical Keyboard", category: "Gaming", price: 159, old_price: 189, rating: 4.8, reviews: 467, badge: "Sale", image: IMG("hyperboard"), gallery: [IMG("hyperboard"), IMG("hyperboard-2")], description: "Hot-swappable optical switches, an aluminium top plate and per-key RGB. A gasket-mounted 75% board tuned for a satisfying, fast keystroke.", featured: 1 },
  { id: "volt-pro-mouse", name: "Volt Pro Wireless Mouse", category: "Gaming", price: 89, old_price: null, rating: 4.7, reviews: 352, badge: "New", image: IMG("volt-pro-mouse"), gallery: [IMG("volt-pro-mouse"), IMG("volt-pro-mouse-2")], description: "A 58g featherweight with a 30K-DPI sensor and 8000Hz polling. Engineered for esports precision with a 90-hour wireless battery.", featured: 1 },
  { id: "strike-gaming-headset", name: "Voltix Strike Gaming Headset", category: "Gaming", price: 129, old_price: 159, rating: 4.5, reviews: 243, badge: "Sale", image: IMG("strike-headset"), gallery: [IMG("strike-headset"), IMG("strike-headset-2")], description: "Low-latency wireless audio with 7.1 surround and a noise-cancelling boom mic. Memory-foam comfort built for marathon sessions.", featured: 0 },

  // ---------- Components ----------
  { id: "surge-4k-monitor", name: "Surge 4K Monitor", category: "Components", price: 699, old_price: 829, rating: 4.8, reviews: 198, badge: "Sale", image: IMG("surge-4k"), gallery: [IMG("surge-4k"), IMG("surge-4k-2"), IMG("surge-4k-3")], description: "A 32\" 4K 144Hz IPS panel with HDR1000 and a USB-C hub. Razor-sharp detail and buttery motion for creators and gamers alike.", featured: 1 },
  { id: "core-rtx-gpu", name: "Voltix Core RTX Graphics Card", category: "Components", price: 1099, old_price: null, rating: 4.7, reviews: 134, badge: "New", image: IMG("core-rtx"), gallery: [IMG("core-rtx"), IMG("core-rtx-2")], description: "A triple-fan flagship GPU with 16GB GDDR6X and a vapor-chamber cooler. Ray-traced, AI-accelerated performance engineered for 4K.", featured: 0 },
  { id: "fusion-ssd-2tb", name: "Voltix Fusion 2TB NVMe SSD", category: "Components", price: 179, old_price: 219, rating: 4.9, reviews: 612, badge: "Sale", image: IMG("fusion-ssd"), gallery: [IMG("fusion-ssd"), IMG("fusion-ssd-2")], description: "A blistering PCIe 5.0 drive hitting 12,000 MB/s reads with a slim graphene heatsink. Load games and projects in the blink of an eye.", featured: 0 },
  { id: "ion-power-supply", name: "Voltix Ion 1000W Power Supply", category: "Components", price: 199, old_price: null, rating: 4.6, reviews: 97, badge: null, image: IMG("ion-psu"), gallery: [IMG("ion-psu"), IMG("ion-psu-2")], description: "A fully modular 80+ Platinum PSU with a fluid-dynamic fan and ATX 3.1 support. Clean, quiet, stable power for the most demanding builds.", featured: 0 },

  // ---------- Smart Home ----------
  { id: "nimbus-smart-hub", name: "Nimbus Smart Hub", category: "Smart Home", price: 129, old_price: 149, rating: 4.5, reviews: 289, badge: "Sale", image: IMG("nimbus-hub"), gallery: [IMG("nimbus-hub"), IMG("nimbus-hub-2")], description: "A Matter-ready control centre that ties every device into one app. Local processing keeps automations fast, private and reliable.", featured: 1 },
  { id: "photon-webcam-4k", name: "Photon Webcam 4K", category: "Smart Home", price: 129, old_price: null, rating: 4.6, reviews: 174, badge: "New", image: IMG("photon-webcam"), gallery: [IMG("photon-webcam"), IMG("photon-webcam-2")], description: "A 4K AI webcam with auto-framing, HDR and a dual-mic array. Engineered to make every call and stream look studio-sharp.", featured: 0 },
  { id: "halo-smart-bulb-pack", name: "Voltix Halo Smart Bulb 4-Pack", category: "Smart Home", price: 59, old_price: 79, rating: 4.4, reviews: 321, badge: "Sale", image: IMG("halo-bulb"), gallery: [IMG("halo-bulb"), IMG("halo-bulb-2")], description: "16-million-colour smart bulbs with tunable white and music sync. Set scenes, schedules and neon vibes from your phone or voice.", featured: 0 },
  { id: "guard-cam-2k", name: "Voltix Guard 2K Security Cam", category: "Smart Home", price: 99, old_price: null, rating: 4.5, reviews: 203, badge: null, image: IMG("guard-cam"), gallery: [IMG("guard-cam"), IMG("guard-cam-2")], description: "A weatherproof 2K camera with colour night vision, AI person detection and local encrypted storage. Keep an eye on things from anywhere.", featured: 0 },
];

const USERS = [
  { name: "Voltix Admin", email: "admin@voltix.com", password: "admin123", is_admin: 1 },
  { name: "Demo Customer", email: "demo@voltix.com", password: "demo123", is_admin: 0 },
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
    console.log(`Seeded ${USERS.length} demo users (admin@voltix.com / admin123, demo@voltix.com / demo123).`);
  }
}

module.exports = seed;

// Allow running directly:  node seed.js
if (require.main === module) seed();
