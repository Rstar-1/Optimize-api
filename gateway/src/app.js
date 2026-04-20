const express = require('express');
const cors = require('cors');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middlewares/error.middleware');
const { rateLimit } = require('./middlewares/rateLimit.middleware');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimit);

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.use(errorHandler);

module.exports = app;
