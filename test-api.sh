#!/bin/bash

# Script de teste dos endpoints da API

BASE_URL="http://localhost:3000/api"

echo "=================================="
echo "Testando API Worker HubSpot"
echo "=================================="
echo ""

# Teste 1: Health Check
echo "1. Health Check..."
curl -s http://localhost:3000/health | jq .
echo ""

# Teste 2: Buscar produtos
echo "2. Buscando produtos..."
curl -s "$BASE_URL/products?page=1&pageSize=10" | jq .
echo ""

# Teste 3: Exportar produtos para CSV
echo "3. Exportando produtos para CSV..."
EXPORT_RESULT=$(curl -s -X POST "$BASE_URL/products/export" | jq .)
echo "$EXPORT_RESULT"
FILENAME=$(echo "$EXPORT_RESULT" | jq -r '.data.filename')
echo ""

# Teste 4: Enviar contatos do CSV
echo "4. Enviando contatos do CSV..."
curl -s -X POST "$BASE_URL/contacts/send-csv" \
  -H "Content-Type: application/json" \
  -d '{"filename": "contatos.csv"}' | jq .
echo ""

# Teste 5: Enviar contato individual
echo "5. Enviando contato individual..."
curl -s -X POST "$BASE_URL/contacts/send" \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": {
      "nome": "Teste API",
      "email": "teste@api.com",
      "telefone": "11999999999",
      "endereco": "Rua Teste 123",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567",
      "cpf": "000.000.000-00",
      "data_nascimento": "2000-01-01"
    }
  }' | jq .
echo ""

echo "=================================="
echo "Testes concluídos!"
echo "=================================="
