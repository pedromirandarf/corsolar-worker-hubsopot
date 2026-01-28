const productService = require('../services/product.service');
const logger = require('../config/logger');

/**
 * Busca todos os produtos
 */
const getProducts = async (req, res, next) => {
  try {
    logger.info('Requisição para buscar produtos', {
      query: req.query
    });

    const products = await productService.getAllProducts(req.query);

    res.status(200).json({
      success: true,
      data: products.data,
      meta: products.meta
    });
  } catch (error) {
    logger.error('Erro ao buscar produtos', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Exporta produtos para CSV
 */
const exportProducts = async (req, res, next) => {
  try {
    logger.info('Requisição para exportar produtos para CSV');

    const result = await productService.fetchAndExportProducts();

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        filename: result.filename,
        path: result.path,
        total: result.total
      }
    });
  } catch (error) {
    logger.error('Erro ao exportar produtos', {
      error: error.message
    });
    next(error);
  }
};

/**
 * Download do arquivo CSV de produtos
 */
const downloadProductsCSV = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const path = require('path');
    const fs = require('fs');

    const filePath = path.join(process.cwd(), 'data', filename);

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado'
      });
    }

    logger.info('Download de arquivo CSV', { filename });

    res.download(filePath, filename, (err) => {
      if (err) {
        logger.error('Erro ao fazer download do CSV', {
          error: err.message,
          filename
        });
        next(err);
      }
    });
  } catch (error) {
    logger.error('Erro ao processar download', {
      error: error.message
    });
    next(error);
  }
};

module.exports = {
  getProducts,
  exportProducts,
  downloadProductsCSV
};
