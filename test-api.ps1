# Script de teste dos endpoints da API (PowerShell)

$BASE_URL = "http://localhost:3000/api"

Write-Host "==================================" -ForegroundColor Green
Write-Host "Testando API Worker HubSpot" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Teste 1: Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    $response | ConvertTo-Json
} catch {
    Write-Host "Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 2: Buscar produtos
Write-Host "2. Buscando produtos..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/products?page=1&pageSize=10" -Method Get
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 3: Exportar produtos para CSV
Write-Host "3. Exportando produtos para CSV..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/products/export" -Method Post
    $response | ConvertTo-Json
    $filename = $response.data.filename
} catch {
    Write-Host "Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 4: Enviar contatos do CSV
Write-Host "4. Enviando contatos do CSV..." -ForegroundColor Yellow
try {
    $body = @{
        filename = "contatos.csv"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/contacts/send-csv" -Method Post -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Erro: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 5: Enviar contato individual
Write-Host "5. Enviando contato individual..." -ForegroundColor Yellow
try {
    $body = @{
        contacts = @{
            nome = "Teste API"
            email = "teste@api.com"
            telefone = "11999999999"
            endereco = "Rua Teste 123"
            cidade = "São Paulo"
            estado = "SP"
            cep = "01234-567"
            cpf = "000.000.000-00"
            data_nascimento = "2000-01-01"
        }
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/contacts/send" -Method Post -Body $body -ContentType "application/json"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Erro: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Green
Write-Host "Testes concluídos!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
