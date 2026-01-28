require('dotenv').config();

module.exports = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',

  // HubSpot
  hubspot: {
    appId: process.env.HUBSPOT_APP_ID,
    clientId: process.env.HUBSPOT_CLIENT_ID,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
    webhookSecret: process.env.HUBSPOT_WEBHOOK_SECRET,
    apiUrl: 'https://api.hubapi.com'
  },

  // Backend Corsolar
  backend: {
    apiUrl: process.env.BACKEND_API_URL,
    apiKey: process.env.BACKEND_API_KEY,
    timeout: parseInt(process.env.BACKEND_TIMEOUT, 10) || 30000
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET,
    apiKey: process.env.API_KEY,
    allowedIps: process.env.ALLOWED_IPS?.split(',') || [],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d'
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true'
  }
};
