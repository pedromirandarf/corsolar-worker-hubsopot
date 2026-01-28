# 🐳 Docker Setup - Worker HubSpot Corsolar

## Início Rápido

### 1. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env e adicione seu token do backend
# BACKEND_API_KEY_SANDBOX=seu_token_aqui
```

### 2. Inicie a aplicação

```bash
# Construir e iniciar
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 3. Teste a aplicação

A aplicação estará disponível em: `http://localhost:3000`

#### Health Check
```bash
curl http://localhost:3000/health
```

#### Documentação da API
Acesse: `http://localhost:3000/api-docs`

## Comandos Úteis

### Gerenciamento do Container

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose stop

# Reiniciar
docker-compose restart

# Parar e remover
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f corsolar-api

# Acessar o shell do container
docker-compose exec corsolar-api sh

# Ver status
docker-compose ps
```

### Rebuild (após mudanças no código)

```bash
# Reconstruir e reiniciar
docker-compose up -d --build

# Limpar tudo e reconstruir
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Logs e Debug

```bash
# Ver últimas 100 linhas
docker-compose logs --tail=100

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de erro
docker-compose logs | grep ERROR
```

## Volumes

Os seguintes diretórios são montados como volumes:

- `./logs` → `/app/logs` - Logs da aplicação
- `./data` → `/app/data` - Arquivos CSV (produtos exportados e contatos)

## Portas

- **3000** - API HTTP (mapeada do container para o host)

## Variáveis de Ambiente

As principais variáveis de ambiente são:

```env
# Servidor
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Backend Corsolar (Sandbox)
BACKEND_API_URL_SANDBOX=https://backend.corsolar.com.br/api
BACKEND_API_KEY_SANDBOX=seu_token_aqui
BACKEND_TIMEOUT_SANDBOX=30000

# Segurança
JWT_SECRET=seu_jwt_secret
API_KEY=sua_api_key

# Logs
LOG_LEVEL=info
```

## Health Check

O container possui health check configurado:

- **Endpoint**: `http://localhost:3000/health`
- **Intervalo**: 30 segundos
- **Timeout**: 10 segundos
- **Tentativas**: 3
- **Start period**: 40 segundos

Para verificar o status:

```bash
docker-compose ps
```

Status saudável aparecerá como: `Up X minutes (healthy)`

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs corsolar-api

# Verificar se a porta 3000 está disponível
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Reconstruir do zero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Aplicação não responde

```bash
# Verificar health check
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Reiniciar o container
docker-compose restart
```

### Erros de permissão em volumes

```bash
# No Windows, certifique-se que o Docker tem acesso à pasta
# Configurações Docker Desktop → Resources → File Sharing

# No Linux, ajuste permissões
chmod -R 755 logs data
```

### Problemas com .env

```bash
# Verificar se as variáveis estão sendo carregadas
docker-compose config

# Verificar variáveis dentro do container
docker-compose exec corsolar-api env | grep BACKEND
```

## Produção

### Build Otimizado

O Dockerfile usa multi-stage build otimizado:

- Base: `node:18-alpine` (imagem leve)
- Apenas dependências de produção (`npm ci --only=production`)
- Usuário não-root para segurança
- Volumes para logs e dados

### Segurança

- ✅ Rodando como usuário `node` (não-root)
- ✅ Apenas dependências de produção
- ✅ Health check configurado
- ✅ Variáveis sensíveis via `.env`
- ✅ `.dockerignore` configurado

## Integração CI/CD

### GitHub Actions

```yaml
- name: Build and push Docker image
  run: |
    docker build -t corsolar-worker:${{ github.sha }} .
    docker push corsolar-worker:${{ github.sha }}
```

### Deploy

```bash
# Pull e restart
docker-compose pull
docker-compose up -d
```

## Monitoramento

### Logs centralizados

Os logs estão em `./logs/` e podem ser integrados com:

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Graylog
- Papertrail
- CloudWatch (AWS)

### Métricas

Para adicionar métricas, instale:

```bash
npm install prom-client
```

E exponha o endpoint `/metrics` para Prometheus.

## Backup

### Dados importantes

```bash
# Backup dos dados
tar -czf backup-$(date +%Y%m%d).tar.gz data/ logs/

# Restaurar
tar -xzf backup-YYYYMMDD.tar.gz
```

## Recursos

- **Documentação API**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Backend API**: https://backend.corsolar.com.br/api
- **Backend Docs**: https://backend.corsolar.com.br/documentation/v1.0.0
