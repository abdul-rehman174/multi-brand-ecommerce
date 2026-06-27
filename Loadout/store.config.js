/* ===========================================================
   Store configuration
   A single place for store-specific settings so the backend
   stays generic and easy to understand.
   =========================================================== */
module.exports = {
  name: "Loadout",
  tagline: "Gear up. Game on.",
  currency: "$",
  orderPrefix: "LO",          // shows up on order numbers, e.g. #LO-100231
  port: process.env.PORT || 4003,
  jwtSecret: process.env.JWT_SECRET || "loadout-neon-grid-secret-change-me",
  freeShippingOver: 150,
  flatShipping: 9,
  taxRate: 0.08,
};
