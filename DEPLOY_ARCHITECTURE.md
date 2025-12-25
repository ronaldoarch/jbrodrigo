# 🏗️ Arquitetura de Deploy Recomendada

## 📊 Comparação de Arquiteturas

### Opção 1: Tudo na Hostinger (Simples)
**Prós:**
- ✅ Mais simples de configurar
- ✅ Custo único
- ✅ Menos latência entre componentes
- ✅ Ideal para começar/testar

**Contras:**
- ❌ Recursos compartilhados limitados
- ❌ Menos escalável
- ❌ Cron jobs podem ser limitados
- ❌ Performance pode ser afetada com muitos usuários

### Opção 2: Distribuído (Recomendado para Produção)
**Frontend → Hostinger**  
**Backend → VPS (DigitalOcean, Linode, etc.)**  
**Banco → Railway/PlanetScale/Supabase**

**Prós:**
- ✅ Melhor performance e escalabilidade
- ✅ Recursos dedicados para cada componente
- ✅ Mais controle sobre o ambiente
- ✅ Banco de dados gerenciado (backups automáticos)
- ✅ Melhor para produção com muitos usuários

**Contras:**
- ❌ Mais complexo de configurar
- ❌ Múltiplos custos
- ❌ Precisa configurar CORS e conectividade entre serviços

## 🎯 Arquitetura Recomendada: Distribuída

```
┌─────────────────┐
│   Frontend      │
│   (Hostinger)   │
│   React SPA     │
└────────┬────────┘
         │ HTTPS
         │ API Calls
         ▼
┌─────────────────┐
│   Backend       │
│   (VPS)         │
│   PHP + Cron    │
└────────┬────────┘
         │ MySQL Connection
         │ (SSL/TLS)
         ▼
┌─────────────────┐
│   Database      │
│   (Railway)     │
│   MySQL         │
└─────────────────┘
```

## 📋 Configuração por Componente

### 1. Frontend na Hostinger

**Estrutura:**
```
public_html/
├── index.html
├── assets/
└── .htaccess
```

**Configuração:**
- Build do React: `npm run build`
- Upload apenas da pasta `dist/` para `public_html/`
- Configurar `.htaccess` para SPA routing
- Configurar variável de ambiente para URL do backend

### 2. Backend no VPS

**Requisitos do VPS:**
- Ubuntu 20.04+ ou Debian 11+
- PHP 7.4+ com extensões necessárias
- Apache/Nginx
- SSH acesso
- Pelo menos 1GB RAM (recomendado 2GB+)

**Estrutura:**
```
/var/www/backend/
├── auth/
├── bets/
├── wallet/
├── cron/
└── ...
```

**Configuração:**
- Upload de toda a pasta `backend/`
- Configurar conexão com banco Railway
- Configurar cron jobs
- Configurar CORS para permitir Hostinger
- Configurar SSL no VPS

### 3. Banco de Dados no Railway

**Vantagens:**
- ✅ Backups automáticos
- ✅ Escalabilidade automática
- ✅ Interface web para gerenciamento
- ✅ Conexão SSL nativa
- ✅ Monitoramento incluído

**Configuração:**
- Criar projeto MySQL no Railway
- Importar `database.sql`
- Obter credenciais de conexão
- Configurar variáveis de ambiente

## 🔧 Configurações Necessárias

### Frontend (Hostinger) - Variáveis de Ambiente

Criar arquivo `.env.production`:

```env
VITE_API_URL=https://backend.seudominio.com.br
```

Ou configurar no build:

```bash
VITE_API_URL=https://backend.seudominio.com.br npm run build
```

### Backend (VPS) - Configuração de CORS

Editar `backend/scraper/config/database.php`:

```php
<?php
// Configuração de CORS
header('Access-Control-Allow-Origin: https://seudominio.com.br');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ... resto do código
```

Ou criar um arquivo `backend/cors.php`:

```php
<?php
function setCorsHeaders() {
    $allowedOrigins = [
        'https://seudominio.com.br',
        'https://www.seudominio.com.br',
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

setCorsHeaders();
```

E incluir em cada endpoint:

```php
require_once __DIR__ . '/../cors.php';
```

