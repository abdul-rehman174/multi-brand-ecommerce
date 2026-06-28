/* ===========================================================
   Seed data
   Fills the database with realistic sample products and two demo
   accounts the first time the server runs (or when you run
   `npm run seed`). Safe to run repeatedly — it only seeds when a
   table is empty.
   =========================================================== */
const bcrypt = require("bcryptjs");
const db = require("./db");

const IMG = (id) => `assets/img/${id}.jpg`;

const PRODUCTS = [
  { id: "aurora-headphones", name: "Aurora Wireless Headphones", category: "Audio", price: 149, old_price: 199, rating: 4.8, reviews: 214, badge: "Sale", image: IMG("1505740420928-5e560c06d30e"), gallery: [IMG("1505740420928-5e560c06d30e"), IMG("1484704849700-f032a568e944"), IMG("1583394838336-acd977736f90")], description: "Immersive 40mm drivers, active noise cancellation and a 36-hour battery. Plush memory-foam ear cushions keep things comfortable from your morning commute to late-night sessions.", featured: 1 },
  { id: "pulse-earbuds", name: "Pulse Pro Earbuds", category: "Audio", price: 99, old_price: 129, rating: 4.6, reviews: 176, badge: "Sale", image: IMG("1590658268037-6bf12165a8df"), gallery: [IMG("1590658268037-6bf12165a8df"), IMG("1606220588913-b3aacb4d2f46"), IMG("1606841837239-c5a1a4a07af7")], description: "True-wireless earbuds with adaptive noise cancelling and a feather-light fit. Pop them in for crystal-clear calls and 28 hours of total playback with the case.", featured: 1 },
  { id: "vibe-speaker", name: "Vibe Portable Speaker", category: "Audio", price: 69, old_price: null, rating: 4.4, reviews: 128, badge: "New", image: IMG("1608043152269-423dbba4e7e1"), gallery: [IMG("1608043152269-423dbba4e7e1"), IMG("1589003077984-894e133dabab"), IMG("1545454675-3531b543be5d")], description: "Room-filling 360° sound in a pocket-sized body. IPX7 waterproof, 12-hour battery and pair two for true stereo.", featured: 1 },
  { id: "groove-turntable", name: "Groove Vinyl Turntable", category: "Audio", price: 199, old_price: 249, rating: 4.7, reviews: 86, badge: "Sale", image: IMG("1542728928-1413d1894ed1"), gallery: [IMG("1542728928-1413d1894ed1"), IMG("1545454675-3531b543be5d")], description: "Belt-driven turntable with a built-in preamp and Bluetooth out. Warm analog sound that pairs beautifully with any shelf or setup.", featured: 1 },
  { id: "aura-watch", name: "Aura Smart Watch", category: "Wearables", price: 229, old_price: null, rating: 4.7, reviews: 158, badge: "New", image: IMG("1523275335684-37898b6baf30"), gallery: [IMG("1523275335684-37898b6baf30"), IMG("1434493789847-2f02dc6ca35d"), IMG("1579586337278-3befd40fd17a")], description: "Track workouts, heart rate and sleep on a bright AMOLED display. Water-resistant to 50m with a sleek aluminium frame and swappable straps.", featured: 1 },
  { id: "classic-watch", name: "Heritage Classic Watch", category: "Wearables", price: 179, old_price: 219, rating: 4.5, reviews: 103, badge: "Sale", image: IMG("1524805444758-089113d48a6d"), gallery: [IMG("1524805444758-089113d48a6d"), IMG("1434056886845-dac89ffe9b56"), IMG("1547996160-81dfa63595aa")], description: "A timeless analog watch with a sapphire crystal face and genuine leather strap. Quietly refined for the office or the weekend.", featured: 1 },
  { id: "stride-band", name: "Stride Fitness Band", category: "Wearables", price: 59, old_price: null, rating: 4.3, reviews: 211, badge: null, image: IMG("1576243345690-4e4b79b63288"), gallery: [IMG("1576243345690-4e4b79b63288"), IMG("1523275335684-37898b6baf30")], description: "A slim activity band that counts steps, tracks sleep and lasts two weeks on a charge. Your daily nudge toward moving a little more.", featured: 1 },
  { id: "loft-sneakers", name: "Loft Everyday Sneakers", category: "Footwear", price: 89, old_price: 110, rating: 4.6, reviews: 92, badge: "Sale", image: IMG("1542291026-7eec264c27ff"), gallery: [IMG("1542291026-7eec264c27ff"), IMG("1460353581641-37baddab0fa2"), IMG("1525966222134-fcfa99b8ae77")], description: "Lightweight knit upper with a cushioned foam sole for all-day comfort. A minimal silhouette that pairs with absolutely everything.", featured: 1 },
  { id: "trail-runners", name: "Trail Runner Pro", category: "Footwear", price: 119, old_price: null, rating: 4.7, reviews: 140, badge: "New", image: IMG("1600185365926-3a2ce3cdb9eb"), gallery: [IMG("1600185365926-3a2ce3cdb9eb"), IMG("1595950653106-6c9ebd614d3a"), IMG("1549298916-b41d501d3772")], description: "Grippy outsole and responsive cushioning built for the road and the trail. Breathable mesh keeps your stride cool mile after mile.", featured: 0 },
  { id: "metro-sneakers", name: "Metro Low-Top Sneakers", category: "Footwear", price: 79, old_price: 99, rating: 4.4, reviews: 67, badge: "Sale", image: IMG("1595950653106-6c9ebd614d3a"), gallery: [IMG("1595950653106-6c9ebd614d3a"), IMG("1525966222134-fcfa99b8ae77"), IMG("1549298916-b41d501d3772")], description: "Clean, low-profile sneakers in a durable canvas weave. The kind of everyday pair that just works, season after season.", featured: 0 },
  { id: "terra-backpack", name: "Terra Daypack 20L", category: "Bags", price: 79, old_price: null, rating: 4.9, reviews: 301, badge: null, image: IMG("1553062407-98eeb64c6a62"), gallery: [IMG("1553062407-98eeb64c6a62"), IMG("1622560480605-d83c853bc5c3"), IMG("1581605405669-fcdf81165afa")], description: "Water-repellent recycled shell, padded 15\" laptop sleeve and a clever fold-flat design. Built for the daily carry and the weekend escape.", featured: 0 },
  { id: "urban-tote", name: "Urban Canvas Tote", category: "Bags", price: 49, old_price: 65, rating: 4.5, reviews: 118, badge: "Sale", image: IMG("1548036328-c9fa89d128fa"), gallery: [IMG("1548036328-c9fa89d128fa"), IMG("1584917865442-de89df76afd3"), IMG("1590874103328-eac38a683ce7")], description: "A roomy everyday tote in heavyweight canvas with a leather-trimmed handle. Holds your laptop, lunch and a little bit of everything else.", featured: 0 },
  { id: "heritage-satchel", name: "Heritage Leather Satchel", category: "Bags", price: 159, old_price: null, rating: 4.8, reviews: 94, badge: "New", image: IMG("1590874103328-eac38a683ce7"), gallery: [IMG("1590874103328-eac38a683ce7"), IMG("1584917865442-de89df76afd3"), IMG("1548036328-c9fa89d128fa")], description: "Full-grain leather that only looks better with age. A structured satchel with brass hardware and a padded compartment for your essentials.", featured: 0 },
  { id: "lumen-lamp", name: "Lumen Desk Lamp", category: "Home", price: 59, old_price: 75, rating: 4.5, reviews: 64, badge: "Sale", image: IMG("1507473885765-e6ed057f782c"), gallery: [IMG("1507473885765-e6ed057f782c"), IMG("1513506003901-1e6a229e2d15"), IMG("1485955900006-10f4d324d411")], description: "Stepless dimming, three colour temperatures and a USB-C charging port in the base. Matte finish that looks at home on any desk.", featured: 0 },
  { id: "brew-bottle", name: "Brew Insulated Bottle", category: "Home", price: 34, old_price: null, rating: 4.8, reviews: 189, badge: null, image: IMG("1602143407151-7111542de6e8"), gallery: [IMG("1602143407151-7111542de6e8"), IMG("1523362628745-0c100150b504"), IMG("1610824352934-c10d87b700cc")], description: "Double-wall vacuum insulation keeps drinks cold for 24h or hot for 12h. Leak-proof lid and a powder-coated grip.", featured: 0 },
  { id: "ceramic-mug", name: "Artisan Ceramic Mug", category: "Home", price: 24, old_price: 32, rating: 4.6, reviews: 142, badge: "Sale", image: IMG("1514228742587-6b1558fcca3d"), gallery: [IMG("1514228742587-6b1558fcca3d"), IMG("1485955900006-10f4d324d411")], description: "Hand-glazed stoneware mug with a comfortable thumb rest. Microwave and dishwasher safe — your new favourite morning ritual.", featured: 0 },
  { id: "verdant-planter", name: "Verdant Ceramic Planter", category: "Home", price: 39, old_price: null, rating: 4.7, reviews: 88, badge: "New", image: IMG("1485955900006-10f4d324d411"), gallery: [IMG("1485955900006-10f4d324d411"), IMG("1514228742587-6b1558fcca3d")], description: "A minimalist matte planter with a hidden drainage tray. Brings a little calm and a lot of green to any corner of your space.", featured: 0 },
  { id: "frame-sunglasses", name: "Frame Polarized Sunglasses", category: "Accessories", price: 45, old_price: 60, rating: 4.3, reviews: 77, badge: "Sale", image: IMG("1511499767150-a48a237f0083"), gallery: [IMG("1511499767150-a48a237f0083"), IMG("1572635196237-14b3f281503f"), IMG("1473496169904-658ba7c44d8a")], description: "UV400 polarized lenses cut glare while a lightweight acetate frame keeps them feather-light. Comes with a hardshell case.", featured: 0 },
  { id: "fold-wallet", name: "Fold Slim Leather Wallet", category: "Accessories", price: 39, old_price: null, rating: 4.6, reviews: 156, badge: null, image: IMG("1627123424574-724758594e93"), gallery: [IMG("1627123424574-724758594e93"), IMG("1556905055-8f358a7a47b2")], description: "A slim bifold in full-grain leather with RFID-blocking card slots. Slips into any pocket without the bulk.", featured: 0 },
  { id: "aero-keyboard", name: "Aero Mechanical Keyboard", category: "Tech", price: 109, old_price: 139, rating: 4.8, reviews: 203, badge: "Sale", image: IMG("1587829741301-dc798b83add3"), gallery: [IMG("1587829741301-dc798b83add3"), IMG("1527814050087-3793815479db")], description: "Hot-swappable switches, per-key RGB and a satisfying tactile thock. A compact 75% layout that frees up desk space for the mouse.", featured: 0 },
  { id: "glide-mouse", name: "Glide Wireless Mouse", category: "Tech", price: 59, old_price: null, rating: 4.5, reviews: 134, badge: "New", image: IMG("1527814050087-3793815479db"), gallery: [IMG("1527814050087-3793815479db"), IMG("1587829741301-dc798b83add3")], description: "A precise 26K-dpi sensor, silent clicks and a sculpted shape that disappears in the hand. Charges over USB-C in minutes.", featured: 0 },
  { id: "lens-camera", name: "Lens Mirrorless Camera", category: "Tech", price: 749, old_price: 899, rating: 4.9, reviews: 71, badge: "Sale", image: IMG("1502920917128-1aa500764cbd"), gallery: [IMG("1502920917128-1aa500764cbd")], description: "A 24MP mirrorless body with fast hybrid autofocus and 4K video. Light enough to travel with, capable enough to shoot anything.", featured: 0 },
  { id: "studio-laptop", name: "Studio Ultrabook 14\"", category: "Tech", price: 1199, old_price: null, rating: 4.7, reviews: 58, badge: "New", image: IMG("1496181133206-80ce9b88a853"), gallery: [IMG("1496181133206-80ce9b88a853")], description: "A featherweight 14\" ultrabook with an all-day battery and a stunning display. Powerful enough for class, light enough for your bag.", featured: 0 },
  { id: "skyline-drone", name: "Skyline 4K Drone", category: "Tech", price: 499, old_price: 579, rating: 4.6, reviews: 49, badge: "Sale", image: IMG("1473968512647-3e447244af8f"), gallery: [IMG("1473968512647-3e447244af8f")], description: "A foldable drone with a 4K gimbal camera, 30-minute flight time and smart return-to-home. Capture the view from a whole new angle.", featured: 0 },
];

const USERS = [
  { name: "Lumora Admin", email: "admin@lumora.com", password: "admin123", is_admin: 1 },
  { name: "Demo Customer", email: "demo@lumora.com", password: "demo123", is_admin: 0 },
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
    console.log(`Seeded ${USERS.length} demo users (admin@lumora.com / admin123, demo@lumora.com / demo123).`);
  }
}

module.exports = seed;

// Allow running directly:  node seed.js
if (require.main === module) seed();
