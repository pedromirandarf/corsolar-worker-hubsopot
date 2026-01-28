const axios = require('axios');
const config = require('../config');
const logger = require('../config/logger');

// Cliente HTTP configurado para HubSpot
const hubspotClient = axios.create({
  baseURL: config.hubspot.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar autenticação
hubspotClient.interceptors.request.use(
  (config) => {
    // Adicionar access token (você precisará implementar OAuth 2.0)
    // Por enquanto, usando Private App token como exemplo
    config.headers.Authorization = `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`;
    return config;
  },
  (error) => {
    logger.error('Erro no interceptor de requisição HubSpot', { error: error.message });
    return Promise.reject(error);
  }
);

// Interceptor para log de respostas
hubspotClient.interceptors.response.use(
  (response) => {
    logger.debug('Resposta HubSpot recebida', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    logger.error('Erro na resposta HubSpot', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

/**
 * Cria um contato no HubSpot
 */
const createContact = async (contactData) => {
  try {
    const properties = formatContactProperties(contactData);

    const response = await hubspotClient.post('/crm/v3/objects/contacts', {
      properties
    });

    logger.info('Contato criado no HubSpot', {
      contactId: response.data.id
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao criar contato no HubSpot', {
      error: error.message,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Busca um contato no HubSpot
 */
const getContact = async (contactId) => {
  try {
    const response = await hubspotClient.get(`/crm/v3/objects/contacts/${contactId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    logger.error('Erro ao buscar contato no HubSpot', {
      error: error.message,
      contactId
    });
    throw error;
  }
};

/**
 * Atualiza um contato no HubSpot
 */
const updateContact = async (contactId, updateData) => {
  try {
    const properties = formatContactProperties(updateData);

    const response = await hubspotClient.patch(
      `/crm/v3/objects/contacts/${contactId}`,
      { properties }
    );

    logger.info('Contato atualizado no HubSpot', {
      contactId: response.data.id
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao atualizar contato no HubSpot', {
      error: error.message,
      contactId
    });
    throw error;
  }
};

/**
 * Cria um negócio no HubSpot
 */
const createDeal = async (dealData) => {
  try {
    const properties = formatDealProperties(dealData);

    const response = await hubspotClient.post('/crm/v3/objects/deals', {
      properties
    });

    logger.info('Negócio criado no HubSpot', {
      dealId: response.data.id
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao criar negócio no HubSpot', {
      error: error.message,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Busca um negócio no HubSpot
 */
const getDeal = async (dealId) => {
  try {
    const response = await hubspotClient.get(`/crm/v3/objects/deals/${dealId}`);
    return response.data;
  } catch (error) {
    logger.error('Erro ao buscar negócio no HubSpot', {
      error: error.message,
      dealId
    });
    throw error;
  }
};

/**
 * Atualiza um negócio no HubSpot
 */
const updateDeal = async (dealId, updateData) => {
  try {
    const properties = formatDealProperties(updateData);

    const response = await hubspotClient.patch(
      `/crm/v3/objects/deals/${dealId}`,
      { properties }
    );

    logger.info('Negócio atualizado no HubSpot', {
      dealId: response.data.id
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao atualizar negócio no HubSpot', {
      error: error.message,
      dealId
    });
    throw error;
  }
};

/**
 * Atualiza uma empresa no HubSpot
 */
const updateCompany = async (companyId, updateData) => {
  try {
    const response = await hubspotClient.patch(
      `/crm/v3/objects/companies/${companyId}`,
      { properties: updateData }
    );

    logger.info('Empresa atualizada no HubSpot', {
      companyId: response.data.id
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao atualizar empresa no HubSpot', {
      error: error.message,
      companyId
    });
    throw error;
  }
};

// Funções auxiliares para formatar propriedades
const formatContactProperties = (data) => {
  const properties = {};

  if (data.email) properties.email = data.email;
  if (data.firstname) properties.firstname = data.firstname;
  if (data.lastname) properties.lastname = data.lastname;
  if (data.phone) properties.phone = data.phone;
  if (data.company) properties.company = data.company;

  return properties;
};

const formatDealProperties = (data) => {
  const properties = {};

  if (data.dealname) properties.dealname = data.dealname;
  if (data.amount) properties.amount = data.amount;
  if (data.dealstage) properties.dealstage = data.dealstage;
  if (data.pipeline) properties.pipeline = data.pipeline;

  return properties;
};

module.exports = {
  createContact,
  getContact,
  updateContact,
  createDeal,
  getDeal,
  updateDeal,
  updateCompany
};