### Backend (VPS) - Conexão com Railway

Editar `backend/scraper/config/database.php`:

```php
<?php
function getDB() {
    static $db = null;
    
    if ($db === null) {
        // Credenciais do Railway
        $host = getenv('DB_HOST') ?: 'containers-us-west-xxx.railway.app';
        $port = getenv('DB_PORT') ?: '3306';
        $dbname = getenv('DB_NAME') ?: 'railway';
        $username = getenv('DB_USER') ?: 'root';
        $password = getenv('DB_PASSWORD') ?: 'sua_senha';
        
        try {
            $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
            $db = new PDO(
                $dsn,
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_SSL_CA => '/etc/ssl/certs/ca-certificates.crt', // Para SSL
                ]
            );
        } catch (PDOException $e) {
            error_log("Erro de conexão: " . $e->getMessage());
            throw new Exception("Erro ao conectar ao banco de dados");
        }
    }
    
    return $db;
}
```

### Backend (VPS) - Configuração do Apache/Nginx

**Apache (`/etc/apache2/sites-available/backend.conf`):**

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
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/backend_error.log
    CustomLog ${APACHE_LOG_DIR}/backend_access.log combined
</VirtualHost>
```

**Nginx (`/etc/nginx/sites-available/backend`):**

```nginx
server {
    listen 80;
    server_name backend.seudominio.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name backend.seudominio.com.br;
    
    root /var/www/backend;
    index index.php;
    
    ssl_certificate /etc/letsencrypt/live/backend.seudominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/backend.seudominio.com.br/privkey.pem;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 🚀 Passo a Passo de Deploy

### 1. Configurar Banco no Railway

1. Acesse [railway.app](https://railway.app)
2. Crie novo projeto
3. Adicione serviço MySQL
4. Anote as credenciais de conexão
5. Importe `database.sql` via interface ou CLI

### 2. Configurar VPS

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar PHP e extensões
sudo apt install php7.4 php7.4-fpm php7.4-mysql php7.4-curl php7.4-mbstring php7.4-xml -y

# Instalar Apache/Nginx
sudo apt install apache2 -y
# ou
sudo apt install nginx -y

# Instalar Certbot (SSL)
sudo apt install certbot python3-certbot-apache -y
# ou
sudo apt install certbot python3-certbot-nginx -y

# Criar diretório
sudo mkdir -p /var/www/backend
sudo chown -R $USER:$USER /var/www/backend

# Upload dos arquivos (via SFTP ou Git)
# ...

# Configurar SSL
sudo certbot --apache -d backend.seudominio.com.br
# ou
sudo certbot --nginx -d backend.seudominio.com.br
```

### 3. Configurar Frontend na Hostinger

1. Build do React:
```bash
cd frontend-react
VITE_API_URL=https://backend.seudominio.com.br npm run build
```

2. Upload da pasta `dist/` para `public_html/` na Hostinger

3. Verificar `.htaccess` está configurado

### 4. Configurar Cron Jobs no VPS

```bash
crontab -e
```

Adicionar:
```bash
*/5 * * * * /usr/bin/php /var/www/backend/cron/scheduled-fetch-and-verify.php?token=SEU_TOKEN > /dev/null 2>&1
*/2 * * * * /usr/bin/php /var/www/backend/jobs/process-bet-prizes.php > /dev/null 2>&1
```

## 💰 Estimativa de Custos

### Opção 1: Tudo na Hostinger
- Hostinger: ~R$ 15-30/mês
- **Total: R$ 15-30/mês**

### Opção 2: Distribuído
- Hostinger (Frontend): ~R$ 15/mês
- VPS DigitalOcean: ~$6/mês (~R$ 30/mês)
- Railway MySQL: ~$5/mês (~R$ 25/mês)
- **Total: ~R$ 70/mês**

## ✅ Recomendação Final

**Para começar/testar:** Use tudo na Hostinger (Opção 1)

**Para produção com tráfego:** Use arquitetura distribuída (Opção 2)

A arquitetura distribuída oferece:
- Melhor performance
- Escalabilidade
- Confiabilidade
- Recursos dedicados

Vale o investimento extra se você espera ter muitos usuários simultâneos.

