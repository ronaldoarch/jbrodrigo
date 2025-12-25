# 🚀 Deploy no Coolify

Guia completo para deploy do sistema Jogo do Bicho no Coolify.

## 📋 O que é Coolify?

Coolify é uma plataforma de self-hosting que permite fazer deploy de aplicações facilmente, similar ao Heroku mas self-hosted. Suporta PHP, Node.js, Python e muito mais.

## 🏗️ Arquitetura Recomendada no Coolify

### Opção 1: Tudo no Coolify (Recomendado para começar)
- **Frontend (React)**: Aplicação estática no Coolify
- **Backend (PHP)**: Aplicação PHP no Coolify
- **Banco de Dados**: MySQL no Coolify ou Railway

### Opção 2: Híbrida
- **Frontend**: Coolify (estático)
- **Backend**: Coolify (PHP)
- **Banco**: Railway/PlanetScale (externo)

## 🔧 Passo 1: Preparar Arquivos para Coolify

### 1.1 Criar Dockerfile para Backend PHP

Criar arquivo `backend/Dockerfile`:

```dockerfile
FROM php:7.4-apache

# Instalar extensões PHP necessárias
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Habilitar mod_rewrite
RUN a2enmod rewrite

# Copiar arquivos
COPY . /var/www/html/

# Configurar permissões
RUN chown -R www-data:www-data /var/www/html

# Expor porta
EXPOSE 80

# Comando padrão
CMD ["apache2-foreground"]
```

### 1.2 Criar .dockerignore para Backend

Criar arquivo `backend/.dockerignore`:

```
node_modules/
.git/
.gitignore
*.md
.env
.env.local
```

### 1.3 Criar docker-compose.yml (Opcional)

Criar arquivo `docker-compose.yml` na raiz:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:80"
    environment:
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    volumes:
      - ./backend:/var/www/html
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

## 🔧 Passo 2: Configurar Aplicação Backend no Coolify

### 2.1 Criar Nova Aplicação

1. Acesse seu Coolify
2. Clique em "New Resource" → "Application"
3. Escolha "GitHub" ou "GitLab"
4. Selecione o repositório: `ronaldoarch/jbrodrigo`
5. Branch: `main`
6. Build Pack: **PHP** ou **Docker**

### 2.2 Configurações do Backend

**Se usar Build Pack PHP:**
- **Root Directory**: `backend`
- **PHP Version**: `7.4` ou superior
- **Web Directory**: `/` (raiz)

**Se usar Docker:**
- **Dockerfile Path**: `backend/Dockerfile`
- **Docker Compose**: (se usar docker-compose.yml)

### 2.3 Variáveis de Ambiente

Configure no Coolify:

```
DB_HOST=seu_host_mysql
DB_PORT=3306
DB_NAME=jogo_do_bicho
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
APP_ENV=production
```

### 2.4 Configurar Banco de Dados

**Opção A: MySQL no Coolify**
1. Crie novo recurso "Database" → "MySQL"
2. Anote as credenciais
3. Use essas credenciais nas variáveis de ambiente

**Opção B: MySQL Externo (Railway)**
1. Use credenciais do Railway
2. Configure variáveis de ambiente no Coolify

### 2.5 Configurar Apache/PHP

Criar arquivo `backend/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Permitir acesso direto a arquivos
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Redirecionar para index.php se necessário
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

## 🔧 Passo 3: Configurar Frontend no Coolify

### 3.1 Build do Frontend

O Coolify pode fazer build automático ou você pode fazer build local e fazer deploy apenas do `dist/`.

**Opção A: Build Automático no Coolify**

1. Criar nova aplicação "Static Site"
2. Root Directory: `frontend-react`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`

**Opção B: Build Local e Deploy**

```bash
cd frontend-react
npm install
npm run build
# Upload apenas da pasta dist/
```

### 3.2 Configurar Variáveis de Ambiente do Frontend

No Coolify, configure:

```
VITE_API_URL=https://backend.seudominio.com.br
```

Ou configure no build:

```bash
VITE_API_URL=https://backend.seudominio.com.br npm run build
```

### 3.3 Configurar Nginx (se necessário)

