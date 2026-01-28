const axios = require('axios');
const config = require('../config');
const logger = require('../config/logger');

// Cliente HTTP configurado para Backend Corsolar
const backendClient = axios.create({
  baseURL: config.backend.apiUrl,
  timeout: config.backend.timeout,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': config.backend.apiKey
  }
});

// Interceptor para log de requisições
backendClient.interceptors.request.use(
  (config) => {
    logger.debug('Requisição ao backend', {
      method: config.method,
      url: config.url
    });
    return config;
  },
  (error) => {
    logger.error('Erro no interceptor de requisição backend', {
      error: error.message
    });
    return Promise.reject(error);
  }
);

// Interceptor para log de respostas
backendClient.interceptors.response.use(
  (response) => {
    logger.debug('Resposta do backend recebida', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    logger.error('Erro na resposta do backend', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

/**
 * Sincroniza dados com o backend
 */
const syncData = async (entity, action, data) => {
  try {
    logger.info('Sincronizando dados com backend', {
      entity,
      action
    });

    const response = await backendClient.post('/sync', {
      entity,
      action,
      data,
      timestamp: new Date().toISOString(),
      source: 'hubspot'
    });

    logger.info('Dados sincronizados com sucesso', {
      entity,
      action,
      responseStatus: response.status
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao sincronizar dados com backend', {
      error: error.message,
      entity,
      action,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Verifica o status do backend
 */
const checkStatus = async () => {
  try {
    const response = await backendClient.get('/health', {
      timeout: 5000
    });

    return response.status === 200;
  } catch (error) {
    logger.error('Backend não está respondendo', {
      error: error.message
    });
    return false;
  }
};

/**
 * Envia dados para o backend
 */
const sendData = async (endpoint, data) => {
  try {
    logger.info('Enviando dados para backend', {
      endpoint
    });

    const response = await backendClient.post(endpoint, data);

    logger.info('Dados enviados com sucesso', {
      endpoint,
      status: response.status
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao enviar dados para backend', {
      error: error.message,
      endpoint,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Busca dados do backend
 */
const fetchData = async (endpoint, params = {}) => {
  try {
    logger.info('Buscando dados do backend', {
      endpoint,
      params
    });

    const response = await backendClient.get(endpoint, { params });

    logger.info('Dados recebidos do backend', {
      endpoint,
      status: response.status
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao buscar dados do backend', {
      error: error.message,
      endpoint,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Envia notificação para o backend
 */
const sendNotification = async (type, message, data = {}) => {
  try {
    logger.info('Enviando notificação para backend', {
      type,
      message
    });

    const response = await backendClient.post('/notifications', {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao enviar notificação', {
      error: error.message,
      type
    });
    // Não lançar erro para não quebrar o fluxo principal
    return null;
  }
};

module.exports = {
  syncData,
  checkStatus,
  sendData,
  fetchData,
  sendNotification
};
