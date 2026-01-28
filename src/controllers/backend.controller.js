const backendService = require('../services/backend.service');
const hubspotService = require('../services/hubspot.service');
const logger = require('../config/logger');

/**
 * Sincroniza dados entre HubSpot e Backend
 */
const syncData = async (req, res, next) => {
  try {
    const { entity, action, data } = req.body;

    logger.info('Sincronizando dados com backend', {
      entity,
      action,
      dataKeys: Object.keys(data)
    });

    const result = await backendService.syncData(entity, action, data);

    logger.info('Sincronização realizada com sucesso', {
      entity,
      action
    });

    res.json({
      success: true,
      data: result,
      message: 'Sincronização realizada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao sincronizar dados', {
      error: error.message,
      entity: req.body.entity,
      action: req.body.action
    });
    next(error);
  }
};

/**
 * Verifica o status do backend
 */
const getStatus = async (req, res, next) => {
  try {
    const startTime = Date.now();

    logger.info('Verificando status do backend');

    const status = await backendService.checkStatus();
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        status: status ? 'online' : 'offline',
        timestamp: new Date().toISOString(),
        responseTime
      }
    });
  } catch (error) {
    logger.error('Erro ao verificar status do backend', {
      error: error.message
    });
    
    res.json({
      success: false,
      data: {
        status: 'offline',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
};

/**
 * Processa dados recebidos do backend
 */
const processData = async (req, res, next) => {
  try {
    const { type, payload } = req.body;

    logger.info('Processando dados do backend', {
      type,
      payloadKeys: Object.keys(payload)
    });

    // Processar diferentes tipos de dados
    let result;
    switch (type) {
      case 'contact_update':
        result = await handleContactUpdate(payload);
        break;
      case 'deal_update':
        result = await handleDealUpdate(payload);
        break;
      case 'company_update':
        result = await handleCompanyUpdate(payload);
        break;
      default:
        logger.warn('Tipo de processamento não reconhecido', { type });
        return res.status(400).json({
          success: false,
          error: 'Tipo de processamento não reconhecido'
        });
    }

    logger.info('Dados processados com sucesso', { type });

    res.json({
      success: true,
      data: result,
      message: 'Dados processados com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao processar dados', {
      error: error.message,
      type: req.body.type
    });
    next(error);
  }
};

/**
 * Manipula webhooks recebidos do backend
 */
const handleWebhook = async (req, res, next) => {
  try {
    const { event, data } = req.body;

    logger.info('Webhook do backend recebido', {
      event,
      dataKeys: Object.keys(data || {})
    });

    // Processar evento e enviar para HubSpot se necessário
    switch (event) {
      case 'customer.created':
        await hubspotService.createContact(data);
        break;
      case 'customer.updated':
        await hubspotService.updateContact(data.id, data);
        break;
      case 'order.created':
        await hubspotService.createDeal(data);
        break;
      default:
        logger.warn('Evento não tratado', { event });
    }

    res.json({
      success: true,
      message: 'Webhook processado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao processar webhook do backend', {
      error: error.message,
      event: req.body.event
    });
    next(error);
  }
};

// Funções auxiliares para processar atualizações
const handleContactUpdate = async (payload) => {
  const { hubspotId, ...updateData } = payload;
  return await hubspotService.updateContact(hubspotId, updateData);
};

const handleDealUpdate = async (payload) => {
  const { hubspotId, ...updateData } = payload;
  return await hubspotService.updateDeal(hubspotId, updateData);
};

const handleCompanyUpdate = async (payload) => {
  const { hubspotId, ...updateData } = payload;
  return await hubspotService.updateCompany(hubspotId, updateData);
};

module.exports = {
  syncData,
  getStatus,
  processData,
  handleWebhook
};
