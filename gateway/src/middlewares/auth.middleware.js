const { sendError } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return sendError(res, 401, 'Authorization header missing');
  }

  // Placeholder for actual token validation logic.
  req.user = { token: authHeader };
  next();
};

module.exports = { authMiddleware };
