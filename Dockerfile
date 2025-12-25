FROM php:7.4-apache

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install pdo pdo_mysql mysqli \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Habilitar mod_rewrite e mod_headers (necessário para CORS)
RUN a2enmod rewrite headers

# Configurar Apache
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html\n\
    <Directory /var/www/html>\n\
        Options -Indexes +FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Copiar arquivos do backend diretamente para raiz
COPY backend/ /var/www/html/

# Garantir que .htaccess do backend seja copiado
COPY backend/.htaccess /var/www/html/.htaccess

# Copiar arquivos da API
COPY api/ /var/www/html/api/

# Criar database.php a partir do exemplo (se não existir)
# Garantir que o diretório existe
RUN mkdir -p /var/www/html/scraper/config

# Criar database.php se não existir
RUN if [ ! -f /var/www/html/scraper/config/database.php ]; then \
    if [ -f /var/www/html/scraper/config/database.example.php ]; then \
        cp /var/www/html/scraper/config/database.example.php /var/www/html/scraper/config/database.php; \
    else \
        echo "<?php function getDB() { throw new Exception('Database not configured'); }" > /var/www/html/scraper/config/database.php; \
    fi \
    fi

# Configurar permissões
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Criar diretório para logs
RUN mkdir -p /var/www/html/logs && chown www-data:www-data /var/www/html/logs

# Expor porta
EXPOSE 80

# Health check - usar endpoint da API que sempre existe
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/api/config.php || exit 1

# Comando padrão
CMD ["apache2-foreground"]

