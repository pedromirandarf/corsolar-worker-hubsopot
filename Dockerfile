FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --omit=dev

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p logs data

# Expor porta da aplicação
EXPOSE 3000

# Usuário não-root para segurança
USER node

# Comando para iniciar a aplicação
CMD ["npm", "start"]
