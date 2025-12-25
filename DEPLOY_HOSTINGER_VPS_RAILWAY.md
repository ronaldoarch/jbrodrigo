# 🚀 Deploy Distribuído: Hostinger + VPS + Railway

Guia completo para deploy com arquitetura distribuída.

## 📋 Visão Geral

- **Frontend (React)**: Hostinger
- **Backend (PHP)**: VPS (DigitalOcean, Linode, etc.)
- **Banco de Dados**: Railway

## 🔧 Passo 1: Configurar Banco no Railway

### 1.1 Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Provision MySQL"

### 1.2 Obter Credenciais

No painel do Railway:
1. Clique no serviço MySQL
2. Vá em "Variables"
3. Anote as seguintes variáveis:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_DATABASE`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`

### 1.3 Importar Estrutura do Banco

**Opção A: Via Railway CLI**

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Linkar projeto
railway link

# Conectar ao MySQL
railway mysql

# Dentro do MySQL:
source database.sql;
```

**Opção B: Via Interface Web**

1. No Railway, clique em "Connect"
2. Use as credenciais para conectar com MySQL Workbench ou DBeaver
3. Importe o arquivo `database.sql`

**Opção C: Via PHPMyAdmin (se disponível)**

1. Configure um túnel SSH se necessário
2. Acesse via interface web
3. Importe `database.sql`

## 🔧 Passo 2: Configurar VPS para Backend

### 2.1 Escolher e Criar VPS

**Recomendações:**
- **DigitalOcean**: $6/mês (1GB RAM) - Bom para começar
- **Linode**: $5/mês (1GB RAM)
- **Vultr**: $6/mês (1GB RAM)
- **Hetzner**: €4/mês (~R$ 20/mês)

**Configuração mínima:**
- 1GB RAM
- 1 vCPU
- 25GB SSD
- Ubuntu 20.04 LTS ou Debian 11

### 2.2 Configuração Inicial do VPS

```bash
# Conectar via SSH
ssh root@seu_vps_ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências
apt install -y \
    php7.4 \
    php7.4-fpm \
    php7.4-mysql \
    php7.4-curl \
    php7.4-mbstring \
    php7.4-xml \
    php7.4-json \
    apache2 \
    certbot \
    python3-certbot-apache \
    git \
    unzip

# Habilitar mod_rewrite
a2enmod rewrite
a2enmod ssl
systemctl restart apache2
```

### 2.3 Configurar Variáveis de Ambiente

```bash
# Criar arquivo de variáveis
nano /etc/environment

# Adicionar (substitua pelos valores do Railway):
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_PORT=3306
MYSQL_DATABASE=railway
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_do_railway
MYSQL_SSL=true

# Recarregar variáveis
source /etc/environment
```

Ou criar arquivo `.env` no diretório do backend:

```bash
cd /var/www/backend
nano .env
```

```env
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_PORT=3306
MYSQL_DATABASE=railway
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_do_railway
MYSQL_SSL=true
```

E modificar `database.php` para ler do `.env`:

```php
// No início do arquivo
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
        putenv(trim($name) . '=' . trim($value));
    }
}
```

### 2.4 Upload do Backend

**Opção A: Via Git**

```bash
cd /var/www
git clone https://github.com/seu-usuario/jbrodrigo.git
mv jbrodrigo/backend backend
chown -R www-data:www-data backend
```

**Opção B: Via SFTP**

1. Use FileZilla ou WinSCP
2. Conecte ao VPS
3. Upload da pasta `backend/` para `/var/www/backend`

### 2.5 Configurar Apache

```bash
nano /etc/apache2/sites-available/backend.conf
```

```apache
<VirtualHost *:80>
    ServerName backend.seudominio.com.br
    Redirect permanent / https://backend.seudominio.com.br/
</VirtualHost>

<VirtualHost *:443>
    ServerName backend.seudominio.com.br
    DocumentRoot /var/www/backend
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/backend.seudominio.com.br/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/backend.seudominio.com.br/privkey.pem
    
    <Directory /var/www/backend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Permitir PHP
        <FilesMatch \.php$>
            SetHandler application/x-httpd-php
        </FilesMatch>
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/backend_error.log
    CustomLog ${APACHE_LOG_DIR}/backend_access.log combined
</VirtualHost>
```

```bash
# Habilitar site
a2ensite backend.conf
systemctl reload apache2

# Configurar SSL
certbot --apache -d backend.seudominio.com.br
```

### 2.6 Configurar CORS

Editar cada arquivo PHP do backend para incluir CORS no início:

```php
<?php
require_once __DIR__ . '/../cors.php';
// ... resto do código
```

Ou criar um `.htaccess` em `/var/www/backend/`:

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://seudominio.com.br"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

### 2.7 Configurar Cron Jobs

```bash
crontab -e
```

Adicionar:

```bash
# Buscar resultados e liquidar apostas (a cada 5 minutos)
*/5 * * * * /usr/bin/php /var/www/backend/cron/scheduled-fetch-and-verify.php?token=SEU_TOKEN_SECRETO > /dev/null 2>&1

