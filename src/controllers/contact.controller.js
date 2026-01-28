const contactService = require('../services/contact.service');
const logger = require('../config/logger');

/**
 * Envia contatos do CSV para o backend
 */
const sendContactsFromCSV = async (req, res, next) => {
  try {
    const { filename } = req.body;

    logger.info('Requisição para enviar contatos do CSV', {
      filename: filename || 'contatos.csv'
    });

    const result = await contactService.processCSVAndSendContacts(filename);

    res.status(200).json({
      success: true,
      message: 'Contatos processados',
      data: {
        total: result.total,
        successCount: result.successCount,
        errorCount: result.errorCount,
        results: result.results
      }
    });
  } catch (error) {
    logger.error('Erro ao enviar contatos do CSV', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Envia contatos do corpo da requisição
 */
const sendContacts = async (req, res, next) => {
  try {
    const { contacts } = req.body;

    if (!contacts) {
      return res.status(400).json({
        success: false,
        message: 'Campo "contacts" é obrigatório'
      });
    }

    logger.info('Requisição para enviar contatos', {
      total: Array.isArray(contacts) ? contacts.length : 1
    });

    const result = await contactService.sendContactsFromRequest(contacts);

    res.status(200).json({
      success: true,
      message: 'Contatos enviados',
      data: {
        total: result.total,
        successCount: result.successCount,
        errorCount: result.errorCount,
        results: result.results
      }
    });
  } catch (error) {
    logger.error('Erro ao enviar contatos', {
      error: error.message
    });
    next(error);
  }
};

module.exports = {
  sendContactsFromCSV,
  sendContacts
};
