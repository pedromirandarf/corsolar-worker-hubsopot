# Deploy Guide - Worker-HubSpot

## Preparação para Deploy

### 1. Verificações Pré-Deploy

```bash
# Instalar dependências
npm install

# Executar testes
npm test

# Verificar vulnerabilidades
npm audit

# Lint
npm run lint
```

### 2. Configuração de Ambiente

#### Produção (.env.production)

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# HubSpot
HUBSPOT_APP_ID=your_production_app_id
HUBSPOT_CLIENT_ID=your_production_client_id
HUBSPOT_CLIENT_SECRET=your_production_secret
HUBSPOT_WEBHOOK_SECRET=your_production_webhook_secret
HUBSPOT_ACCESS_TOKEN=your_access_token

# Backend
BACKEND_API_URL=https://api.corsolar.com/v1
BACKEND_API_KEY=your_production_backend_key
BACKEND_TIMEOUT=30000

# Security
JWT_SECRET=generate_strong_random_secret
API_KEY=generate_strong_random_key
ALLOWED_IPS=list_of_allowed_ips
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/worker-hubspot
LOG_MAX_SIZE=20m
LOG_MAX_FILES=30d

# CORS
CORS_ORIGIN=https://corsolar.com,https://app.corsolar.com
CORS_CREDENTIALS=true
```

## Deploy em Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production

# Copiar código fonte
COPY src/ ./src/

# Criar diretório de logs
RUN mkdir -p /app/logs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar aplicação
CMD ["node", "src/server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  worker-hubspot:
    build: .
    container_name: worker-hubspot
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/logs
    networks:
      - corsolar-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  corsolar-network:
    driver: bridge
```

### Comandos Docker

```bash
# Build da imagem
docker build -t worker-hubspot:latest .

# Executar container
docker run -d \
  --name worker-hubspot \
  -p 3000:3000 \
  --env-file .env.production \
  -v $(pwd)/logs:/app/logs \
  worker-hubspot:latest

# Docker Compose
docker-compose up -d

# Ver logs
docker logs -f worker-hubspot

# Parar container
docker stop worker-hubspot

# Remover container
docker rm worker-hubspot
```

## Deploy em AWS

### EC2 com PM2

```bash
# Conectar à instância EC2
ssh -i key.pem ubuntu@ec2-instance

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Clonar repositório
git clone <repository-url> /opt/worker-hubspot
cd /opt/worker-hubspot

# Instalar dependências
npm install --production

# Configurar .env
cp .env.example .env
nano .env

# Iniciar com PM2
pm2 start src/server.js --name worker-hubspot

# Configurar para iniciar no boot
pm2 startup
pm2 save

# Monitorar
pm2 monit
```

### ECS (Elastic Container Service)

```json
{
  "family": "worker-hubspot",
  "containerDefinitions": [
    {
      "name": "worker-hubspot",
      "image": "your-ecr-repo/worker-hubspot:latest",
      "memory": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/worker-hubspot",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Deploy em Azure

### Azure App Service

```bash
# Login
az login

# Criar Resource Group
az group create --name corsolar-rg --location eastus

# Criar App Service Plan
az appservice plan create \
  --name corsolar-plan \
  --resource-group corsolar-rg \
  --sku B1 \
  --is-linux

# Criar Web App
az webapp create \
  --resource-group corsolar-rg \
  --plan corsolar-plan \
  --name worker-hubspot \
  --runtime "NODE|18-lts"

# Configurar variáveis de ambiente
az webapp config appsettings set \
  --resource-group corsolar-rg \
  --name worker-hubspot \
  --settings @appsettings.json

# Deploy do código
az webapp deployment source config-zip \
  --resource-group corsolar-rg \
  --name worker-hubspot \
  --src deploy.zip
```

### Azure Container Instances

```bash
# Criar container registry
az acr create \
  --resource-group corsolar-rg \
  --name corsolarregistry \
  --sku Basic

# Build e push da imagem
az acr build \
  --registry corsolarregistry \
  --image worker-hubspot:latest .

# Deploy do container
az container create \
  --resource-group corsolar-rg \
  --name worker-hubspot \
  --image corsolarregistry.azurecr.io/worker-hubspot:latest \
  --dns-name-label worker-hubspot \
  --ports 3000 \
  --environment-variables @env.json
```

## Deploy em Kubernetes

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: worker-hubspot
  labels:
    app: worker-hubspot
spec:
  replicas: 3
  selector:
    matchLabels:
      app: worker-hubspot
  template:
    metadata:
      labels:
        app: worker-hubspot
    spec:
      containers:
      - name: worker-hubspot
        image: your-registry/worker-hubspot:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: worker-hubspot-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: worker-hubspot-service
spec:
  selector:
    app: worker-hubspot
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```

## Monitoramento e Logs

### PM2 Monitoring

```bash
# Dashboard
pm2 monit

# Logs em tempo real
pm2 logs worker-hubspot

# Informações
pm2 info worker-hubspot

# Métricas
pm2 show worker-hubspot
```

### CloudWatch (AWS)

```javascript
// No código, adicione:
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

// Enviar métrica customizada
const params = {
  MetricData: [
    {
      MetricName: 'RequestCount',
      Dimensions: [
        {
          Name: 'Environment',
          Value: 'Production'
        }
      ],
      Unit: 'Count',
      Value: 1.0,
      Timestamp: new Date()
    }
  ],
  Namespace: 'WorkerHubSpot'
};

cloudwatch.putMetricData(params, (err, data) => {
  if (err) console.error(err);
});
```

## Backup e Recuperação

### Backup de Configurações

```bash
# Backup do .env
cp .env .env.backup.$(date +%Y%m%d)

# Backup dos logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

### Rollback

```bash
# Docker
docker pull worker-hubspot:previous-version
docker stop worker-hubspot
docker rm worker-hubspot
docker run -d --name worker-hubspot worker-hubspot:previous-version

# PM2
pm2 stop worker-hubspot
git checkout previous-commit
npm install
pm2 restart worker-hubspot
```

## SSL/TLS

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.corsolar.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.corsolar.com;

    ssl_certificate /etc/ssl/certs/corsolar.crt;
    ssl_certificate_key /etc/ssl/private/corsolar.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Checklist de Deploy

- [ ] Atualizar dependências
- [ ] Executar testes
- [ ] Verificar vulnerabilidades (npm audit)
- [ ] Configurar variáveis de ambiente de produção
- [ ] Configurar SSL/TLS
- [ ] Configurar logs
- [ ] Configurar monitoramento
- [ ] Configurar backups
- [ ] Testar health check
- [ ] Documentar processo de rollback
- [ ] Notificar equipe

## Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs worker-hubspot --lines 100

# Verificar porta em uso
netstat -tulpn | grep 3000

# Verificar variáveis de ambiente
pm2 env worker-hubspot
```

### Alta utilização de memória

```bash
# Monitorar uso
pm2 monit

# Restart com limite de memória
pm2 restart worker-hubspot --max-memory-restart 500M
```

### Erros de conexão

```bash
# Testar conectividade com backend
curl -X GET $BACKEND_API_URL/health \
  -H "X-API-Key: $BACKEND_API_KEY"

# Testar HubSpot API
curl -X GET https://api.hubapi.com/crm/v3/objects/contacts \
  -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN"
```
