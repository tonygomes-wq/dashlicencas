# Dockerfile para Dashboard de Licenças - COM BUILD DO FRONTEND
# Stage 1: Build do Frontend React/Vite
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte e arquivos de configuração
COPY src/ ./src/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build do frontend
RUN npm run build

# Stage 2: Servidor PHP/Apache
FROM php:8.2-apache

# Instalar extensões PHP necessárias
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install pdo pdo_mysql mysqli zip

# Habilitar mod_rewrite do Apache
RUN a2enmod rewrite

# Configurar Apache para permitir .htaccess
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar arquivos PHP do backend
COPY --chown=www-data:www-data *.php ./
COPY --chown=www-data:www-data srv/ ./srv/
COPY --chown=www-data:www-data db_init/ ./db_init/

# Copiar arquivos buildados do frontend do stage anterior
COPY --from=frontend-builder --chown=www-data:www-data /app/dist/ ./

# Ajustar permissões
RUN chmod -R 755 /var/www/html

# Expor porta 80
EXPOSE 80

# Comando para iniciar Apache
CMD ["apache2-foreground"]