Criar arquivo `frontend-react/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /backend {
        proxy_pass http://backend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 Passo 4: Configurar Domínios

### 4.1 Backend

1. No Coolify, vá em "Domains"
2. Adicione domínio: `backend.seudominio.com.br`
3. Configure SSL (Let's Encrypt automático)

### 4.2 Frontend

1. Adicione domínio: `seudominio.com.br`
2. Configure SSL

## 🔧 Passo 5: Configurar Cron Jobs

### 5.1 Via Coolify (Recomendado)

No Coolify, vá em "Scheduled Tasks" e adicione:

**Tarefa 1: Buscar Resultados**
- Command: `php /var/www/html/cron/scheduled-fetch-and-verify.php?token=SEU_TOKEN`
- Schedule: `*/5 * * * *` (a cada 5 minutos)

**Tarefa 2: Processar Apostas**
- Command: `php /var/www/html/jobs/process-bet-prizes.php`
- Schedule: `*/2 * * * *` (a cada 2 minutos)

### 5.2 Via Dockerfile (Alternativa)

Adicionar ao `Dockerfile`:

```dockerfile
# Instalar cron
RUN apt-get update && apt-get install -y cron

# Copiar crontab
COPY crontab /etc/cron.d/jogo-bicho
RUN chmod 0644 /etc/cron.d/jogo-bicho
RUN crontab /etc/cron.d/jogo-bicho

# Iniciar cron
RUN service cron start
```

Criar arquivo `backend/crontab`:

```
*/5 * * * * www-data php /var/www/html/cron/scheduled-fetch-and-verify.php?token=SEU_TOKEN >> /var/log/cron.log 2>&1
*/2 * * * * www-data php /var/www/html/jobs/process-bet-prizes.php >> /var/log/cron.log 2>&1
```

## 🔧 Passo 6: Configurar Banco de Dados

### 6.1 Importar Estrutura

**Via Coolify MySQL:**
1. Acesse o MySQL no Coolify
2. Use phpMyAdmin ou terminal
3. Importe `database.sql`

**Via Terminal:**
```bash
# Conectar ao MySQL do Coolify
mysql -h HOST -u USER -p DATABASE < database.sql
```

### 6.2 Configurar Conexão

Editar `backend/scraper/config/database.php` para usar variáveis de ambiente:

```php
$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$dbname = getenv('DB_NAME') ?: 'jogo_do_bicho';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';
```

## 🔧 Passo 7: Deploy

### 7.1 Deploy do Backend

1. No Coolify, clique em "Deploy"
2. Aguarde build completar
3. Verifique logs se houver erros

### 7.2 Deploy do Frontend

1. Se build automático: Coolify fará automaticamente
2. Se build manual: Upload da pasta `dist/`

## 🔧 Passo 8: Configurar CORS

O arquivo `backend/cors.php` já está configurado. Certifique-se de atualizar com seus domínios:

```php
$allowedOrigins = [
    'https://seudominio.com.br',
    'https://www.seudominio.com.br',
    'https://backend.seudominio.com.br',
];
```

## ✅ Checklist de Deploy

- [ ] Backend configurado no Coolify
- [ ] Frontend configurado no Coolify
- [ ] Banco de dados criado e configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Domínios configurados
- [ ] SSL configurado (automático no Coolify)
- [ ] Cron jobs configurados
- [ ] CORS configurado
- [ ] Testes realizados

## 🐛 Troubleshooting

### Erro de conexão com banco

- Verifique variáveis de ambiente
- Verifique se MySQL está acessível
- Verifique firewall/network do Coolify

### Erro 404 no backend

- Verifique configuração do Apache
- Verifique `.htaccess`
- Verifique root directory no Coolify

### Cron não executa

- Verifique configuração de scheduled tasks
- Verifique permissões dos arquivos PHP
- Verifique logs: `docker logs CONTAINER_ID`

### CORS errors

- Verifique `cors.php` com domínios corretos
- Verifique headers no Apache/Nginx
- Verifique se frontend está chamando URL correta

## 📚 Recursos Adicionais

- [Documentação Coolify](https://coolify.io/docs)
- [Coolify GitHub](https://github.com/coollabsio/coolify)

## 💡 Dicas

1. **Use variáveis de ambiente** para todas as configurações sensíveis
2. **Configure backups** do banco de dados
3. **Monitore logs** regularmente
4. **Use SSL sempre** (Coolify faz isso automaticamente)
5. **Configure health checks** no Coolify

