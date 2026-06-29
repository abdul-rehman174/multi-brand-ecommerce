/* ===========================================================
   Store configuration
   A single place for store-specific settings so the backend
   stays generic and easy to understand.
   =========================================================== */
module.exports = {
  name: "Terrabloom",
  tagline: "Bring the outside in",
  currency: "$",
  orderPrefix: "TB",          // shows up on order numbers, e.g. #TB-100231
  port: process.env.PORT || 4004,
  jwtSecret: process.env.JWT_SECRET || "terrabloom-garden-secret-change-me",
  freeShippingOver: 75,
  flatShipping: 7,
  taxRate: 0.08,
};
