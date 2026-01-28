# Comandos de Teste - Worker HubSpot Corsolar

## 🚀 Status do Container

```powershell
# Ver status
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver últimas 50 linhas de log
docker-compose logs --tail=50
```

## 🧪 Testar Endpoints (de dentro do container)

### 1. Health Check
```powershell
docker exec corsolar-worker wget -qO- http://localhost:3000/health
```

### 2. Buscar Produtos
```powershell
docker exec corsolar-worker wget -qO- "http://localhost:3000/api/products?pageSize=5"
```

### 3. Exportar Produtos para CSV
```powershell
docker exec corsolar-worker wget -qO- --post-data="" http://localhost:3000/api/products/export
```

### 4. Enviar Contatos do CSV
```powershell
docker exec corsolar-worker wget -qO- --header="Content-Type: application/json" --post-data='{\"filename\":\"contatos.csv\"}' http://localhost:3000/api/contacts/send-csv
```

### 5. Enviar Contato Individual
```powershell
$body = @'
{
  "contacts": {
    "nome": "Teste Docker",
    "email": "teste@docker.com",
    "telefone": "11999999999",
    "endereco": "Rua Teste 123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567",
    "cpf": "000.000.000-00",
    "data_nascimento": "2000-01-01"
  }
}
'@

docker exec corsolar-worker wget -qO- --header="Content-Type: application/json" --post-data="$body" http://localhost:3000/api/contacts/send
```

## 🌐 Testar do Host (via navegador ou Postman)

A aplicação está exposta em: `http://localhost:3000`

### Endpoints disponíveis:

- **Health Check**: GET http://localhost:3000/health
- **Documentação API**: http://localhost:3000/api-docs
- **Buscar Produtos**: GET http://localhost:3000/api/products
- **Exportar Produtos**: POST http://localhost:3000/api/products/export
- **Enviar Contatos CSV**: POST http://localhost:3000/api/contacts/send-csv
- **Enviar Contatos JSON**: POST http://localhost:3000/api/contacts/send

## 📁 Acessar Arquivos Gerados

```powershell
# Listar CSVs gerados
docker exec corsolar-worker ls -la /app/data/

# Ver conteúdo do CSV de contatos
docker exec corsolar-worker cat /app/data/contatos.csv

# Copiar CSV do container para o host
docker cp corsolar-worker:/app/data/produtos_XXXXX.csv ./
```

## 🔍 Debug

```powershell
# Acessar o shell do container
docker exec -it corsolar-worker sh

# Ver variáveis de ambiente
docker exec corsolar-worker env | grep BACKEND

# Ver logs de erro
docker-compose logs | Select-String "error" -CaseSensitive

# Reiniciar container
docker-compose restart

# Reconstruir e reiniciar
docker-compose up -d --build
```

## 🛑 Parar e Limpar

```powershell
# Parar container
docker-compose stop

# Parar e remover
docker-compose down

# Parar e remover incluindo volumes
docker-compose down -v
```

## 📊 Exemplo de Teste Completo

```powershell
# 1. Verificar status
docker-compose ps

# 2. Testar health check
docker exec corsolar-worker wget -qO- http://localhost:3000/health

# 3. Exportar produtos
Write-Host "`n=== Exportando Produtos ===`n"
docker exec corsolar-worker wget -qO- --post-data="" http://localhost:3000/api/products/export | ConvertFrom-Json | ConvertTo-Json

# 4. Enviar contatos
Write-Host "`n=== Enviando Contatos do CSV ===`n"
docker exec corsolar-worker wget -qO- --header="Content-Type: application/json" --post-data='{\"filename\":\"contatos.csv\"}' http://localhost:3000/api/contacts/send-csv | ConvertFrom-Json | ConvertTo-Json

# 5. Ver logs
Write-Host "`n=== Últimos Logs ===`n"
docker-compose logs --tail=20
```

## ⚙️ Configuração

Antes de usar, certifique-se de configurar o `.env`:

```bash
BACKEND_API_KEY_SANDBOX=seu_token_aqui
```

Depois reinicie o container:

```powershell
docker-compose restart
```
