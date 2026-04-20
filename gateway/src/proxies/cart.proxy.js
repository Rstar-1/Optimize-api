const axios = require('axios');
const services = require('../config/services.config');

const cartUrl = services.cart;

const cartProxy = {
  getCart: async (req, res, next) => {
    try {
      const response = await axios.get(`${cartUrl}/cart`, { headers: { authorization: req.headers.authorization } });
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },
  addItem: async (req, res, next) => {
    try {
      const response = await axios.post(`${cartUrl}/cart/items`, req.body, { headers: { authorization: req.headers.authorization } });
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },
  removeItem: async (req, res, next) => {
    try {
      const response = await axios.delete(`${cartUrl}/cart/items/${req.params.itemId}`, { headers: { authorization: req.headers.authorization } });
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = { cartProxy };
