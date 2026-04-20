const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  const status = err.response?.status || 500;
  const message = err.response?.data || err.message || 'Internal Server Error';

  sendError(res, status, message);
};

module.exports = { errorHandler };
