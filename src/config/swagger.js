const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Worker-HubSpot API',
      version: '1.0.0',
      description: 'Middleware entre HubSpot e Backend Corsolar',
      contact: {
        name: 'Corsolar',
        email: 'support@corsolar.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: `http://${config.host}:${config.port}`,
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.corsolar.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key para autenticação'
        },
        HubSpotSignature: {
          type: 'apiKey',
          in: 'header',
          name: 'X-HubSpot-Signature',
          description: 'Assinatura de webhook HubSpot'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Mensagem de erro'
            },
            details: {
              type: 'object'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            },
            message: {
              type: 'string'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'HubSpot',
        description: 'Endpoints de integração com HubSpot'
      },
      {
        name: 'Backend',
        description: 'Endpoints de integração com Backend Corsolar'
      },
      {
        name: 'Health',
        description: 'Endpoints de monitoramento'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
