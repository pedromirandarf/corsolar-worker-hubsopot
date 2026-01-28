const axios = require('axios');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');
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
    logger.debug('Requisição ao backend sandbox', {
      method: config.method,
      url: config.url
    });
    return config;
  },
  (error) => {
    logger.error('Erro no interceptor de requisição sandbox', {
      error: error.message
    });
    return Promise.reject(error);
  }
);

// Interceptor para log de respostas
sandboxClient.interceptors.response.use(
  (response) => {
    logger.debug('Resposta do backend sandbox recebida', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    logger.error('Erro na resposta do backend sandbox', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

/**
 * Busca todos os produtos do backend
 */
const getAllProducts = async (params = {}) => {
  try {
    logger.info('Buscando produtos do backend sandbox');

    const queryParams = {
      'pagination[page]': params.page || 1,
      'pagination[pageSize]': params.pageSize || 100,
      ...params
    };

    const response = await sandboxClient.get('/products', {
      params: queryParams
    });

    logger.info('Produtos obtidos com sucesso', {
      total: response.data.meta?.pagination?.total || response.data.data?.length || 0
    });

    return response.data;
  } catch (error) {
    logger.error('Erro ao buscar produtos', {
      error: error.message,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Exporta produtos para CSV
 */
const exportProductsToCSV = async (products, filename = null) => {
  try {
    // Criar diretório data se não existir
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const csvFilename = filename || `produtos_${timestamp}.csv`;
    const csvPath = path.join(dataDir, csvFilename);

    // Extrair dados dos produtos
    const productData = products.map(product => {
      const attributes = product.attributes || product;
      return {
        id: product.id || '',
        nome: attributes.nome || attributes.name || '',
        descricao: attributes.descricao || attributes.description || '',
        preco: attributes.preco || attributes.price || '',
        categoria: attributes.categoria || attributes.category || '',
        marca: attributes.marca || attributes.brand || '',
        estoque: attributes.estoque || attributes.stock || '',
        ativo: attributes.ativo || attributes.active || '',
        sku: attributes.sku || '',
        createdAt: attributes.createdAt || '',
        updatedAt: attributes.updatedAt || ''
      };
    });

    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'nome', title: 'Nome' },
        { id: 'descricao', title: 'Descrição' },
        { id: 'preco', title: 'Preço' },
        { id: 'categoria', title: 'Categoria' },
        { id: 'marca', title: 'Marca' },
        { id: 'estoque', title: 'Estoque' },
        { id: 'ativo', title: 'Ativo' },
        { id: 'sku', title: 'SKU' },
        { id: 'createdAt', title: 'Data de Criação' },
        { id: 'updatedAt', title: 'Data de Atualização' }
      ]
    });

    await csvWriter.writeRecords(productData);

    logger.info('Produtos exportados para CSV', {
      filename: csvFilename,
      path: csvPath,
      total: productData.length
    });

    return {
      success: true,
      filename: csvFilename,
      path: csvPath,
      total: productData.length
    };
  } catch (error) {
    logger.error('Erro ao exportar produtos para CSV', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Busca e exporta todos os produtos para CSV
 */
const fetchAndExportProducts = async () => {
  try {
    logger.info('Iniciando busca e exportação de produtos');

    // Buscar todos os produtos
    const response = await getAllProducts({ pageSize: 100 });
    const products = response.data || [];

    if (products.length === 0) {
      logger.warn('Nenhum produto encontrado para exportar');
      return {
        success: false,
        message: 'Nenhum produto encontrado',
        total: 0
      };
    }

    // Exportar para CSV
    const exportResult = await exportProductsToCSV(products);

    return {
      success: true,
      message: 'Produtos exportados com sucesso',
      ...exportResult
    };
  } catch (error) {
    logger.error('Erro ao buscar e exportar produtos', {
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  getAllProducts,
  exportProductsToCSV,
  fetchAndExportProducts
};
