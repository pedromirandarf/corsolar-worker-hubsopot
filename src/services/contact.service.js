const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

// Cliente HTTP configurado para Backend Corsolar Sandbox
const sandboxClient = axios.create({
  baseURL: process.env.BACKEND_API_URL_SANDBOX || 'https://backend.corsolar.com.br/api',
  timeout: parseInt(process.env.BACKEND_TIMEOUT_SANDBOX || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.BACKEND_API_KEY_SANDBOX}`
  }
});

// Interceptor para log de requisições
sandboxClient.interceptors.request.use(
  (config) => {
    logger.debug('Requisição de contato ao backend sandbox', {
      method: config.method,
      url: config.url
    });
    return config;
  },
  (error) => {
    logger.error('Erro no interceptor de requisição de contato', {
      error: error.message
    });
    return Promise.reject(error);
  }
);

/**
 * Lê o arquivo CSV de contatos
 */
const readContactsCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const contacts = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        contacts.push(row);
      })
      .on('end', () => {
        logger.info('Arquivo CSV de contatos lido com sucesso', {
          total: contacts.length
        });
        resolve(contacts);
      })
      .on('error', (error) => {
        logger.error('Erro ao ler arquivo CSV de contatos', {
          error: error.message
        });
        reject(error);
      });
  });
};

/**
 * Envia um contato para o backend
 */
const sendContact = async (contact) => {
  try {
    // Formatar dados do contato para o backend
    const contactData = {
      data: {
        nome: contact.nome || contact.name,
        email: contact.email,
        telefone: contact.telefone || contact.phone,
        endereco: contact.endereco || contact.address,
        cidade: contact.cidade || contact.city,
        estado: contact.estado || contact.state,
        cep: contact.cep || contact.zipcode,
        cpf: contact.cpf || contact.document,
        data_nascimento: contact.data_nascimento || contact.birthdate
      }
    };

    const response = await sandboxClient.post('/contacts', contactData);

    logger.info('Contato enviado com sucesso', {
      email: contact.email,
      id: response.data.data?.id
    });

    return {
      success: true,
      contact: contact.email,
      data: response.data
    };
  } catch (error) {
    logger.error('Erro ao enviar contato', {
      email: contact.email,
      error: error.message,
      response: error.response?.data
    });

    return {
      success: false,
      contact: contact.email,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Envia múltiplos contatos para o backend
 */
const sendMultipleContacts = async (contacts) => {
  try {
    logger.info('Iniciando envio de múltiplos contatos', {
      total: contacts.length
    });

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Enviar contatos um por um (pode ser paralelizado se o backend suportar)
    for (const contact of contacts) {
      const result = await sendContact(contact);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Pequeno delay para não sobrecarregar o backend
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger.info('Envio de contatos finalizado', {
      total: contacts.length,
      success: successCount,
      errors: errorCount
    });

    return {
      success: true,
      total: contacts.length,
      successCount,
      errorCount,
      results
    };
  } catch (error) {
    logger.error('Erro ao enviar múltiplos contatos', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Processa arquivo CSV e envia contatos para o backend
 */
const processCSVAndSendContacts = async (filename = 'contatos.csv') => {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo ${filename} não encontrado em /data`);
    }

    logger.info('Processando arquivo CSV de contatos', { filename });

    // Ler contatos do CSV
    const contacts = await readContactsCSV(filePath);

    if (contacts.length === 0) {
      return {
        success: false,
        message: 'Nenhum contato encontrado no arquivo CSV'
      };
    }

    // Enviar contatos para o backend
    const result = await sendMultipleContacts(contacts);

    return result;
  } catch (error) {
    logger.error('Erro ao processar CSV e enviar contatos', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Envia contatos do corpo da requisição
 */
const sendContactsFromRequest = async (contacts) => {
  try {
    if (!Array.isArray(contacts)) {
      contacts = [contacts];
    }

    logger.info('Enviando contatos da requisição', {
      total: contacts.length
    });

    const result = await sendMultipleContacts(contacts);
    return result;
  } catch (error) {
    logger.error('Erro ao enviar contatos da requisição', {
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  readContactsCSV,
  sendContact,
  sendMultipleContacts,
  processCSVAndSendContacts,
  sendContactsFromRequest
};
