# 📦 Guia de Instalação Completo

## Pré-requisitos

- **Servidor Web**: Apache 2.4+ com mod_rewrite habilitado
- **PHP**: 7.4 ou superior com extensões:
  - pdo_mysql
  - json
  - mbstring
  - curl
  - gd (opcional, para imagens)
- **MySQL/MariaDB**: 5.7+ ou 10.3+
- **Node.js**: 18+ e npm
- **SSL**: Certificado HTTPS (recomendado)

## Passo 1: Configuração do Banco de Dados

### 1.1 Criar Banco de Dados

```sql
CREATE DATABASE jogo_do_bicho CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.2 Importar Estrutura

```bash
mysql -u seu_usuario -p jogo_do_bicho < database.sql
```

### 1.3 Criar Usuário Administrador (Opcional)

```sql
-- Criar usuário admin manualmente ou via registro
-- Depois atualizar:
UPDATE users SET is_admin = TRUE WHERE email = 'admin@exemplo.com';
```

## Passo 2: Configuração do Backend PHP

### 2.1 Configurar Conexão com Banco

Edite `backend/scraper/config/database.php`:

```php
$host = 'localhost';
$dbname = 'jogo_do_bicho';
$username = 'seu_usuario';
$password = 'sua_senha';
```

### 2.2 Configurar Permissões

```bash
chmod 755 backend/
chmod 644 backend/**/*.php
chmod 755 backend/cron/
chmod 755 backend/jobs/
```

### 2.3 Configurar Token do Cron

Edite `backend/cron/scheduled-fetch-and-verify.php`:

```php
$expectedToken = 'SEU_TOKEN_SECRETO_AQUI'; // Altere para um token seguro
```

## Passo 3: Configuração do Frontend React

### 3.1 Instalar Dependências

```bash
cd frontend-react
npm install
```

### 3.2 Configurar URL da API (Opcional)

Crie arquivo `.env`:

```env
VITE_API_URL=https://seudominio.com.br
```

### 3.3 Build para Produção

```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos compilados.

## Passo 4: Deploy no Servidor

### 4.1 Estrutura de Diretórios no Servidor

```
public_html/
├── index.html          # Frontend React (da pasta dist/)
├── assets/            # Assets do React (da pasta dist/)
├── backend/           # Backend PHP
├── api/               # APIs públicas
└── .htaccess          # Configuração Apache
```

### 4.2 Upload de Arquivos

1. **Backend PHP**: Upload de toda a pasta `backend/` para `public_html/backend/`
2. **APIs**: Upload da pasta `api/` para `public_html/api/`
3. **Frontend**: Upload do conteúdo de `frontend-react/dist/` para `public_html/`
4. **.htaccess**: Upload de `public_html/.htaccess` para a raiz

### 4.3 Configurar Permissões no Servidor

```bash
chmod 755 public_html/
chmod 644 public_html/**/*.php
chmod 755 public_html/backend/cron/
chmod 755 public_html/backend/jobs/
```

## Passo 5: Configuração de Cron Jobs

### 5.1 Acessar Crontab

```bash
crontab -e
```

### 5.2 Adicionar Crons

```bash
# Buscar resultados e liquidar apostas (a cada 5 minutos)
*/5 * * * * /usr/bin/php /caminho/completo/public_html/backend/cron/scheduled-fetch-and-verify.php?token=SEU_TOKEN > /dev/null 2>&1

# Processar apostas pendentes (a cada 2 minutos)
*/2 * * * * /usr/bin/php /caminho/completo/public_html/backend/jobs/process-bet-prizes.php > /dev/null 2>&1
```

**Importante**: Substitua `/caminho/completo/` pelo caminho absoluto do seu servidor.

### 5.3 Verificar Crons

```bash
# Listar crons configurados
crontab -l

# Ver logs do cron
tail -f /var/log/cron.log
# ou
tail -f error_log | grep CRON
```

## Passo 6: Configuração do Apache

### 6.1 Verificar mod_rewrite

```bash
# Verificar se está habilitado
apache2ctl -M | grep rewrite

# Se não estiver, habilitar:
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 6.2 Configurar Virtual Host (se necessário)

```apache
<VirtualHost *:80>
    ServerName seudominio.com.br
    DocumentRoot /var/www/public_html
    
    <Directory /var/www/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

## Passo 7: Testes

### 7.1 Testar Backend

```bash
# Testar conexão com banco
php -r "require 'backend/scraper/config/database.php'; echo 'OK';"

# Testar endpoint de autenticação
curl -X POST http://seudominio.com.br/backend/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"senha"}'
```

### 7.2 Testar Frontend

1. Acesse `https://seudominio.com.br`
2. Verifique se a página carrega corretamente
3. Teste registro/login
4. Teste navegação entre páginas

### 7.3 Testar Cron Manualmente

```bash
cd /caminho/public_html/backend/cron
php scheduled-fetch-and-verify.php?token=SEU_TOKEN
```

## Passo 8: Configurações Adicionais

### 8.1 Timezone

Verifique se o PHP está configurado para `America/Sao_Paulo`:

```php
// No php.ini ou .htaccess
date.timezone = America/Sao_Paulo
```

### 8.2 Limites do PHP

Ajuste se necessário:

```ini
memory_limit = 256M
max_execution_time = 180
upload_max_filesize = 10M
post_max_size = 10M
```

### 8.3 Segurança

1. **Altere o token do cron** para algo seguro
2. **Configure HTTPS** (certificado SSL)
3. **Restrinja acesso** aos arquivos de configuração
4. **Configure firewall** para proteger o servidor

## Troubleshooting

### Erro 500 no Backend

- Verifique logs do Apache: `tail -f /var/log/apache2/error.log`
- Verifique permissões dos arquivos
- Verifique sintaxe PHP: `php -l arquivo.php`

### Frontend não carrega

- Verifique se `index.html` está na raiz do `public_html`
- Verifique se `.htaccess` está configurado
- Verifique console do navegador (F12)

### Cron não executa

- Verifique permissões do arquivo PHP
- Verifique se o caminho está correto
- Teste manualmente primeiro
- Verifique logs: `tail -f error_log`

### Erro de CORS

- Configure headers CORS no `.htaccess` ou no PHP
- Verifique se a URL da API está correta

## Suporte

Para problemas específicos, verifique:
1. Logs do servidor (`error_log`)
2. Logs do Apache
3. Console do navegador (F12)
4. Logs do PHP

