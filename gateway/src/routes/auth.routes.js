const express = require('express');
const { authProxy } = require('../proxies/auth.proxy');
const router = express.Router();

router.post('/login', authProxy.login);
router.post('/register', authProxy.register);

module.exports = router;
