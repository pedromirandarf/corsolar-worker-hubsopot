const express = require('express');
const { body } = require('express-validator');
const backendController = require('../controllers/backend.controller');
const { apiKeyAuth } = require('../middleware/auth');
const { validate, sanitizeInput } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação em todas as rotas do backend
router.use(apiKeyAuth);

/**
 * @swagger
 * /api/backend/sync:
 *   post:
 *     tags: [Backend]
 *     summary: Sincroniza dados entre HubSpot e Backend
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entity
 *               - data
 *             properties:
 *               entity:
 *                 type: string
 *                 enum: [contact, deal, company]
 *                 description: Tipo de entidade a sincronizar
 *               action:
 *                 type: string
 *                 enum: [create, update, delete]
 *                 description: Ação a executar
 *               data:
 *                 type: object
 *                 description: Dados da entidade
 *     responses:
 *       200:
 *         description: Sincronização realizada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/sync',
  sanitizeInput,
  [
    body('entity').isIn(['contact', 'deal', 'company']).withMessage('Entidade inválida'),
    body('action').isIn(['create', 'update', 'delete']).withMessage('Ação inválida'),
    body('data').isObject().withMessage('Dados devem ser um objeto')
  ],
  validate,
  backendController.syncData
);

/**
 * @swagger
 * /api/backend/status:
 *   get:
 *     tags: [Backend]
 *     summary: Verifica o status do backend Corsolar
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Status do backend
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 responseTime:
 *                   type: number
 */
router.get('/status', backendController.getStatus);

/**
 * @swagger
 * /api/backend/process:
 *   post:
 *     tags: [Backend]
 *     summary: Processa dados recebidos do backend
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Dados processados
 */
router.post(
  '/process',
  sanitizeInput,
  [
    body('type').notEmpty().withMessage('Tipo é obrigatório'),
    body('payload').isObject().withMessage('Payload deve ser um objeto')
  ],
  validate,
  backendController.processData
);

/**
 * @swagger
 * /api/backend/webhook:
 *   post:
 *     tags: [Backend]
 *     summary: Recebe webhooks do backend Corsolar
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processado
 */
router.post(
  '/webhook',
  sanitizeInput,
  backendController.handleWebhook
);

module.exports = router;
