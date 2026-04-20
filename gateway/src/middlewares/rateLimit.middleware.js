const rateLimit = (req, res, next) => {
  // Stubbed rate limiting middleware. Replace with Redis or in-memory store for production.
  next();
};

module.exports = { rateLimit };
