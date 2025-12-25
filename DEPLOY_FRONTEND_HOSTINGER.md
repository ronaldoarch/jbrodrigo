# 🚀 Deploy do Frontend na Hostinger

Guia completo para fazer deploy do frontend React na Hostinger.

## 📋 Pré-requisitos

- ✅ Backend já funcionando no Coolify
- ✅ URL do backend: `https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com`
- ✅ Acesso SSH à Hostinger
- ✅ Node.js instalado localmente (para build)

## 🔧 Passo 1: Build do Frontend

### No seu computador:

```bash
cd frontend-react

# Configurar URL do backend
echo "VITE_API_URL=https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com" > .env.production

# Build para produção
npm run build
```

Isso criará a pasta `dist/` com os arquivos compilados.

## 🔧 Passo 2: Upload para Hostinger

### Opção A: Via SFTP (FileZilla - Recomendado)

1. **Abrir FileZilla**
2. **Conectar:**
   - Host: `212.85.6.24`
   - Porta: `65002`
   - Protocolo: `SFTP`
   - Usuário: `u127271520`
   - Senha: `2403Auror@`

3. **Navegar até:**
   - `domains/tradicaodobicho.site/public_html/`

4. **Upload:**
   - Upload de **TODO o conteúdo** de `frontend-react/dist/`:
     - `index.html`
     - Pasta `assets/` (completa)
     - `.htaccess`

5. **Verificar estrutura:**
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-xxxxx.js
   │   ├── index-xxxxx.css
   │   └── ...
   └── .htaccess
   ```

### Opção B: Via SCP (Linha de Comando)

```bash
# Do seu computador
cd frontend-react/dist

# Upload via SCP
scp -P 65002 -r * u127271520@212.85.6.24:domains/tradicaodobicho.site/public_html/
scp -P 65002 .htaccess u127271520@212.85.6.24:domains/tradicaodobicho.site/public_html/
```

### Opção C: Via SSH + Git

```bash
# Conectar via SSH
ssh -p 65002 u127271520@212.85.6.24

# Navegar para public_html
cd domains/tradicaodobicho.site/public_html

# Limpar arquivos antigos (cuidado!)
rm -rf assets/ index.html

# Clonar repositório temporariamente
cd ..
git clone https://github.com/ronaldoarch/jbrodrigo.git temp
cd temp/frontend-react

# Build no servidor (se Node.js estiver instalado)
npm install
VITE_API_URL=https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com npm run build

# Copiar arquivos
cp -r dist/* ../public_html/
cp .htaccess ../public_html/

# Limpar
cd ../..
rm -rf temp
```

## 🔧 Passo 3: Verificar .htaccess

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

## 🔧 Passo 4: Configurar Permissões

Via SSH:

```bash
ssh -p 65002 u127271520@212.85.6.24

cd domains/tradicaodobicho.site/public_html

# Configurar permissões
chmod 644 index.html
chmod 644 .htaccess
chmod -R 755 assets/
```

## 🔧 Passo 5: Configurar CORS no Backend

Edite `backend/cors.php` para incluir o domínio da Hostinger:

```php
$allowedOrigins = [
    'https://tradicaodobicho.site',
    'https://www.tradicaodobicho.site',
    'https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com',
    'http://localhost:3000', // Para desenvolvimento
    'http://localhost:5173', // Vite dev server
];
```

**Importante:** Faça commit e push dessa mudança, depois faça redeploy no Coolify.

## ✅ Passo 6: Testar

1. **Acesse:** `https://tradicaodobicho.site`
2. **Abra Console (F12)** e verifique:
   - Não deve haver erros de CORS
   - Requisições devem funcionar
   - API deve responder corretamente

3. **Teste funcionalidades:**
   - Login/Registro
   - Navegação entre páginas
   - Carregamento de dados da API

## 🔄 Atualizar Frontend (Futuro)

Quando fizer mudanças no frontend:

```bash
# No seu computador
cd frontend-react
npm run build

# Upload apenas dos arquivos alterados
# Ou fazer upload completo da pasta dist/
```

## 🐛 Troubleshooting

### Erro 404 nas rotas

- Verifique se `.htaccess` está configurado
- Verifique se `mod_rewrite` está habilitado (geralmente já está na Hostinger)

### Erro de CORS

- Verifique `backend/cors.php` no Coolify
- Certifique-se de que o domínio está na lista de permitidos
- Faça redeploy do backend após alterar CORS

### Arquivos não aparecem

- Verifique permissões: `chmod 755 assets/`
- Verifique se upload foi completo
- Limpe cache do navegador

### API não responde

- Verifique URL no `.env.production`
- Teste API diretamente: `curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/config.php`
- Verifique console do navegador (F12)

## 📝 Checklist

- [ ] Frontend buildado com URL correta do backend
- [ ] Arquivos uploadados para `public_html/`
- [ ] `.htaccess` configurado
- [ ] Permissões corretas
- [ ] CORS configurado no backend
- [ ] SSL ativado na Hostinger
- [ ] Site funcionando
- [ ] Testes realizados

## 🎯 Estrutura Final

```
Hostinger (public_html/)
├── index.html          ← Frontend React
├── assets/             ← JS, CSS, imagens
└── .htaccess           ← Configuração Apache

Coolify (Backend)
└── https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com
    ├── /api/           ← APIs públicas
    └── /backend/       ← APIs privadas

Railway (MySQL)
└── mainline.proxy.rlwy.net:44951
```

## 🚀 Pronto!

Agora você tem:
- ✅ Frontend na Hostinger
- ✅ Backend no Coolify
- ✅ Banco no Railway

Sistema completo e funcionando!