# Processar apostas pendentes (a cada 2 minutos)
*/2 * * * * /usr/bin/php /var/www/backend/jobs/process-bet-prizes.php > /dev/null 2>&1
```

## 🔧 Passo 3: Configurar Frontend na Hostinger

### 3.1 Build do Frontend

```bash
cd frontend-react

# Criar arquivo .env.production
echo "VITE_API_URL=https://backend.seudominio.com.br" > .env.production

# Build
npm run build
```

### 3.2 Upload para Hostinger

1. Acesse o painel da Hostinger
2. Vá em File Manager
3. Navegue até `public_html/`
4. Delete arquivos antigos (se houver)
5. Upload do conteúdo de `frontend-react/dist/`:
   - `index.html`
   - Pasta `assets/`
   - `.htaccess`

### 3.3 Verificar .htaccess

Certifique-se que o `.htaccess` está na raiz do `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>
```

## 🔧 Passo 4: Configurar DNS

### 4.1 Registrar Domínio

1. Compre domínio (ex: `seudominio.com.br`)
2. Configure DNS na Hostinger ou registrador

### 4.2 Configurar Registros DNS

**Na Hostinger (ou registrador):**

```
Tipo    Nome              Valor                    TTL
A       @                 IP_DO_VPS                 3600
A       www               IP_DO_VPS                 3600
A       backend           IP_DO_VPS                 3600
CNAME   api               backend.seudominio.com.br 3600
```

**Ou usar Cloudflare (recomendado):**

1. Adicione domínio no Cloudflare
2. Configure DNS:
   - `@` → IP do VPS
   - `www` → IP do VPS
   - `backend` → IP do VPS
3. Ative SSL/TLS (Full)

## ✅ Passo 5: Testes

### 5.1 Testar Backend

```bash
# Testar conexão com banco
curl https://backend.seudominio.com.br/api/extractions-list.php

# Deve retornar JSON com extrações
```

### 5.2 Testar Frontend

1. Acesse `https://seudominio.com.br`
2. Abra Console do navegador (F12)
3. Verifique se não há erros de CORS
4. Teste login/registro

### 5.3 Testar Cron

```bash
# No VPS
cd /var/www/backend/cron
php scheduled-fetch-and-verify.php?token=SEU_TOKEN

# Verificar logs
tail -f /var/log/apache2/backend_error.log
```

## 🔒 Segurança Adicional

### Firewall no VPS

```bash
# Instalar UFW
apt install ufw -y

# Permitir SSH
ufw allow 22/tcp

# Permitir HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Ativar firewall
ufw enable
```

### Restringir Acesso ao MySQL no Railway

1. No Railway, configure "Public Networking" como OFF
2. Use apenas conexões do VPS (IP fixo se possível)

## 📊 Monitoramento

### Logs do Backend

```bash
# Ver logs do Apache
tail -f /var/log/apache2/backend_error.log
tail -f /var/log/apache2/backend_access.log

# Ver logs do PHP
tail -f /var/www/backend/error_log
```

### Monitoramento do Railway

- Acesse dashboard do Railway
- Veja métricas de conexão e uso
- Configure alertas se necessário

## 💰 Custos Estimados

- **Hostinger**: R$ 15-30/mês (Frontend)
- **VPS DigitalOcean**: ~R$ 30/mês (Backend)
- **Railway MySQL**: ~R$ 25/mês (Banco)
- **Total**: ~R$ 70-85/mês

## 🆘 Troubleshooting

### Erro de CORS

- Verifique se `cors.php` está sendo incluído
- Verifique headers no `.htaccess`
- Teste com `curl -H "Origin: https://seudominio.com.br"`

### Erro de Conexão com Banco

- Verifique variáveis de ambiente
- Teste conexão manual: `mysql -h HOST -u USER -p`
- Verifique firewall do Railway

### Cron não executa

- Verifique permissões: `chmod +x arquivo.php`
- Teste manualmente primeiro
- Verifique logs: `grep CRON /var/log/syslog`

## ✅ Checklist Final

- [ ] Banco criado no Railway
- [ ] Estrutura importada (`database.sql`)
- [ ] VPS configurado
- [ ] Backend uploadado
- [ ] Variáveis de ambiente configuradas
- [ ] SSL configurado no VPS
- [ ] CORS configurado
- [ ] Cron jobs configurados
- [ ] Frontend buildado e uploadado na Hostinger
- [ ] DNS configurado
- [ ] Testes realizados
- [ ] Firewall configurado

