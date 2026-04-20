const express = require('express');
const { orderProxy } = require('../proxies/order.proxy');
const { authMiddleware } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.post('/', orderProxy.createOrder);
router.get('/', orderProxy.getOrders);

module.exports = router;
