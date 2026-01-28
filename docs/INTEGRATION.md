# Guia de Integração - Worker-HubSpot

## Integração com HubSpot

### Configuração do App HubSpot

1. Acesse o [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Crie um novo App
3. Configure as seguintes permissões (Scopes):
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
   - `crm.objects.companies.read`
   - `crm.objects.companies.write`

### Configuração de Webhooks

#### 1. Criar Webhook Subscription

```bash
POST https://api.hubapi.com/webhooks/v3/YOUR_APP_ID/subscriptions
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
  Content-Type: application/json

Body:
{
  "active": true,
  "eventType": "contact.creation",
  "propertyName": null
}
```

#### 2. Eventos Suportados

- `contact.creation` - Quando um contato é criado
- `contact.propertyChange` - Quando propriedades do contato mudam
- `contact.deletion` - Quando um contato é deletado
- `deal.creation` - Quando um negócio é criado
- `deal.propertyChange` - Quando propriedades do negócio mudam
- `company.creation` - Quando uma empresa é criada

### Autenticação OAuth 2.0

#### Fluxo de Autorização

```javascript
// 1. Redirecionar usuário para HubSpot
const authUrl = `https://app.hubspot.com/oauth/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `scope=${SCOPES}`;

// 2. Receber código de autorização
// GET /oauth/callback?code=AUTHORIZATION_CODE

// 3. Trocar código por access token
POST https://api.hubapi.com/oauth/v1/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTHORIZATION_CODE&
redirect_uri=REDIRECT_URI&
client_id=CLIENT_ID&
client_secret=CLIENT_SECRET
```

### Validação de Webhooks

A aplicação valida automaticamente as assinaturas dos webhooks HubSpot:

```javascript
// Exemplo de webhook recebido
POST /api/hubspot/webhook
Headers:
  X-HubSpot-Signature: v1=sha256_signature
  X-HubSpot-Signature-Version: v1

Body:
[
  {
    "eventId": 1,
    "subscriptionId": 12345,
    "portalId": 62515,
    "occurredAt": 1564113600000,
    "subscriptionType": "contact.creation",
    "attemptNumber": 0,
    "objectId": 123,
    "changeSource": "CRM",
    "changeFlag": "NEW"
  }
]
```

## Integração com Backend Corsolar

### Endpoints do Backend

Configure a URL do backend no `.env`:

```env
BACKEND_API_URL=http://localhost:5000/api
BACKEND_API_KEY=your_backend_api_key
```

### Sincronização de Dados

#### Criar/Atualizar Contato

```javascript
POST /api/backend/sync
Headers:
  X-API-Key: your_api_key
  Content-Type: application/json

Body:
{
  "entity": "contact",
  "action": "create",
  "data": {
    "id": "123",
    "email": "cliente@example.com",
    "firstname": "João",
    "lastname": "Silva",
    "phone": "+55 11 98765-4321",
    "company": "Empresa XYZ"
  }
}
```

#### Verificar Status

```javascript
GET /api/backend/status
Headers:
  X-API-Key: your_api_key

Response:
{
  "success": true,
  "data": {
    "status": "online",
    "timestamp": "2026-01-22T10:00:00.000Z",
    "responseTime": 45
  }
}
```

### Webhooks do Backend

O backend pode enviar webhooks para o middleware:

```javascript
POST /api/backend/webhook
Headers:
  X-API-Key: your_api_key
  Content-Type: application/json

Body:
{
  "event": "customer.created",
  "data": {
    "id": "456",
    "email": "novo@cliente.com",
    "name": "Maria Santos",
    "phone": "+55 11 91234-5678"
  }
}
```

## Exemplos de Código

### Cliente Node.js

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json'
  }
});

// Criar contato no HubSpot
async function createContact(contactData) {
  try {
    const response = await client.post('/hubspot/contact', contactData);
    console.log('Contato criado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
    throw error;
  }
}

// Sincronizar com backend
async function syncData(entity, action, data) {
  try {
    const response = await client.post('/backend/sync', {
      entity,
      action,
      data
    });
    console.log('Sincronização concluída:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
    throw error;
  }
}
```

### Cliente Python

```python
import requests

BASE_URL = 'http://localhost:3000/api'
API_KEY = 'your_api_key'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Criar contato
def create_contact(contact_data):
    response = requests.post(
        f'{BASE_URL}/hubspot/contact',
        json=contact_data,
        headers=headers
    )
    response.raise_for_status()
    return response.json()

# Sincronizar dados
def sync_data(entity, action, data):
    payload = {
        'entity': entity,
        'action': action,
        'data': data
    }
    response = requests.post(
        f'{BASE_URL}/backend/sync',
        json=payload,
        headers=headers
    )
    response.raise_for_status()
    return response.json()
```

## Tratamento de Erros

### Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autorizado (API Key inválida)
- `403` - Proibido (assinatura inválida)
- `404` - Recurso não encontrado
- `429` - Rate limit excedido
- `500` - Erro interno do servidor
- `504` - Timeout

### Formato de Erro

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": {
    "field": "email",
    "message": "Email inválido"
  }
}
```

## Retry e Circuit Breaker

### Implementar Retry

```javascript
const axios = require('axios');
const axiosRetry = require('axios-retry');

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status === 429;
  }
});
```

## Testes

### Teste de Integração com HubSpot

```bash
# Criar contato
curl -X POST http://localhost:3000/api/hubspot/contact \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "firstname": "Teste",
    "lastname": "Integração"
  }'
```

### Teste de Webhook

```bash
# Simular webhook HubSpot
curl -X POST http://localhost:3000/api/hubspot/webhook \
  -H "X-HubSpot-Signature: calculated_signature" \
  -H "Content-Type: application/json" \
  -d '[{
    "eventId": 1,
    "subscriptionType": "contact.creation",
    "objectId": 123
  }]'
```

## Monitoramento

### Health Check

```bash
curl http://localhost:3000/health
```

### Logs

Os logs de integração são armazenados em:
- `logs/application-YYYY-MM-DD.log`
- `logs/error-YYYY-MM-DD.log`

## Suporte

Para dúvidas sobre integração:
- Email: dev@corsolar.com
- Documentação: http://localhost:3000/api-docs
