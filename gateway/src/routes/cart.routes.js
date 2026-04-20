const express = require('express');
const { cartProxy } = require('../proxies/cart.proxy');
const { authMiddleware } = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/', cartProxy.getCart);
router.post('/items', cartProxy.addItem);
router.delete('/items/:itemId', cartProxy.removeItem);

module.exports = router;
