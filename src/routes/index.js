const express = require('express');
const hubspotRoutes = require('./hubspot.routes');
const backendRoutes = require('./backend.routes');
const productRoutes = require('./product.routes');
const contactRoutes = require('./contact.routes');
const docsRoutes = require('./docs.routes');
const { globalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Aplicar rate limiter global
router.use(globalLimiter);

// Rotas HubSpot
router.use('/hubspot', hubspotRoutes);

// Rotas Backend
router.use('/backend', backendRoutes);

// Rotas de Produtos
router.use('/products', productRoutes);

// Rotas de Contatos
router.use('/contacts', contactRoutes);

// Rotas de Documentação
router.use('/docs', docsRoutes);

module.exports = router;
