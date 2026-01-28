const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Busca todos os produtos do backend
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Tamanho da página
 *     responses:
 *       200:
 *         description: Lista de produtos
 *       500:
 *         description: Erro no servidor
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /api/products/export:
 *   post:
 *     summary: Exporta todos os produtos para CSV
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Produtos exportados com sucesso
 *       500:
 *         description: Erro no servidor
 */
router.post('/export', productController.exportProducts);

/**
 * @swagger
 * /api/products/download/{filename}:
 *   get:
 *     summary: Faz download do arquivo CSV de produtos
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do arquivo CSV
 *     responses:
 *       200:
 *         description: Arquivo CSV
 *       404:
 *         description: Arquivo não encontrado
 */
router.get('/download/:filename', productController.downloadProductsCSV);

module.exports = router;
