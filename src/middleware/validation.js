const { validationResult } = require('express-validator');
const logger = require('../config/logger');

// Middleware para processar erros de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Erro de validação', {
      errors: errors.array(),
      path: req.path,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      error: 'Erro de validação',
      details: errors.array()
    });
  }

  next();
};

// Sanitização de entrada para prevenir XSS e SQL Injection
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove tags HTML
      return obj.replace(/<[^>]*>/g, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

module.exports = {
  validate,
  sanitizeInput
};
