const express = require('express');
const { body, param } = require('express-validator');
const hubspotController = require('../controllers/hubspot.controller');
const { validateHubSpotSignature } = require('../middleware/auth');
const { validate, sanitizeInput } = require('../middleware/validation');
const { webhookLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /api/hubspot/webhook:
 *   post:
 *     tags: [HubSpot]
 *     summary: Recebe webhooks do HubSpot
 *     description: Endpoint para receber notificações de eventos do HubSpot
 *     security:
 *       - HubSpotSignature: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *               subscriptionType:
 *                 type: string
 *               objectId:
 *                 type: number
 *               propertyName:
 *                 type: string
 *               propertyValue:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *       401:
 *         description: Assinatura inválida
 */
router.post(
  '/webhook',
  webhookLimiter,
  validateHubSpotSignature,
  sanitizeInput,
  hubspotController.handleWebhook
);

/**
 * @swagger
 * /api/hubspot/contact:
 *   post:
 *     tags: [HubSpot]
 *     summary: Cria um novo contato no HubSpot
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contato criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/contact',
  sanitizeInput,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('firstname').optional().isString().trim(),
    body('lastname').optional().isString().trim(),
    body('phone').optional().isString().trim(),
    body('company').optional().isString().trim()
  ],
  validate,
  hubspotController.createContact
);

/**
 * @swagger
 * /api/hubspot/contact/{id}:
 *   get:
 *     tags: [HubSpot]
 *     summary: Busca um contato no HubSpot
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato no HubSpot
 *     responses:
 *       200:
 *         description: Contato encontrado
 *       404:
 *         description: Contato não encontrado
 */
router.get(
  '/contact/:id',
  [
    param('id').isNumeric().withMessage('ID deve ser numérico')
  ],
  validate,
  hubspotController.getContact
);

/**
 * @swagger
 * /api/hubspot/contact/{id}:
 *   put:
 *     tags: [HubSpot]
 *     summary: Atualiza um contato no HubSpot
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contato atualizado
 *       404:
 *         description: Contato não encontrado
 */
router.put(
  '/contact/:id',
  sanitizeInput,
  [
    param('id').isNumeric().withMessage('ID deve ser numérico')
  ],
  validate,
  hubspotController.updateContact
);

/**
 * @swagger
 * /api/hubspot/deal:
 *   post:
 *     tags: [HubSpot]
 *     summary: Cria um novo negócio no HubSpot
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dealname
 *             properties:
 *               dealname:
 *                 type: string
 *               amount:
 *                 type: number
 *               dealstage:
 *                 type: string
 *               pipeline:
 *                 type: string
 *     responses:
 *       201:
 *         description: Negócio criado com sucesso
 */
router.post(
  '/deal',
  sanitizeInput,
  [
    body('dealname').notEmpty().withMessage('Nome do negócio é obrigatório'),
    body('amount').optional().isNumeric().withMessage('Valor deve ser numérico'),
    body('dealstage').optional().isString(),
    body('pipeline').optional().isString()
  ],
  validate,
  hubspotController.createDeal
);

module.exports = router;
