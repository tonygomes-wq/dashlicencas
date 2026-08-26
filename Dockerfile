# Dockerfile para Dashboard de Licenças - COM BUILD DO FRONTEND + Sistema de Relatórios Bitdefender
# Versão: 2.0 - Atualizado em 26/08/2026
# Novidades: Suporte a geração de relatórios PDF/CSV, agendamentos automáticos

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

# Metadados da imagem
LABEL maintainer="Equipe de Desenvolvimento"
LABEL version="2.0"
LABEL description="Dashboard de Licenças com Sistema de Relatórios Bitdefender GravityZone"

# Instalar extensões PHP necessárias + Cron para agendamentos
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    cron \
    vim \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install pdo pdo_mysql mysqli zip mbstring \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Habilitar mod_rewrite do Apache
RUN a2enmod rewrite

# Configurar Apache para permitir .htaccess
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Aumentar limites PHP para upload de relatórios grandes
RUN echo "upload_max_filesize = 50M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 50M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar arquivos PHP do backend
COPY --chown=www-data:www-data *.php ./
COPY --chown=www-data:www-data srv/ ./srv/
COPY --chown=www-data:www-data db_init/ ./db_init/
COPY --chown=www-data:www-data docs/ ./docs/

# Copiar arquivos buildados do frontend do stage anterior
COPY --from=frontend-builder --chown=www-data:www-data /app/dist/ ./

# Criar diretório de storage para relatórios
RUN mkdir -p /var/www/html/storage/reports/bitdefender \
    && mkdir -p /var/www/html/storage/logs \
    && chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 755 /var/www/html/storage

# Criar diretório para logs de cron
RUN mkdir -p /var/log/bitdefender \
    && chown www-data:www-data /var/log/bitdefender

# Criar script de cron para agendamentos de relatórios
RUN echo '#!/bin/bash\n\
# Executar agendamentos de relatórios Bitdefender a cada 5 minutos\n\
*/5 * * * * www-data /usr/local/bin/php /var/www/html/cron_execute_report_schedules.php >> /var/log/bitdefender/cron.log 2>&1\n\
' > /etc/cron.d/bitdefender-reports \
    && chmod 0644 /etc/cron.d/bitdefender-reports \
    && crontab /etc/cron.d/bitdefender-reports

# Criar script de inicialização que inicia Apache + Cron
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Iniciar cron em background\n\
echo "Iniciando serviço de cron para agendamentos..."\n\
cron\n\
\n\
# Verificar se diretórios existem\n\
if [ ! -d "/var/www/html/storage/reports/bitdefender" ]; then\n\
    mkdir -p /var/www/html/storage/reports/bitdefender\n\
    chown www-data:www-data /var/www/html/storage/reports/bitdefender\n\
fi\n\
\n\
echo "Sistema de Relatórios Bitdefender: PRONTO"\n\
echo "Storage: /var/www/html/storage/reports/bitdefender"\n\
echo "Logs de Cron: /var/log/bitdefender/cron.log"\n\
\n\
# Iniciar Apache em foreground\n\
exec apache2-foreground\n\
' > /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

# Ajustar permissões
RUN chmod -R 755 /var/www/html

# Health check para verificar se o Apache está respondendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Expor porta 80
EXPOSE 80

# Usar script de inicialização customizado
CMD ["/usr/local/bin/docker-entrypoint.sh"]
