const axios = require('axios');
const services = require('../config/services.config');

const orderUrl = services.order;

const orderProxy = {
  createOrder: async (req, res, next) => {
    try {
      const response = await axios.post(`${orderUrl}/orders`, req.body, { headers: { authorization: req.headers.authorization } });
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },
  getOrders: async (req, res, next) => {
    try {
      const response = await axios.get(`${orderUrl}/orders`, { headers: { authorization: req.headers.authorization } });
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = { orderProxy };
