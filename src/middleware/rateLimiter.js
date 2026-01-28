const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../config/logger');

// Rate limiter global
const globalLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    success: false,
    error: 'Muitas requisições deste IP, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit excedido', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      success: false,
      error: 'Muitas requisições deste IP, tente novamente mais tarde.'
    });
  }
});

// Rate limiter para webhooks (mais permissivo)
const webhookLimiter = rateLimit({
  windowMs: 60000, // 1 minuto
  max: 50,
  message: {
    success: false,
    error: 'Limite de webhooks excedido'
  }
});

// Rate limiter para autenticação (mais restritivo)
const authLimiter = rateLimit({
  windowMs: 900000, // 15 minutos
  max: 5,
  message: {
    success: false,
    error: 'Muitas tentativas de autenticação, tente novamente mais tarde.'
  },
  skipSuccessfulRequests: true
});

module.exports = {
  globalLimiter,
  webhookLimiter,
  authLimiter
};
