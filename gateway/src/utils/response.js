const sendSuccess = (res, data = {}, status = 200) => {
  res.status(status).json({ success: true, data });
};

const sendError = (res, status = 500, message = 'An error occurred') => {
  res.status(status).json({ success: false, message });
};

module.exports = { sendSuccess, sendError };
