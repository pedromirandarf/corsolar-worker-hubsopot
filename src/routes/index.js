const express = require('express');
const hubspotRoutes = require('./hubspot.routes');
const backendRoutes = require('./backend.routes');
const { globalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Aplicar rate limiter global
router.use(globalLimiter);

// Rotas HubSpot
router.use('/hubspot', hubspotRoutes);

// Rotas Backend
router.use('/backend', backendRoutes);

module.exports = router;
