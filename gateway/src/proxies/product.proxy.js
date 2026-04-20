const axios = require('axios');
const services = require('../config/services.config');

const productUrl = services.product;

const productProxy = {
  listProducts: async (req, res, next) => {
    try {
      const response = await axios.get(`${productUrl}/products`, { params: req.query });
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },
  getProduct: async (req, res, next) => {
    try {
      const response = await axios.get(`${productUrl}/products/${req.params.id}`);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = { productProxy };
