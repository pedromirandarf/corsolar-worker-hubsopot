const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

/**
 * @swagger
 * /api/contacts/send-csv:
 *   post:
 *     summary: Envia contatos do arquivo CSV para o backend
 *     tags: [Contacts]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Nome do arquivo CSV (padrão contatos.csv)
 *                 example: contatos.csv
 *     responses:
 *       200:
 *         description: Contatos enviados com sucesso
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro no servidor
 */
router.post('/send-csv', contactController.sendContactsFromCSV);

/**
 * @swagger
 * /api/contacts/send:
 *   post:
 *     summary: Envia contatos para o backend
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contacts
 *             properties:
 *               contacts:
 *                 type: array
 *                 description: Array de contatos ou um único contato
 *                 items:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                       example: João Silva
 *                     email:
 *                       type: string
 *                       example: joao.silva@email.com
 *                     telefone:
 *                       type: string
 *                       example: 11987654321
 *                     endereco:
 *                       type: string
 *                       example: Rua das Flores 123
 *                     cidade:
 *                       type: string
 *                       example: São Paulo
 *                     estado:
 *                       type: string
 *                       example: SP
 *                     cep:
 *                       type: string
 *                       example: 01234-567
 *                     cpf:
 *                       type: string
 *                       example: 123.456.789-00
 *                     data_nascimento:
 *                       type: string
 *                       example: 1985-03-15
 *     responses:
 *       200:
 *         description: Contatos enviados com sucesso
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro no servidor
 */
router.post('/send', contactController.sendContacts);

module.exports = router;
