# Usar imagem Node.js Alpine (mais leve)
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar TODAS as dependências
RUN npm ci

# Copiar código fonte
COPY src ./src

# Build do TypeScript
RUN npm run build

# Verificar se dist foi criado (debug)
RUN ls -la && ls -la dist || echo "Dist não existe!"

# Remover devDependencies
RUN npm prune --omit=dev

# Expor porta
EXPOSE 3001

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar aplicação
CMD ["node", "dist/server.js"]
