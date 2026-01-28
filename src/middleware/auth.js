const config = require('../config');
const logger = require('../config/logger');
const crypto = require('crypto');

// Middleware de autenticação via API Key
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    logger.warn('Tentativa de acesso sem API Key', {
      ip: req.ip,
      path: req.path
    });
    return res.status(401).json({
      success: false,
      error: 'API Key não fornecida'
    });
  }

  if (apiKey !== config.security.apiKey) {
    logger.warn('API Key inválida', {
      ip: req.ip,
      path: req.path
    });
    return res.status(403).json({
      success: false,
      error: 'API Key inválida'
    });
  }

  logger.info('Autenticação API Key bem-sucedida', {
    ip: req.ip,
    path: req.path
  });

  next();
};

// Validação de assinatura de webhook HubSpot
const validateHubSpotSignature = (req, res, next) => {
  const signature = req.header('X-HubSpot-Signature');
  const signatureVersion = req.header('X-HubSpot-Signature-Version');

  if (!signature) {
    logger.warn('Webhook sem assinatura HubSpot', {
      ip: req.ip,
      path: req.path
    });
    return res.status(401).json({
      success: false,
      error: 'Assinatura HubSpot não fornecida'
    });
  }

  try {
    // HubSpot usa SHA-256 para assinar webhooks
    const expectedSignature = crypto
      .createHmac('sha256', config.hubspot.webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn('Assinatura HubSpot inválida', {
        ip: req.ip,
        path: req.path
      });
      return res.status(403).json({
        success: false,
        error: 'Assinatura HubSpot inválida'
      });
    }

    logger.info('Assinatura HubSpot validada', {
      ip: req.ip,
      path: req.path
    });

    next();
  } catch (error) {
    logger.error('Erro ao validar assinatura HubSpot', {
      error: error.message,
      ip: req.ip
    });
    return res.status(500).json({
      success: false,
      error: 'Erro ao validar assinatura'
    });
  }
};

// Validação de IP whitelist
const ipWhitelist = (req, res, next) => {
  const allowedIps = config.security.allowedIps;

  // Se não houver IPs configurados, permite tudo
  if (!allowedIps || allowedIps.length === 0) {
    return next();
  }

  const clientIp = req.ip || req.connection.remoteAddress;

  if (!allowedIps.includes(clientIp)) {
    logger.warn('IP não autorizado tentou acessar', {
      ip: clientIp,
      path: req.path
    });
    return res.status(403).json({
      success: false,
      error: 'IP não autorizado'
    });
  }

  next();
};

module.exports = {
  apiKeyAuth,
  validateHubSpotSignature,
  ipWhitelist
};
