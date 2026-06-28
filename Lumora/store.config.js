/* ===========================================================
   Store configuration
   A single place for store-specific settings so the backend
   stays generic and easy to understand.
   =========================================================== */
module.exports = {
  name: "Lumora",
  tagline: "Modern essentials, beautifully made",
  currency: "$",
  orderPrefix: "LM",          // shows up on order numbers, e.g. #LM-100231
  port: process.env.PORT || 4001,
  jwtSecret: process.env.JWT_SECRET || "lumora-dev-secret-change-me",
  freeShippingOver: 150,
  flatShipping: 9,
  taxRate: 0.08,
};
