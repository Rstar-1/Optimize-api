const axios = require('axios');
const services = require('../config/services.config');

const authUrl = services.auth;

const authProxy = {
  login: async (req, res, next) => {
    try {
      const response = await axios.post(`${authUrl}/login`, req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  },
  register: async (req, res, next) => {
    try {
      const response = await axios.post(`${authUrl}/register`, req.body);
      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = { authProxy };
