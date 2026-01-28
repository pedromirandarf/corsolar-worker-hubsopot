# Worker-HubSpot - Middleware Corsolar

Aplicação Node.js que atua como middleware entre o HubSpot e o Backend interno da Corsolar.

## 📋 Funcionalidades

- ✅ Integração com HubSpot via Webhooks e API
- ✅ Comunicação com Backend interno Corsolar
- ✅ Sistema robusto de logs (Winston)
- ✅ Segurança avançada (Helmet, Rate Limiting, Validação)
- ✅ Proteção contra SQL Injection e XSS
- ✅ Validação de requisições
- ✅ Documentação automática (Swagger)
- ✅ Monitoramento e health checks

## 🚀 Instalação

```bash
# Clonar repositório
git clone <repository-url>
cd Corsolar

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm start
```

## 📁 Estrutura do Projeto

```
Corsolar/
├── src/
│   ├── server.js              # Ponto de entrada
│   ├── app.js                 # Configuração Express
│   ├── config/                # Configurações
│   │   ├── index.js
│   │   ├── logger.js
│   │   └── swagger.js
│   ├── middleware/            # Middlewares
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── routes/                # Rotas
│   │   ├── index.js
│   │   ├── hubspot.routes.js
│   │   └── backend.routes.js
│   ├── controllers/           # Controladores
│   │   ├── hubspot.controller.js
│   │   └── backend.controller.js
│   ├── services/              # Serviços
│   │   ├── hubspot.service.js
│   │   └── backend.service.js
│   └── utils/                 # Utilitários
│       ├── validator.js
│       └── security.js
├── logs/                      # Logs (gerado automaticamente)
├── .env                       # Variáveis de ambiente
├── .env.example               # Exemplo de configuração
├── .gitignore
├── package.json
└── README.md
```

## 🔒 Segurança

A aplicação implementa múltiplas camadas de segurança:

- **Helmet**: Proteção de headers HTTP
- **Rate Limiting**: Limite de requisições por IP
- **CORS**: Controle de origem das requisições
- **Validação de Entrada**: Sanitização de dados
- **Proteção SQL Injection**: Validação e escape de queries
- **Autenticação**: API Keys e validação de webhooks HubSpot
- **IP Whitelist**: Controle de IPs permitidos

## 📝 API Endpoints

### HubSpot Endpoints

```
POST /api/hubspot/webhook          # Recebe webhooks do HubSpot
POST /api/hubspot/contact          # Cria contato no HubSpot
GET  /api/hubspot/contact/:id      # Busca contato no HubSpot
PUT  /api/hubspot/contact/:id      # Atualiza contato
```

### Backend Endpoints

```
POST /api/backend/sync             # Sincroniza dados com backend
GET  /api/backend/status           # Status do backend
POST /api/backend/process          # Processa dados do backend
```

### Utilitários

```
GET  /health                       # Health check
GET  /api-docs                     # Documentação Swagger
```

## 📊 Logs

Os logs são armazenados em `logs/` com rotação diária:

- `combined.log` - Todos os logs
- `error.log` - Apenas erros
- `application-%DATE%.log` - Logs do dia

## 🧪 Testes

```bash
npm test
```

## 📖 Documentação API

Acesse a documentação interativa em:
```
http://localhost:3000/api-docs
```

## 🔧 Configuração

Todas as configurações são feitas via variáveis de ambiente no arquivo `.env`. Consulte `.env.example` para ver todas as opções disponíveis.

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe Corsolar.

## 📄 Licença

ISC © Corsolar
