/* ===========================================================
   Store configuration
   A single place for store-specific settings so the backend
   stays generic and easy to understand.
   =========================================================== */
module.exports = {
  name: "Aura",
  tagline: "Considered objects for everyday life",
  currency: "$",
  orderPrefix: "AU",          // shows up on order numbers, e.g. #AU-100231
  port: process.env.PORT || 4002,
  jwtSecret: process.env.JWT_SECRET || "aura-dev-secret-change-me",
  freeShippingOver: 200,
  flatShipping: 12,
  taxRate: 0.08,
};
