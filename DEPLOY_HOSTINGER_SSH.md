# 🚀 Deploy na Hostinger via SSH

Guia específico para deploy do frontend na Hostinger usando acesso SSH.

## 📋 Credenciais SSH

- **IP:** `212.85.6.24`
- **Porta:** `65002`
- **Usuário:** `u127271520`
- **Senha:** `2403Auror@`
- **Comando SSH:** `ssh -p 65002 u127271520@212.85.6.24`

## 🔧 Passo 1: Conectar via SSH

### No Terminal (Mac/Linux):

```bash
ssh -p 65002 u127271520@212.85.6.24
```

Quando solicitado, digite a senha: `2403Auror@`

### No Windows (PowerShell ou Git Bash):

```bash
ssh -p 65002 u127271520@212.85.6.24
```

Ou use um cliente SSH como:
- **PuTTY** (Windows)
- **WinSCP** (Windows - com interface gráfica)
- **FileZilla** (Windows/Mac - SFTP)

## 🔧 Passo 2: Preparar Frontend Localmente

### 2.1 Build do Frontend

No seu computador local:

```bash
cd frontend-react

# Criar arquivo .env.production com URL do backend
echo "VITE_API_URL=https://backend.seudominio.com.br" > .env.production

# Ou se backend estiver na mesma Hostinger:
echo "VITE_API_URL=https://seudominio.com.br/backend" > .env.production

# Build para produção
npm run build
```

Isso criará a pasta `dist/` com os arquivos compilados.

## 🔧 Passo 3: Upload dos Arquivos

### Opção A: Via SFTP (Recomendado - Interface Gráfica)

1. **Usando FileZilla:**
   - Host: `212.85.6.24`
   - Porta: `65002`
   - Protocolo: `SFTP`
   - Usuário: `u127271520`
   - Senha: `2403Auror@`
   - Conectar

2. Navegue até `domains/tradicaodobicho.site/public_html/`
3. Delete arquivos antigos (se houver)
4. Upload do conteúdo de `frontend-react/dist/`:
   - `index.html`
   - Pasta `assets/`
   - `.htaccess`

### Opção B: Via SCP (Linha de Comando)

```bash
# Do diretório do projeto
cd frontend-react/dist

# Upload via SCP
scp -P 65002 -r * u127271520@212.85.6.24:domains/tradicaodobicho.site/public_html/
```

### Opção C: Via SSH + Git

```bash
# Conectar via SSH
ssh -p 65002 u127271520@212.85.6.24

# Navegar para public_html
cd domains/tradicaodobicho.site/public_html

# Clonar repositório (se usar Git)
git clone https://github.com/seu-usuario/jbrodrigo.git temp
cd temp/frontend-react
npm install
npm run build
cp -r dist/* ../../
cd ../..
rm -rf temp
```

## 🔧 Passo 4: Verificar Estrutura de Arquivos

Após upload, a estrutura deve ser:

```
domains/tradicaodobicho.site/public_html/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   ├── index-xxxxx.css
│   └── ...
└── .htaccess
```

## 🔧 Passo 5: Configurar .htaccess

Certifique-se de que o `.htaccess` está na raiz do `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Permitir acesso direto a arquivos e diretórios existentes
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Redirecionar para backend se começar com /backend ou /api
  RewriteCond %{REQUEST_URI} ^/(backend|api)/
  RewriteRule ^(.*)$ - [L]
  
  # Para todas as outras requisições, redirecionar para index.html (SPA)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>

# Configurações de segurança
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Compressão GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

## 🔧 Passo 6: Configurar Permissões

Via SSH:

```bash
ssh -p 65002 u127271520@212.85.6.24

cd domains/tradicaodobicho.site/public_html

# Dar permissões corretas
chmod 644 index.html
chmod 644 .htaccess
chmod -R 755 assets/
```

## 🔧 Passo 7: Upload do Backend (Se na mesma Hostinger)

Se você decidir manter backend na Hostinger também:

```bash
# Via SFTP, criar estrutura:
domains/tradicaodobicho.site/
├── public_html/          # Frontend React
│   ├── index.html
│   └── assets/
└── backend/              # Backend PHP
    ├── auth/
    ├── bets/
    └── ...
