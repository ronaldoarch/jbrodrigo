# 🔧 Configuração Coolify + Railway MySQL

Guia rápido para configurar o backend no Coolify usando MySQL do Railway.

## 📋 Credenciais do Railway MySQL

Com base nas variáveis de ambiente do Railway:

```
MYSQL_DATABASE: railway
MYSQL_ROOT_PASSWORD: wktlYoHTkATnPgiUrvSBVkxHcNACjprR
MYSQL_HOST: mysql.railway.internal (interno) ou mainline.proxy.rlwy.net (público)
MYSQL_PORT: 3306 (interno) ou 44951 (público)
MYSQL_USER: root
MYSQL_PASSWORD: wktlYoHTkATnPgiUrvSBVkxHcNACjprR
```

## 🚀 Configuração no Coolify

### Passo 1: Criar Aplicação Backend

1. No Coolify, clique em **"New Resource"** → **"Application"**
2. Escolha **"GitHub"** ou **"GitLab"**
3. Repositório: `ronaldoarch/jbrodrigo`
4. Branch: `main`
5. Build Pack: **Docker**
6. Dockerfile Path: `backend/Dockerfile`
7. Port: `80`

### Passo 2: Configurar Variáveis de Ambiente

No Coolify, adicione as seguintes variáveis de ambiente:

```env
# Banco de Dados Railway
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=44951
DB_NAME=railway
DB_USER=root
DB_PASSWORD=wktlYoHTkATnPgiUrvSBVkxHcNACjprR

# Ambiente
APP_ENV=production
TZ=America/Sao_Paulo

# CORS (ajuste com seus domínios)
CORS_ORIGINS=https://seudominio.com.br,https://www.seudominio.com.br
```

**Importante:** 
- Use `mainline.proxy.rlwy.net` para conexão externa (do Coolify)
- Use `mysql.railway.internal` apenas se Coolify e Railway estiverem na mesma rede
- Porta pública: `44951`
- Porta interna: `3306`

### Passo 3: Configurar Domínio

1. No Coolify, vá em **"Domains"**
2. Adicione domínio: `backend.seudominio.com.br`
3. SSL será configurado automaticamente via Let's Encrypt

### Passo 4: Importar Banco de Dados

**Opção A: Via Terminal (Recomendado)**

```bash
# Conectar ao MySQL do Railway
mysql -h mainline.proxy.rlwy.net -P 44951 -u root -p railway

# Quando solicitado, digite a senha:
# wktlYoHTkATnPgiUrvSBVkxHcNACjprR

# Importar estrutura
source database.sql;
```

**Opção B: Via DBeaver/MySQL Workbench**

1. Host: `mainline.proxy.rlwy.net`
2. Port: `44951`
3. Database: `railway`
4. Username: `root`
5. Password: `wktlYoHTkATnPgiUrvSBVkxHcNACjprR`
6. Importe o arquivo `database.sql`

**Opção C: Via PHPMyAdmin no Coolify**

Se você tiver PHPMyAdmin instalado no Coolify, use as mesmas credenciais.

### Passo 5: Verificar Conexão

Após o deploy, teste a conexão:

```bash
# No terminal do container do Coolify
curl http://localhost/api/config.php
```

Ou acesse no navegador:
```
https://backend.seudominio.com.br/api/config.php
```

## 🔒 Segurança

### ⚠️ IMPORTANTE: Proteger Credenciais

1. **Nunca commite** essas credenciais no Git
2. Use **apenas variáveis de ambiente** no Coolify
3. Configure **"Hide value"** nas variáveis sensíveis
4. Considere usar **Railway Private Networking** se possível

### Configurar Variáveis Ocultas no Coolify

1. Ao adicionar variável, marque **"Hide value"**
2. Isso ocultará a senha na interface
3. A senha ainda funcionará normalmente

## 🔧 Atualizar database.php

O arquivo `backend/scraper/config/database.php` já está configurado para usar variáveis de ambiente:

```php
$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$dbname = getenv('DB_NAME') ?: 'seu_banco';
$username = getenv('DB_USER') ?: 'seu_usuario';
$password = getenv('DB_PASSWORD') ?: 'sua_senha';
```

As variáveis serão lidas automaticamente do Coolify!

## 📝 Checklist de Configuração

- [ ] Aplicação backend criada no Coolify
- [ ] Dockerfile configurado (`backend/Dockerfile`)
- [ ] Variáveis de ambiente adicionadas no Coolify
- [ ] Domínio configurado
- [ ] SSL ativado (automático)
- [ ] Banco de dados importado (`database.sql`)
- [ ] Teste de conexão realizado
- [ ] API funcionando (`/api/config.php`)

## 🐛 Troubleshooting

### Erro: "Connection refused"

- Verifique se está usando `mainline.proxy.rlwy.net` (público)
- Verifique porta `44951` (pública)
- Verifique firewall do Railway

### Erro: "Access denied"

- Verifique usuário: `root`
- Verifique senha: `wktlYoHTkATnPgiUrvSBVkxHcNACjprR`
- Verifique se variáveis estão corretas no Coolify

### Erro: "Unknown database"

- Verifique se banco `railway` existe
- Importe `database.sql` se necessário

### Testar Conexão Manualmente

```bash
# No terminal do Coolify ou local
mysql -h mainline.proxy.rlwy.net -P 44951 -u root -p railway

# Senha: wktlYoHTkATnPgiUrvSBVkxHcNACjprR
```

## 🔄 Atualizar Variáveis

Se as credenciais mudarem no Railway:

1. Atualize no Coolify: **Environment Variables**
2. Reinicie a aplicação
3. Teste conexão novamente

## 📚 Próximos Passos

1. Configure frontend no Coolify
2. Configure CORS com domínio do frontend
3. Configure cron jobs no Coolify
4. Teste sistema completo

## 💡 Dicas

- Use **Railway Private Networking** se Coolify e Railway estiverem na mesma infraestrutura
- Configure **backups automáticos** no Railway
- Monitore **logs** no Coolify para debug
- Use **health checks** para monitoramento

