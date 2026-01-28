const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Gera hash SHA-256
 */
const generateHash = (data) => {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
};

/**
 * Gera HMAC SHA-256
 */
const generateHmac = (data, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(data))
    .digest('hex');
};

/**
 * Verifica assinatura HMAC
 */
const verifyHmac = (data, signature, secret) => {
  const expectedSignature = generateHmac(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

/**
 * Sanitiza string removendo caracteres perigosos
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  return str
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]+>/g, '') // Remove tags HTML
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitiza objeto recursivamente
 */
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized = {};
    for (const key in obj) {
      // Sanitiza a chave também
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Previne SQL Injection escapando caracteres especiais
 */
const escapeSql = (value) => {
  if (typeof value !== 'string') return value;

  return value
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
};

/**
 * Valida e sanitiza entrada de usuário
 */
const sanitizeInput = (input, options = {}) => {
  const {
    maxLength = 1000,
    allowHtml = false,
    allowSpecialChars = true
  } = options;

  if (typeof input !== 'string') return input;

  let sanitized = input;

  // Limita tamanho
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove HTML se não permitido
  if (!allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Remove caracteres especiais se não permitido
  if (!allowSpecialChars) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_@.]/g, '');
  }

  return sanitized.trim();
};

/**
 * Gera token seguro
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Ofusca dados sensíveis para logs
 */
const maskSensitiveData = (data) => {
  const sensitiveKeys = [
    'password',
    'senha',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'credit_card',
    'cpf',
    'ssn'
  ];

  const mask = (obj) => {
    if (typeof obj === 'string') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(mask);
    }

    if (typeof obj === 'object' && obj !== null) {
      const masked = {};
      for (const key in obj) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(k => lowerKey.includes(k))) {
          masked[key] = '***REDACTED***';
        } else {
          masked[key] = mask(obj[key]);
        }
      }
      return masked;
    }

    return obj;
  };

  return mask(data);
};

/**
 * Valida origem da requisição
 */
const validateOrigin = (origin, allowedOrigins = []) => {
  if (!allowedOrigins || allowedOrigins.length === 0) {
    return true;
  }

  if (allowedOrigins.includes('*')) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

/**
 * Rate limiting simples em memória
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 900000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove requisições antigas
    const validRequests = userRequests.filter(
      time => now - time < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      logger.warn('Rate limit excedido', { identifier });
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  reset(identifier) {
    this.requests.delete(identifier);
  }

  clear() {
    this.requests.clear();
  }
}

/**
 * Verifica se IP está na blacklist
 */
const isBlacklisted = (ip, blacklist = []) => {
  return blacklist.includes(ip);
};

/**
 * Detecta tentativas de ataque comuns
 */
const detectAttackPatterns = (input) => {
  const patterns = [
    /(\bor\b|\band\b).*?=.*?/i, // SQL Injection
    /<script[^>]*>.*?<\/script>/gi, // XSS
    /\.\.\//g, // Path Traversal
    /\${.*?}/g, // Template Injection
    /exec\s*\(/i, // Command Injection
    /eval\s*\(/i // Code Injection
  ];

  for (const pattern of patterns) {
    if (pattern.test(input)) {
      logger.warn('Padrão de ataque detectado', {
        pattern: pattern.toString(),
        input: input.substring(0, 100)
      });
      return true;
    }
  }

  return false;
};

module.exports = {
  generateHash,
  generateHmac,
  verifyHmac,
  sanitizeString,
  sanitizeObject,
  escapeSql,
  sanitizeInput,
  generateSecureToken,
  maskSensitiveData,
  validateOrigin,
  RateLimiter,
  isBlacklisted,
  detectAttackPatterns
};
