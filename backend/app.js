const express = require('express');
const path = require('node:path');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./docs/swagger');
const env = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(path.dirname(require.resolve('./app')), 'uploads')));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'dg-ecommerce-api', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'D&G E-Commerce API Docs',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

app.use(errorHandler);

module.exports = app;
