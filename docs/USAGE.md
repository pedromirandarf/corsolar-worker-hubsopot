# Guia de Uso - Worker HubSpot Corsolar

## 🐳 Docker

### Construir e iniciar o container

```bash
# Criar arquivo .env baseado no .env.example
cp .env.example .env

# Editar o .env e adicionar suas credenciais
# Principalmente: BACKEND_API_KEY_SANDBOX

# Construir e iniciar com Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar o container
docker-compose down
```

### Sem Docker

```bash
# Instalar dependências
npm install

# Iniciar a aplicação
npm start

# Ou em modo desenvolvimento
npm run dev
```

## 📦 Endpoints Disponíveis

### Produtos

#### 1. Buscar todos os produtos
```bash
GET http://localhost:3000/api/products

# Com paginação
GET http://localhost:3000/api/products?page=1&pageSize=50
```

#### 2. Exportar produtos para CSV
```bash
POST http://localhost:3000/api/products/export

# Resposta:
{
  "success": true,
  "message": "Produtos exportados com sucesso",
  "data": {
    "filename": "produtos_2026-01-27T10-30-45-123Z.csv",
    "path": "/app/data/produtos_2026-01-27T10-30-45-123Z.csv",
    "total": 50
  }
}
```

#### 3. Download do CSV de produtos
```bash
GET http://localhost:3000/api/products/download/{filename}

# Exemplo:
GET http://localhost:3000/api/products/download/produtos_2026-01-27T10-30-45-123Z.csv
```

### Contatos

#### 1. Enviar contatos do CSV para o backend
```bash
POST http://localhost:3000/api/contacts/send-csv
Content-Type: application/json

{
  "filename": "contatos.csv"
}

# Resposta:
{
  "success": true,
  "message": "Contatos processados",
  "data": {
    "total": 20,
    "successCount": 18,
    "errorCount": 2,
    "results": [...]
  }
}
```

#### 2. Enviar contatos via JSON
```bash
POST http://localhost:3000/api/contacts/send
Content-Type: application/json

{
  "contacts": [
    {
      "nome": "João Silva",
      "email": "joao.silva@email.com",
      "telefone": "11987654321",
      "endereco": "Rua das Flores 123",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567",
      "cpf": "123.456.789-00",
      "data_nascimento": "1985-03-15"
    }
  ]
}
```

## 📄 Formato do CSV de Contatos

O arquivo `data/contatos.csv` deve ter o seguinte formato:

```csv
nome,email,telefone,endereco,cidade,estado,cep,cpf,data_nascimento
João Silva,joao.silva@email.com,11987654321,Rua das Flores 123,São Paulo,SP,01234-567,123.456.789-00,1985-03-15
```

Um arquivo de exemplo já está incluído em `data/contatos.csv` com 20 contatos de teste.

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```bash
# Backend Corsolar Sandbox
BACKEND_API_URL_SANDBOX=https://backend.corsolar.com.br/api
BACKEND_API_KEY_SANDBOX=seu_token_aqui
BACKEND_TIMEOUT_SANDBOX=30000

# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

## 📚 Documentação da API

Acesse a documentação Swagger em:
```
http://localhost:3000/api-docs
```

## 🔍 Health Check

```bash
GET http://localhost:3000/health
```

## 📊 Workflow Completo

### 1. Exportar produtos do backend para CSV
```bash
curl -X POST http://localhost:3000/api/products/export
```

### 2. Enviar contatos do CSV para o backend
```bash
curl -X POST http://localhost:3000/api/contacts/send-csv \
  -H "Content-Type: application/json" \
  -d '{"filename": "contatos.csv"}'
```

### 3. Verificar logs
```bash
# Com Docker
docker-compose logs -f

# Sem Docker
cat logs/application-*.log
```

## 🛠️ Comandos Úteis

```bash
# Verificar status do container
docker-compose ps

# Acessar o container
docker-compose exec corsolar-api sh

# Ver logs em tempo real
docker-compose logs -f corsolar-api

# Reiniciar o container
docker-compose restart

# Limpar tudo e reconstruir
docker-compose down -v
docker-compose up -d --build
```

## 📁 Estrutura de Arquivos

```
data/
  ├── contatos.csv              # CSV com dados de contatos para importação
  └── produtos_*.csv            # CSVs exportados de produtos

logs/
  └── application-*.log         # Logs da aplicação

src/
  ├── controllers/
  │   ├── contact.controller.js # Controller de contatos
  │   └── product.controller.js # Controller de produtos
  ├── services/
  │   ├── contact.service.js    # Lógica de negócio de contatos
  │   └── product.service.js    # Lógica de negócio de produtos
  └── routes/
      ├── contact.routes.js     # Rotas de contatos
      └── product.routes.js     # Rotas de produtos
```

## ⚠️ Notas Importantes

1. O arquivo `contatos.csv` já vem populado com 20 contatos de exemplo
2. Os arquivos CSV exportados ficam salvos em `data/`
3. Todos os logs são salvos em `logs/`
4. O token deve ser configurado em `.env` como `BACKEND_API_KEY_SANDBOX`
5. A aplicação usa o ambiente sandbox: `https://backend.corsolar.com.br/api`
