const express = require('express');
const { productProxy } = require('../proxies/product.proxy');
const router = express.Router();

router.get('/', productProxy.listProducts);
router.get('/:id', productProxy.getProduct);

module.exports = router;
