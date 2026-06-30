/* ===========================================================
   Store configuration
   A single place for store-specific settings so the backend
   stays generic and easy to understand.
   =========================================================== */
module.exports = {
  name: "Veloura",
  tagline: "Timeless pieces, considered design",
  currency: "$",
  orderPrefix: "VL",          // shows up on order numbers, e.g. #VL-100231
  port: process.env.PORT || 4005,
  jwtSecret: process.env.JWT_SECRET || "veloura-atelier-secret-change-me",
  freeShippingOver: 150,
  flatShipping: 9,
  taxRate: 0.08,
};