```

Ou via SSH:

```bash
ssh -p 65002 u127271520@212.85.6.24

cd domains/tradicaodobicho.site

# Criar diretório backend
mkdir -p backend

# Upload via SCP (do seu computador):
# scp -P 65002 -r backend/* u127271520@212.85.6.24:domains/tradicaodobicho.site/backend/
```

## 🔧 Passo 8: Configurar Banco de Dados

### Se usar MySQL da Hostinger:

1. Acesse o painel da Hostinger
2. Vá em "Bancos de Dados MySQL"
3. Crie novo banco de dados
4. Anote as credenciais:
   - Host: `localhost` (geralmente)
   - Nome do banco: `u127271520_jogo_bicho` (exemplo)
   - Usuário: `u127271520_admin` (exemplo)
   - Senha: (a que você configurou)

5. Edite `backend/scraper/config/database.php`:

```php
$host = 'localhost';
$dbname = 'u127271520_jogo_bicho'; // Seu banco real
$username = 'u127271520_admin';    // Seu usuário real
$password = 'sua_senha_mysql';     // Sua senha MySQL
```

6. Importar estrutura:

```bash
ssh -p 65002 u127271520@212.85.6.24

cd domains/tradicaodobicho.site/backend

# Via linha de comando MySQL
mysql -u u127271520_admin -p u127271520_jogo_bicho < /caminho/local/database.sql
```

Ou via phpMyAdmin no painel da Hostinger.

## 🔧 Passo 9: Configurar Variáveis de Ambiente

### Para Frontend (Build):

Edite antes do build:

```bash
# .env.production
VITE_API_URL=https://tradicaodobicho.site/backend
# ou
VITE_API_URL=https://backend.tradicaodobicho.site
```

### Para Backend (PHP):

Se backend estiver na Hostinger, configure em `backend/scraper/config/database.php` diretamente.

## 🔧 Passo 10: Testar Deploy

1. **Acesse o site:** `https://tradicaodobicho.site`
2. **Verifique Console do Navegador (F12):**
   - Não deve haver erros de CORS
   - Requisições devem funcionar
3. **Teste funcionalidades:**
   - Login/Registro
   - Navegação entre páginas
   - Carregamento de dados

## 🔧 Passo 11: Configurar SSL (HTTPS)

A Hostinger geralmente configura SSL automaticamente via Let's Encrypt. Verifique no painel:

1. Acesse "SSL" no painel
2. Ative SSL gratuito
3. Aguarde alguns minutos para propagação

## 🐛 Troubleshooting

### Erro 404 em rotas do React

- Verifique se `.htaccess` está configurado
- Verifique se `mod_rewrite` está habilitado (geralmente já está na Hostinger)

### Erro de CORS

- Se backend estiver na mesma Hostinger: `VITE_API_URL=https://tradicaodobicho.site/backend`
- Se backend estiver em VPS separado: Configure CORS no backend

### Arquivos não aparecem

- Verifique permissões: `chmod 755` para diretórios, `chmod 644` para arquivos
- Verifique se upload foi completo

### Erro de conexão com banco

- Verifique credenciais em `database.php`
- Verifique se banco foi criado no painel
- Teste conexão via phpMyAdmin

## 📝 Checklist Final

- [ ] Frontend buildado (`npm run build`)
- [ ] Arquivos uploadados para `public_html/`
- [ ] `.htaccess` configurado
- [ ] Permissões corretas
- [ ] Backend configurado (se na Hostinger)
- [ ] Banco de dados criado e importado
- [ ] SSL ativado
- [ ] Testes realizados
- [ ] Site funcionando

## 🔐 Segurança

- ✅ Use HTTPS sempre
- ✅ Mantenha senhas seguras
- ✅ Não commite credenciais no Git
- ✅ Use `.env` para variáveis sensíveis
- ✅ Mantenha backups regulares

## 📞 Suporte Hostinger

Se precisar de ajuda:
- Painel: https://hpanel.hostinger.com.br
- Suporte: Via chat no painel
- Documentação: https://support.hostinger.com/pt-br

