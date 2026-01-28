const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');

const server = app.listen(config.port, config.host, () => {
  logger.info(`🚀 Worker-HubSpot iniciado com sucesso!`);
  logger.info(`📍 Ambiente: ${config.env}`);
  logger.info(`🌐 URL: http://${config.host}:${config.port}`);
  logger.info(`� Documentação Visual: http://${config.host}:${config.port}/docs`);
  logger.info(`📚 Swagger API: http://${config.host}:${config.port}/api-docs`);
  logger.info(`💚 Health Check: http://${config.host}:${config.port}/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} recebido. Encerrando graciosamente...`);
  
  server.close(() => {
    logger.info('Servidor encerrado com sucesso');
    process.exit(0);
  });

  // Força o encerramento após 10 segundos
  setTimeout(() => {
    logger.error('Forçando encerramento após timeout');
    process.exit(1);
  }, 10000);
};

// Tratamento de sinais
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;
