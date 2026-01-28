const Joi = require('joi');
const logger = require('../config/logger');

/**
 * Schema de validação para contato
 */
const contactSchema = Joi.object({
  email: Joi.string().email().required(),
  firstname: Joi.string().min(2).max(100).optional(),
  lastname: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9\s\-\+\(\)]+$/).optional(),
  company: Joi.string().max(200).optional()
});

/**
 * Schema de validação para negócio
 */
const dealSchema = Joi.object({
  dealname: Joi.string().min(3).max(200).required(),
  amount: Joi.number().min(0).optional(),
  dealstage: Joi.string().optional(),
  pipeline: Joi.string().optional()
});

/**
 * Schema de validação para sincronização
 */
const syncSchema = Joi.object({
  entity: Joi.string().valid('contact', 'deal', 'company').required(),
  action: Joi.string().valid('create', 'update', 'delete').required(),
  data: Joi.object().required()
});

/**
 * Valida dados de entrada usando schema Joi
 */
const validateData = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    logger.warn('Erro de validação de dados', {
      errors: error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    });

    throw {
      name: 'ValidationError',
      details: error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    };
  }

  return value;
};

/**
 * Valida email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida URL
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida número de telefone brasileiro
 */
const isValidBrazilianPhone = (phone) => {
  // Remove caracteres especiais
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  return /^[1-9]{2}9?[0-9]{8}$/.test(cleanPhone);
};

/**
 * Valida CPF
 */
const isValidCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

/**
 * Valida CNPJ
 */
const isValidCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/\D/g, '');

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

module.exports = {
  contactSchema,
  dealSchema,
  syncSchema,
  validateData,
  isValidEmail,
  isValidUrl,
  isValidBrazilianPhone,
  isValidCPF,
  isValidCNPJ
};
