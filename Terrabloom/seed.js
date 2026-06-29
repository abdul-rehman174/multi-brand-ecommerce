/* ===========================================================
   Seed data
   Fills the database with realistic sample products and two demo
   accounts the first time the server runs (or when you run
   `npm run seed`). Safe to run repeatedly — it only seeds when a
   table is empty.
   =========================================================== */
const bcrypt = require("bcryptjs");
const db = require("./db");

// Real photographs from picsum.photos, seeded so they stay stable per product.
const IMG = (id) => `assets/img/${id}.jpg`;

const PRODUCTS = [
  // ----- Indoor Plants -----
  { id: "monstera-deliciosa", name: "Monstera Deliciosa", category: "Indoor Plants", price: 49, old_price: 65, rating: 4.9, reviews: 312, badge: "Sale", image: IMG("monstera"), gallery: [IMG("monstera"), IMG("monstera-2"), IMG("monstera-3")], description: "The iconic Swiss cheese plant, loved for its dramatic split leaves. Easy-going and fast-growing, it brings a lush, jungle feel to any bright corner.", featured: 1 },
  { id: "snake-plant-laurentii", name: "Snake Plant Laurentii", category: "Indoor Plants", price: 32, old_price: null, rating: 4.8, reviews: 268, badge: null, image: IMG("snake"), gallery: [IMG("snake"), IMG("snake-2"), IMG("snake-3")], description: "Architectural, upright leaves edged in golden yellow. Nearly indestructible, air-purifying and happy in low light — the perfect first plant.", featured: 1 },
  { id: "fiddle-leaf-fig", name: "Fiddle Leaf Fig", category: "Indoor Plants", price: 89, old_price: 109, rating: 4.7, reviews: 184, badge: "Sale", image: IMG("fiddle"), gallery: [IMG("fiddle"), IMG("fiddle-2"), IMG("fiddle-3")], description: "A statement tree with large, violin-shaped leaves that turns any room into a stylish retreat. Loves bright, indirect light and a steady routine.", featured: 1 },
  { id: "pothos-golden", name: "Golden Pothos Trailing Vine", category: "Indoor Plants", price: 24, old_price: null, rating: 4.9, reviews: 401, badge: "New", image: IMG("pothos"), gallery: [IMG("pothos"), IMG("pothos-2")], description: "Heart-shaped leaves marbled with gold that cascade beautifully from a shelf. Forgiving and quick to grow, it thrives almost anywhere.", featured: 1 },
  { id: "zz-plant", name: "ZZ Plant", category: "Indoor Plants", price: 38, old_price: null, rating: 4.8, reviews: 156, badge: null, image: IMG("zz"), gallery: [IMG("zz"), IMG("zz-2")], description: "Glossy, deep-green foliage that shrugs off neglect, drought and dim corners. The ultimate low-maintenance green companion.", featured: 0 },
  { id: "peace-lily", name: "Peace Lily", category: "Indoor Plants", price: 29, old_price: 39, rating: 4.6, reviews: 142, badge: "Sale", image: IMG("peacelily"), gallery: [IMG("peacelily"), IMG("peacelily-2")], description: "Elegant white blooms above lush leaves, and a natural air-cleaner. It even tells you when it's thirsty with a gentle droop.", featured: 0 },

  // ----- Outdoor Plants -----
  { id: "lavender-hidcote", name: "Lavender Hidcote", category: "Outdoor Plants", price: 18, old_price: null, rating: 4.7, reviews: 219, badge: "New", image: IMG("lavender"), gallery: [IMG("lavender"), IMG("lavender-2")], description: "Fragrant deep-purple spikes that hum with bees all summer long. Drought-tolerant and evergreen, it edges paths and borders beautifully.", featured: 1 },
  { id: "japanese-maple", name: "Japanese Maple Acer", category: "Outdoor Plants", price: 119, old_price: 149, rating: 4.9, reviews: 97, badge: "Sale", image: IMG("maple"), gallery: [IMG("maple"), IMG("maple-2"), IMG("maple-3")], description: "A graceful ornamental tree with feathery leaves that blaze crimson in autumn. A living sculpture for patios, courtyards and small gardens.", featured: 1 },
  { id: "climbing-rose", name: "Climbing Rose 'Eden'", category: "Outdoor Plants", price: 34, old_price: null, rating: 4.6, reviews: 128, badge: null, image: IMG("rose"), gallery: [IMG("rose"), IMG("rose-2")], description: "Romantic, ruffled blooms in soft blush that climb walls, arches and trellises. Repeat-flowering from late spring through autumn.", featured: 0 },
  { id: "boxwood-topiary", name: "Boxwood Topiary Ball", category: "Outdoor Plants", price: 64, old_price: null, rating: 4.5, reviews: 73, badge: null, image: IMG("boxwood"), gallery: [IMG("boxwood"), IMG("boxwood-2")], description: "A neatly clipped evergreen sphere that brings structure and year-round greenery to doorways and borders. Slow-growing and easy to shape.", featured: 0 },

  // ----- Planters -----
  { id: "terracotta-pot-set", name: "Terracotta Pot Set (3)", category: "Planters", price: 28, old_price: 36, rating: 4.7, reviews: 204, badge: "Sale", image: IMG("terracotta"), gallery: [IMG("terracotta"), IMG("terracotta-2")], description: "A trio of classic hand-finished terracotta pots with drainage holes and matching saucers. Breathable clay keeps roots healthy and happy.", featured: 1 },
  { id: "self-watering-planter", name: "Self-Watering Planter", category: "Planters", price: 42, old_price: null, rating: 4.8, reviews: 167, badge: "New", image: IMG("selfwater"), gallery: [IMG("selfwater"), IMG("selfwater-2")], description: "A modern planter with a hidden reservoir that waters your plant for up to two weeks. Perfect for busy weeks and worry-free holidays.", featured: 1 },
  { id: "hanging-macrame-planter", name: "Hanging Macramé Planter", category: "Planters", price: 22, old_price: null, rating: 4.6, reviews: 189, badge: null, image: IMG("macrame"), gallery: [IMG("macrame"), IMG("macrame-2")], description: "Hand-knotted cotton macramé that cradles your pot and lifts trailing plants into the light. Bohemian charm for any sunny window.", featured: 0 },
  { id: "ceramic-glazed-pot", name: "Glazed Ceramic Pot", category: "Planters", price: 38, old_price: 48, rating: 4.7, reviews: 112, badge: "Sale", image: IMG("ceramicpot"), gallery: [IMG("ceramicpot"), IMG("ceramicpot-2")], description: "A tactile, reactive-glaze pot in calming sage tones with a drainage hole and cork base. A handsome home for your favourite houseplant.", featured: 0 },

  // ----- Seeds -----
  { id: "herb-seed-starter-kit", name: "Herb Seed Starter Kit", category: "Seeds", price: 16, old_price: null, rating: 4.8, reviews: 256, badge: "New", image: IMG("herbkit"), gallery: [IMG("herbkit"), IMG("herbkit-2")], description: "Everything to grow basil, parsley, coriander and thyme on your windowsill — seeds, biodegradable pots, soil discs and plant markers included.", featured: 1 },
  { id: "wildflower-seed-mix", name: "Wildflower Meadow Seed Mix", category: "Seeds", price: 9, old_price: null, rating: 4.7, reviews: 198, badge: null, image: IMG("wildflower"), gallery: [IMG("wildflower"), IMG("wildflower-2")], description: "A pollinator-friendly blend of native annuals and perennials that fills any sunny patch with colour. Just scatter, water and watch it bloom.", featured: 0 },
  { id: "heirloom-tomato-seeds", name: "Heirloom Tomato Seeds", category: "Seeds", price: 8, old_price: 11, rating: 4.6, reviews: 143, badge: "Sale", image: IMG("tomato"), gallery: [IMG("tomato"), IMG("tomato-2")], description: "Three classic heirloom varieties bursting with old-fashioned flavour. Open-pollinated and easy to save, for harvests you'll grow year after year.", featured: 0 },

  // ----- Tools -----
  { id: "brass-watering-can", name: "Brass Watering Can", category: "Tools", price: 54, old_price: null, rating: 4.9, reviews: 121, badge: "New", image: IMG("wateringcan"), gallery: [IMG("wateringcan"), IMG("wateringcan-2")], description: "A heirloom-quality watering can in warm brushed brass with a fine rose head for a gentle shower. As beautiful on the shelf as in the garden.", featured: 1 },
  { id: "pruning-shears", name: "Precision Pruning Shears", category: "Tools", price: 26, old_price: 34, rating: 4.8, reviews: 187, badge: "Sale", image: IMG("shears"), gallery: [IMG("shears"), IMG("shears-2")], description: "Razor-sharp Japanese steel blades with a soft-grip handle and sap groove. Clean, effortless cuts that keep your plants healthy and tidy.", featured: 0 },
  { id: "garden-tool-trio", name: "Hand Tool Trio", category: "Tools", price: 31, old_price: null, rating: 4.6, reviews: 94, badge: null, image: IMG("toolset"), gallery: [IMG("toolset"), IMG("toolset-2")], description: "A trowel, transplanter and cultivator forged from rust-resistant stainless steel with ash-wood handles. The everyday set for potting and planting.", featured: 0 },

  // ----- Plant Care -----
  { id: "organic-potting-mix", name: "Organic Potting Mix 10L", category: "Plant Care", price: 14, old_price: null, rating: 4.8, reviews: 231, badge: null, image: IMG("pottingmix"), gallery: [IMG("pottingmix"), IMG("pottingmix-2")], description: "A rich, peat-free blend of composted bark, coir and worm castings for strong roots and lush growth. Light, free-draining and ready to use.", featured: 1 },
  { id: "liquid-plant-food", name: "Liquid Plant Food", category: "Plant Care", price: 12, old_price: 16, rating: 4.7, reviews: 176, badge: "Sale", image: IMG("plantfood"), gallery: [IMG("plantfood"), IMG("plantfood-2")], description: "A balanced, seaweed-based feed that greens up leaves and encourages healthy roots. A few drops in your watering can is all it takes.", featured: 0 },
];

const USERS = [
  { name: "Terrabloom Admin", email: "admin@terrabloom.com", password: "admin123", is_admin: 1 },
  { name: "Demo Gardener", email: "demo@terrabloom.com", password: "demo123", is_admin: 0 },
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
    console.log(`Seeded ${USERS.length} demo users (admin@terrabloom.com / admin123, demo@terrabloom.com / demo123).`);
  }
}

module.exports = seed;

// Allow running directly:  node seed.js
if (require.main === module) seed();
