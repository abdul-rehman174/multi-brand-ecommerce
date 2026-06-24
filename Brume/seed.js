/* ===========================================================
   Seed data
   Fills the database with realistic sample products and two demo
   accounts the first time the server runs (or when you run
   `npm run seed`). Safe to run repeatedly — it only seeds when a
   table is empty.
   =========================================================== */
const bcrypt = require("bcryptjs");
const db = require("./db");

// Product photography is bundled locally under assets/img, named by slug.
const IMG = (slug) => `assets/img/${slug}.jpg`;

const PRODUCTS = [
  // ---------- Single Origin ----------
  { id: "ethiopia-yirgacheffe", name: "Ethiopia Yirgacheffe", category: "Single Origin", price: 19, old_price: null, rating: 4.9, reviews: 214, badge: "New",
    description: "A bright, floral washed coffee with notes of jasmine, bergamot and stone fruit. Light-roasted to honour its delicate, tea-like clarity.", featured: 1 },
  { id: "colombia-huila", name: "Colombia Huila", category: "Single Origin", price: 17, old_price: null, rating: 4.8, reviews: 176, badge: null,
    description: "A rounded, crowd-pleasing cup grown in the high hills of Huila. Caramel sweetness, red apple and a clean, gentle finish.", featured: 1 },
  { id: "kenya-aa", name: "Kenya AA", category: "Single Origin", price: 21, old_price: 24, rating: 4.8, reviews: 132, badge: "Sale",
    description: "A vibrant, juicy coffee with blackcurrant, grapefruit and a syrupy body. Bold acidity that sings through milk or black.", featured: 0 },
  { id: "guatemala-antigua", name: "Guatemala Antigua", category: "Single Origin", price: 18, old_price: null, rating: 4.7, reviews: 98, badge: null,
    description: "Grown in volcanic Antigua soil — cocoa, toasted almond and a whisper of orange. A balanced, comforting medium roast.", featured: 0 },
  { id: "sumatra-mandheling", name: "Sumatra Mandheling", category: "Single Origin", price: 19, old_price: null, rating: 4.6, reviews: 84, badge: "New",
    description: "Deep and earthy with cedar, dark chocolate and a full, low-acid body. Wet-hulled the traditional way for a heavy, syrupy cup.", featured: 1 },

  // ---------- Blends ----------
  { id: "house-blend", name: "Brume House Blend", category: "Blends", price: 15, old_price: null, rating: 4.9, reviews: 421, badge: "Bestseller",
    description: "Our everyday signature — milk chocolate, hazelnut and brown sugar. Approachable, sweet and endlessly drinkable, however you brew it.", featured: 1 },
  { id: "morning-light-blend", name: "Morning Light Blend", category: "Blends", price: 15, old_price: null, rating: 4.7, reviews: 168, badge: null,
    description: "A brighter way to start the day — citrus, honey and a clean finish. A lighter blend built for pour-over and filter.", featured: 0 },
  { id: "crema-espresso-blend", name: "Crema Espresso Blend", category: "Blends", price: 16, old_price: null, rating: 4.8, reviews: 256, badge: null,
    description: "A rich espresso blend pulling thick golden crema, with dark cocoa, toffee and a lingering nutty sweetness. Made for the machine.", featured: 1 },
  { id: "midnight-decaf", name: "Midnight Decaf", category: "Blends", price: 16, old_price: null, rating: 4.6, reviews: 92, badge: null,
    description: "Swiss-water decaffeinated with all the flavour intact — cocoa, caramel and a smooth body. The after-dinner cup that won't keep you up.", featured: 0 },

  // ---------- Espresso Machines ----------
  { id: "aurora-espresso-machine", name: "Aurora Espresso Machine", category: "Espresso Machines", price: 549, old_price: 629, rating: 4.8, reviews: 143, badge: "Sale",
    description: "A compact home espresso machine with a 15-bar pump, fast-heating thermoblock and a proper steam wand for silky microfoam.", featured: 1 },
  { id: "dual-boiler-espresso-machine", name: "Dual-Boiler Pro Machine", category: "Espresso Machines", price: 899, old_price: null, rating: 4.9, reviews: 76, badge: "New",
    description: "Café-grade dual-boiler control lets you brew and steam at once, with PID temperature stability for repeatable, barista-level shots.", featured: 0 },

  // ---------- Brewing Gear ----------
  { id: "pour-over-dripper", name: "Ceramic Pour-Over Dripper", category: "Brewing Gear", price: 34, old_price: null, rating: 4.8, reviews: 312, badge: "New",
    description: "A spiral-ribbed ceramic cone that holds heat beautifully for an even, clean extraction. Single-cup ritual, perfected.", featured: 1 },
  { id: "chemex-brewer", name: "Glass Pour-Over Carafe", category: "Brewing Gear", price: 48, old_price: null, rating: 4.7, reviews: 188, badge: null,
    description: "An hourglass borosilicate carafe with a polished wood collar. Thick filters yield a bright, sediment-free, crystal-clear brew.", featured: 0 },
  { id: "french-press", name: "French Press · 1L", category: "Brewing Gear", price: 39, old_price: null, rating: 4.6, reviews: 224, badge: null,
    description: "A double-wall stainless French press that keeps coffee hot to the last pour. Full-immersion brewing for a rich, full body.", featured: 0 },
  { id: "aeropress", name: "AeroPress Coffee Maker", category: "Brewing Gear", price: 36, old_price: null, rating: 4.9, reviews: 489, badge: null,
    description: "The cult favourite — fast, forgiving and almost indestructible. Press a smooth, low-acid cup anywhere in under a minute.", featured: 1 },
  { id: "burr-grinder", name: "Conical Burr Grinder", category: "Brewing Gear", price: 129, old_price: 159, rating: 4.7, reviews: 264, badge: "Sale",
    description: "Forty grind settings from espresso-fine to French-press-coarse, with hardened conical burrs for consistent, low-heat grinding.", featured: 1 },
  { id: "gooseneck-kettle", name: "Gooseneck Pour Kettle", category: "Brewing Gear", price: 79, old_price: null, rating: 4.8, reviews: 156, badge: null,
    description: "A variable-temperature electric kettle with a precise gooseneck spout for the slow, controlled pour that filter coffee loves.", featured: 0 },

  // ---------- Drinkware ----------
  { id: "stoneware-mug", name: "Stoneware Coffee Mug", category: "Drinkware", price: 18, old_price: null, rating: 4.8, reviews: 203, badge: null,
    description: "A hand-glazed stoneware mug with a comfortable heft and a reactive matte finish. Holds a generous, honest cup.", featured: 1 },
  { id: "double-wall-glasses", name: "Double-Wall Glasses · Set of 2", category: "Drinkware", price: 32, old_price: null, rating: 4.7, reviews: 141, badge: "New",
    description: "Borosilicate double-wall glasses that keep drinks hot and hands cool, showing off the layers of a perfectly poured latte.", featured: 0 },
  { id: "travel-tumbler", name: "Insulated Travel Tumbler", category: "Drinkware", price: 28, old_price: null, rating: 4.6, reviews: 178, badge: null,
    description: "A leak-proof vacuum tumbler that holds heat for hours and fits under most café spouts. Your daily brew, on the move.", featured: 0 },

  // ---------- Gifts & Accessories ----------
  { id: "coffee-gift-box", name: "Roaster's Gift Box", category: "Gifts & Accessories", price: 45, old_price: null, rating: 4.9, reviews: 96, badge: "New",
    description: "Three of our most-loved coffees boxed with brewing notes — the perfect introduction to small-batch roasting for someone you like.", featured: 1 },
  { id: "reusable-filter", name: "Reusable Steel Filter", category: "Gifts & Accessories", price: 19, old_price: null, rating: 4.5, reviews: 87, badge: null,
    description: "A fine laser-etched stainless filter that ends paper waste and lets more of the coffee's natural oils into the cup.", featured: 0 },
  { id: "coffee-scale", name: "Digital Coffee Scale", category: "Gifts & Accessories", price: 42, old_price: null, rating: 4.7, reviews: 132, badge: null,
    description: "A slim, water-resistant scale with a built-in timer, accurate to 0.1g — the quiet secret behind a repeatable, great brew.", featured: 0 },
];

const USERS = [
  { name: "Brume Admin", email: "admin@brume.com", password: "admin123", is_admin: 1 },
  { name: "Demo Customer", email: "demo@brume.com", password: "demo123", is_admin: 0 },
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
          image: IMG(p.id),
          gallery: JSON.stringify([IMG(p.id)]),
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
    console.log(`Seeded ${USERS.length} demo users (admin@brume.com / admin123, demo@brume.com / demo123).`);
  }
}

module.exports = seed;

// Allow running directly:  node seed.js
if (require.main === module) seed();
