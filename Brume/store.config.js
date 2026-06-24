/* ===========================================================
   Store configuration
   A single place for store-specific settings so the backend
   stays generic and easy to understand.
   =========================================================== */
module.exports = {
  name: "Brume",
  tagline: "Small-batch coffee, roasted with care",
  currency: "$",
  orderPrefix: "BR",          // shows up on order numbers, e.g. #BR-100231
  port: process.env.PORT || 4005,
  jwtSecret: process.env.JWT_SECRET || "brume-roasters-secret-change-me",
  freeShippingOver: 50,
  flatShipping: 6,
  taxRate: 0.08,
};
