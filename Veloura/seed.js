/* ===========================================================
   Seed data
   Fills the database with realistic sample products and two demo
   accounts the first time the server runs (or when you run
   `npm run seed`). Safe to run repeatedly — it only seeds when a
   table is empty.
   =========================================================== */
const bcrypt = require("bcryptjs");
const db = require("./db");

// Boutique product photography is served by picsum.photos using a stable
// per-product seed, so every product reliably resolves to a real image.
const IMG = (slug) => `assets/img/${slug}.jpg`;

const PRODUCTS = [
  // ---------- Dresses ----------
  { id: "silk-slip-dress", name: "Silk Slip Dress", category: "Dresses", price: 245, old_price: null, rating: 4.8, reviews: 142, badge: "New",
    image: IMG("silk-slip-dress"), gallery: [IMG("silk-slip-dress"), IMG("silk-slip-dress-2"), IMG("silk-slip-dress-3")],
    description: "A bias-cut slip in fluid sandwashed silk with delicate adjustable straps. Effortless on its own, layered beautifully under tailoring.", featured: 1 },
  { id: "pleated-midi-skirt", name: "Pleated Midi Skirt", category: "Dresses", price: 165, old_price: 210, rating: 4.6, reviews: 98, badge: "Sale",
    image: IMG("pleated-midi-skirt"), gallery: [IMG("pleated-midi-skirt"), IMG("pleated-midi-skirt-2"), IMG("pleated-midi-skirt-3")],
    description: "Knife-pleated midi skirt in a softly draping crepe that moves with you. A versatile piece that pairs as easily with knits as with heels.", featured: 1 },
  { id: "linen-wrap-dress", name: "Linen Wrap Dress", category: "Dresses", price: 189, old_price: null, rating: 4.7, reviews: 76, badge: null,
    image: IMG("linen-wrap-dress"), gallery: [IMG("linen-wrap-dress"), IMG("linen-wrap-dress-2"), IMG("linen-wrap-dress-3")],
    description: "A breezy wrap silhouette cut from washed European linen. The adjustable tie waist flatters every shape through the warmer months.", featured: 0 },
  { id: "cashmere-crew-knit", name: "Cashmere Crew Knit", category: "Dresses", price: 295, old_price: null, rating: 4.9, reviews: 203, badge: "New",
    image: IMG("cashmere-crew-knit"), gallery: [IMG("cashmere-crew-knit"), IMG("cashmere-crew-knit-2"), IMG("cashmere-crew-knit-3")],
    description: "An impossibly soft crewneck knitted from grade-A Mongolian cashmere. A quiet luxury staple that only gets better with the years.", featured: 1 },

  // ---------- Outerwear ----------
  { id: "tailored-wool-coat", name: "Tailored Wool Coat", category: "Outerwear", price: 690, old_price: 790, rating: 4.9, reviews: 88, badge: "Sale",
    image: IMG("tailored-wool-coat"), gallery: [IMG("tailored-wool-coat"), IMG("tailored-wool-coat-2"), IMG("tailored-wool-coat-3")],
    description: "A double-faced wool coat with clean notch lapels and a considered drop-shoulder line. Investment outerwear, made to last a lifetime.", featured: 1 },
  { id: "linen-blazer", name: "Linen Blazer", category: "Outerwear", price: 320, old_price: null, rating: 4.6, reviews: 64, badge: "New",
    image: IMG("linen-blazer"), gallery: [IMG("linen-blazer"), IMG("linen-blazer-2"), IMG("linen-blazer-3")],
    description: "An unstructured single-breasted blazer in airy Italian linen. Tailored enough for the office, relaxed enough for the weekend.", featured: 1 },
  { id: "belted-trench-coat", name: "Belted Trench Coat", category: "Outerwear", price: 545, old_price: null, rating: 4.8, reviews: 117, badge: null,
    image: IMG("belted-trench-coat"), gallery: [IMG("belted-trench-coat"), IMG("belted-trench-coat-2"), IMG("belted-trench-coat-3")],
    description: "The enduring trench, reimagined in a water-resistant cotton gabardine with a softly tied waist. A timeless layer for unpredictable skies.", featured: 0 },
  { id: "quilted-liner-jacket", name: "Quilted Liner Jacket", category: "Outerwear", price: 235, old_price: 290, rating: 4.5, reviews: 52, badge: "Sale",
    image: IMG("quilted-liner-jacket"), gallery: [IMG("quilted-liner-jacket"), IMG("quilted-liner-jacket-2"), IMG("quilted-liner-jacket-3")],
    description: "A lightweight diamond-quilted jacket that slips effortlessly under a coat or stands alone in transitional weather. Quietly versatile.", featured: 0 },

  // ---------- Footwear ----------
  { id: "leather-ankle-boot", name: "Leather Ankle Boot", category: "Footwear", price: 320, old_price: null, rating: 4.7, reviews: 159, badge: "New",
    image: IMG("leather-ankle-boot"), gallery: [IMG("leather-ankle-boot"), IMG("leather-ankle-boot-2"), IMG("leather-ankle-boot-3")],
    description: "A sleek ankle boot in supple Italian calf leather on a stacked block heel. The kind of grown-up boot you reach for every single day.", featured: 1 },
  { id: "suede-loafer", name: "Suede Loafer", category: "Footwear", price: 240, old_price: 295, rating: 4.6, reviews: 84, badge: "Sale",
    image: IMG("suede-loafer"), gallery: [IMG("suede-loafer"), IMG("suede-loafer-2"), IMG("suede-loafer-3")],
    description: "A refined penny loafer hand-finished in butter-soft suede. Goldtone hardware and a low heel make it endlessly easy to wear.", featured: 0 },
  { id: "strappy-heeled-sandal", name: "Strappy Heeled Sandal", category: "Footwear", price: 275, old_price: null, rating: 4.5, reviews: 61, badge: null,
    image: IMG("strappy-heeled-sandal"), gallery: [IMG("strappy-heeled-sandal"), IMG("strappy-heeled-sandal-2"), IMG("strappy-heeled-sandal-3")],
    description: "Delicate leather straps on a slender sculptural heel. The finishing note to an evening look, balanced enough to wear all night.", featured: 0 },
  { id: "minimal-leather-sneaker", name: "Minimal Leather Sneaker", category: "Footwear", price: 195, old_price: null, rating: 4.7, reviews: 188, badge: null,
    image: IMG("minimal-leather-sneaker"), gallery: [IMG("minimal-leather-sneaker"), IMG("minimal-leather-sneaker-2"), IMG("minimal-leather-sneaker-3")],
    description: "A pared-back low-top in full-grain leather with a tonal sole. Understated polish that dresses up denim and tailoring alike.", featured: 1 },

  // ---------- Bags ----------
  { id: "structured-tote-bag", name: "Structured Tote Bag", category: "Bags", price: 420, old_price: null, rating: 4.8, reviews: 134, badge: "New",
    image: IMG("structured-tote-bag"), gallery: [IMG("structured-tote-bag"), IMG("structured-tote-bag-2"), IMG("structured-tote-bag-3")],
    description: "An architectural tote in vegetable-tanned leather, roomy enough for the everyday carry yet sharp enough for the boardroom.", featured: 1 },
  { id: "quilted-shoulder-bag", name: "Quilted Shoulder Bag", category: "Bags", price: 365, old_price: 430, rating: 4.7, reviews: 92, badge: "Sale",
    image: IMG("quilted-shoulder-bag"), gallery: [IMG("quilted-shoulder-bag"), IMG("quilted-shoulder-bag-2"), IMG("quilted-shoulder-bag-3")],
    description: "A diamond-quilted shoulder bag with a slim chain strap and signature turn-lock. Compact, elegant and quietly iconic.", featured: 0 },
  { id: "soft-leather-clutch", name: "Soft Leather Clutch", category: "Bags", price: 185, old_price: null, rating: 4.5, reviews: 47, badge: null,
    image: IMG("soft-leather-clutch"), gallery: [IMG("soft-leather-clutch"), IMG("soft-leather-clutch-2"), IMG("soft-leather-clutch-3")],
    description: "A slouchy fold-over clutch in pebbled nappa leather. The polished punctuation mark for evenings out and occasions in.", featured: 0 },

  // ---------- Accessories ----------
  { id: "silk-twill-scarf", name: "Silk Twill Scarf", category: "Accessories", price: 95, old_price: null, rating: 4.6, reviews: 73, badge: null,
    image: IMG("silk-twill-scarf"), gallery: [IMG("silk-twill-scarf"), IMG("silk-twill-scarf-2"), IMG("silk-twill-scarf-3")],
    description: "A hand-rolled square of pure silk twill in a painterly seasonal print. Knotted at the neck or tied to a bag, it elevates everything.", featured: 1 },
  { id: "leather-belt", name: "Italian Leather Belt", category: "Accessories", price: 110, old_price: 140, rating: 4.7, reviews: 119, badge: "Sale",
    image: IMG("leather-belt"), gallery: [IMG("leather-belt"), IMG("leather-belt-2"), IMG("leather-belt-3")],
    description: "A slim full-grain leather belt with a brushed gold buckle. The understated detail that pulls a whole look together.", featured: 0 },
  { id: "oversized-sunglasses", name: "Oversized Acetate Sunglasses", category: "Accessories", price: 145, old_price: null, rating: 4.5, reviews: 88, badge: "New",
    image: IMG("oversized-sunglasses"), gallery: [IMG("oversized-sunglasses"), IMG("oversized-sunglasses-2"), IMG("oversized-sunglasses-3")],
    description: "Sculptural oversized frames hand-cut from tortoiseshell acetate, fitted with UV400 gradient lenses. Old-world glamour, modern protection.", featured: 0 },

  // ---------- Jewellery ----------
  { id: "gold-vermeil-hoops", name: "Gold Vermeil Hoop Earrings", category: "Jewellery", price: 85, old_price: null, rating: 4.8, reviews: 246, badge: "New",
    image: IMG("gold-vermeil-hoops"), gallery: [IMG("gold-vermeil-hoops"), IMG("gold-vermeil-hoops-2"), IMG("gold-vermeil-hoops-3")],
    description: "Everyday hoops in 18k gold vermeil over recycled sterling silver. Lightweight, lustrous and made to never leave your ears.", featured: 1 },
  { id: "pearl-pendant-necklace", name: "Pearl Pendant Necklace", category: "Jewellery", price: 130, old_price: 165, rating: 4.7, reviews: 102, badge: "Sale",
    image: IMG("pearl-pendant-necklace"), gallery: [IMG("pearl-pendant-necklace"), IMG("pearl-pendant-necklace-2"), IMG("pearl-pendant-necklace-3")],
    description: "A single freshwater baroque pearl suspended on a fine gold-fill chain. Quietly romantic, layered or worn alone.", featured: 0 },
  { id: "signet-ring", name: "Engraved Signet Ring", category: "Jewellery", price: 145, old_price: null, rating: 4.6, reviews: 58, badge: null,
    image: IMG("signet-ring"), gallery: [IMG("signet-ring"), IMG("signet-ring-2"), IMG("signet-ring-3")],
    description: "A weighty signet ring cast in recycled solid brass with a softly brushed face. A modern heirloom ready to be made your own.", featured: 0 },
];

const USERS = [
  { name: "Veloura Admin", email: "admin@veloura.com", password: "admin123", is_admin: 1 },
  { name: "Demo Customer", email: "demo@veloura.com", password: "demo123", is_admin: 0 },
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
    console.log(`Seeded ${USERS.length} demo users (admin@veloura.com / admin123, demo@veloura.com / demo123).`);
  }
}

module.exports = seed;

// Allow running directly:  node seed.js
if (require.main === module) seed();
