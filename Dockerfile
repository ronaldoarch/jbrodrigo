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

# Habilitar mod_rewrite
RUN a2enmod rewrite

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

# Copiar arquivos da API
COPY api/ /var/www/html/api/

# Verificar se arquivos foram copiados (debug)
RUN ls -la /var/www/html/scraper/config/ || echo "Scraper não encontrado"
RUN ls -la /var/www/html/ || echo "Listando raiz"

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

