# Guia de Segurança - Worker-HubSpot

## Visão Geral

Este documento descreve as práticas de segurança implementadas na aplicação Worker-HubSpot.

## Camadas de Segurança

### 1. Segurança de Headers HTTP (Helmet)

A aplicação usa **Helmet** para proteger contra vulnerabilidades comuns:

- **Content Security Policy (CSP)**: Previne XSS
- **HSTS**: Força HTTPS
- **X-Frame-Options**: Previne clickjacking
- **X-Content-Type-Options**: Previne MIME sniffing
- **X-XSS-Protection**: Ativa proteção XSS do browser

### 2. Rate Limiting

Implementamos três níveis de rate limiting:

#### Global
- **Janela**: 15 minutos
- **Máximo**: 100 requisições por IP
- **Aplicado**: Todas as rotas da API

#### Webhooks
- **Janela**: 1 minuto
- **Máximo**: 50 requisições
- **Aplicado**: `/api/hubspot/webhook`

#### Autenticação
- **Janela**: 15 minutos
- **Máximo**: 5 tentativas
- **Aplicado**: Endpoints de autenticação

### 3. Autenticação e Autorização

#### API Key Authentication
```javascript
Headers: X-API-Key: your_api_key
```

- Obrigatório para endpoints de backend
- Verificação em tempo constante
- Logs de tentativas inválidas

#### Validação de Assinatura HubSpot
```javascript
Headers: X-HubSpot-Signature: sha256_signature
```

- Validação HMAC SHA-256
- Previne webhooks falsos
- Timeout de validação

#### IP Whitelist
- Lista configurável via `.env`
- Bloqueio automático de IPs não autorizados
- Logs de tentativas bloqueadas

### 4. Validação de Entrada

#### Sanitização Automática
- Remove tags HTML
- Escapa caracteres especiais
- Limita tamanho de payload

#### Validação com Joi
- Schemas definidos para cada entidade
- Validação de tipos e formatos
- Mensagens de erro descritivas

#### Prevenção de Ataques
- **SQL Injection**: Sanitização e escape
- **XSS**: Remoção de scripts
- **Path Traversal**: Validação de caminhos
- **Command Injection**: Filtro de comandos

### 5. CORS (Cross-Origin Resource Sharing)

```javascript
// Configuração
origin: process.env.CORS_ORIGIN
credentials: true
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
```

### 6. Logging e Monitoramento

#### Logs de Segurança
- Tentativas de autenticação
- Rate limit excedido
- IPs bloqueados
- Padrões de ataque detectados

#### Rotação de Logs
- Diária
- Compressão automática
- Retenção de 14 dias

## Configuração de Segurança

### Variáveis de Ambiente

```env
# Secrets
HUBSPOT_WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# IP Whitelist
ALLOWED_IPS=127.0.0.1,::1,10.0.0.1
```

## Boas Práticas

### 1. Secrets Management
- Nunca commitar secrets no código
- Usar variáveis de ambiente
- Rotacionar secrets periodicamente
- Usar serviços de gerenciamento de secrets (AWS Secrets Manager, Azure Key Vault)

### 2. HTTPS
- Sempre usar HTTPS em produção
- Configurar certificados SSL/TLS válidos
- Habilitar HSTS

### 3. Atualizações
- Manter dependências atualizadas
- Monitorar vulnerabilidades (npm audit)
- Aplicar patches de segurança rapidamente

### 4. Monitoramento
- Alertas para tentativas de ataque
- Monitorar logs de erro
- Dashboard de segurança

### 5. Backup e Recuperação
- Backup regular de dados
- Plano de recuperação de desastres
- Testes de recuperação

## Auditoria de Segurança

### Checklist Regular

- [ ] Revisar logs de segurança
- [ ] Verificar tentativas de autenticação falhadas
- [ ] Analisar padrões de tráfego incomuns
- [ ] Atualizar dependências
- [ ] Testar rate limiting
- [ ] Validar configurações de CORS
- [ ] Revisar permissões de acesso
- [ ] Verificar rotação de logs

### Testes de Segurança

```bash
# Teste de SQL Injection
curl -X POST http://localhost:3000/api/hubspot/contact \
  -H "X-API-Key: your_key" \
  -d '{"email": "test@test.com OR 1=1"}'

# Teste de XSS
curl -X POST http://localhost:3000/api/hubspot/contact \
  -H "X-API-Key: your_key" \
  -d '{"email": "<script>alert(1)</script>"}'

# Teste de Rate Limiting
for i in {1..150}; do
  curl http://localhost:3000/health
done
```

## Resposta a Incidentes

### Em caso de brecha de segurança:

1. **Contenção**: Isolar o sistema afetado
2. **Investigação**: Analisar logs e identificar a causa
3. **Correção**: Aplicar patch ou correção
4. **Notificação**: Informar stakeholders
5. **Documentação**: Documentar o incidente
6. **Prevenção**: Implementar medidas preventivas

## Contatos de Segurança

- **Equipe de Segurança**: security@corsolar.com
- **Emergências**: +55 (XX) XXXX-XXXX

## Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
