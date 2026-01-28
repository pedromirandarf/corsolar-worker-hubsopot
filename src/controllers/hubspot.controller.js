const hubspotService = require('../services/hubspot.service');
const backendService = require('../services/backend.service');
const logger = require('../config/logger');

/**
 * Manipula webhooks recebidos do HubSpot
 */
const handleWebhook = async (req, res, next) => {
  try {
    const webhookData = req.body;

    logger.info('Webhook HubSpot recebido', {
      eventId: webhookData.eventId,
      subscriptionType: webhookData.subscriptionType,
      objectId: webhookData.objectId
    });

    // Processar diferentes tipos de eventos
    switch (webhookData.subscriptionType) {
      case 'contact.creation':
        await handleContactCreation(webhookData);
        break;
      case 'contact.propertyChange':
        await handleContactUpdate(webhookData);
        break;
      case 'deal.creation':
        await handleDealCreation(webhookData);
        break;
      case 'deal.propertyChange':
        await handleDealUpdate(webhookData);
        break;
      default:
        logger.warn('Tipo de evento não tratado', {
          subscriptionType: webhookData.subscriptionType
        });
    }

    res.json({
      success: true,
      message: 'Webhook processado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao processar webhook HubSpot', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

/**
 * Cria um novo contato no HubSpot
 */
const createContact = async (req, res, next) => {
  try {
    const contactData = req.body;

    logger.info('Criando contato no HubSpot', { email: contactData.email });

    const contact = await hubspotService.createContact(contactData);

    // Sincronizar com backend
    await backendService.syncData('contact', 'create', contact);

    logger.info('Contato criado com sucesso', { contactId: contact.id });

    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contato criado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao criar contato', {
      error: error.message,
      data: req.body
    });
    next(error);
  }
};

/**
 * Busca um contato no HubSpot
 */
const getContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info('Buscando contato no HubSpot', { contactId: id });

    const contact = await hubspotService.getContact(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contato não encontrado'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('Erro ao buscar contato', {
      error: error.message,
      contactId: req.params.id
    });
    next(error);
  }
};

/**
 * Atualiza um contato no HubSpot
 */
const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    logger.info('Atualizando contato no HubSpot', { contactId: id });

    const contact = await hubspotService.updateContact(id, updateData);

    // Sincronizar com backend
    await backendService.syncData('contact', 'update', contact);

    logger.info('Contato atualizado com sucesso', { contactId: id });

    res.json({
      success: true,
      data: contact,
      message: 'Contato atualizado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao atualizar contato', {
      error: error.message,
      contactId: req.params.id
    });
    next(error);
  }
};

/**
 * Cria um novo negócio no HubSpot
 */
const createDeal = async (req, res, next) => {
  try {
    const dealData = req.body;

    logger.info('Criando negócio no HubSpot', { dealname: dealData.dealname });

    const deal = await hubspotService.createDeal(dealData);

    // Sincronizar com backend
    await backendService.syncData('deal', 'create', deal);

    logger.info('Negócio criado com sucesso', { dealId: deal.id });

    res.status(201).json({
      success: true,
      data: deal,
      message: 'Negócio criado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao criar negócio', {
      error: error.message,
      data: req.body
    });
    next(error);
  }
};

// Funções auxiliares para processar eventos de webhook
const handleContactCreation = async (webhookData) => {
  const contact = await hubspotService.getContact(webhookData.objectId);
  await backendService.syncData('contact', 'create', contact);
};

const handleContactUpdate = async (webhookData) => {
  const contact = await hubspotService.getContact(webhookData.objectId);
  await backendService.syncData('contact', 'update', contact);
};

const handleDealCreation = async (webhookData) => {
  const deal = await hubspotService.getDeal(webhookData.objectId);
  await backendService.syncData('deal', 'create', deal);
};

const handleDealUpdate = async (webhookData) => {
  const deal = await hubspotService.getDeal(webhookData.objectId);
  await backendService.syncData('deal', 'update', deal);
};

module.exports = {
  handleWebhook,
  createContact,
  getContact,
  updateContact,
  createDeal
};
