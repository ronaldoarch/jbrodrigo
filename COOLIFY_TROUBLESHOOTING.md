# 🔧 Troubleshooting - Backend no Coolify

## 🌐 URL do Backend

**Backend:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com

## ❌ Erro: Bad Gateway (502)

### Possíveis Causas:

1. **Container ainda iniciando**
   - Aguarde 1-2 minutos após deploy
   - Verifique logs no Coolify

2. **Apache não iniciou corretamente**
   - Verifique logs do container no Coolify
   - Verifique se porta 80 está configurada

3. **Healthcheck falhando**
   - Verifique se `/api/config.php` existe
   - Verifique permissões dos arquivos

### Soluções:

#### 1. Verificar Logs no Coolify

No Coolify:
1. Vá em **Logs**
2. Verifique erros do Apache
3. Procure por mensagens de erro

#### 2. Verificar Container via Terminal

No Coolify:
1. Vá em **Terminal**
2. Execute:
```bash
ls -la /var/www/html/
ls -la /var/www/html/api/
curl http://localhost/api/config.php
```

#### 3. Verificar Estrutura de Arquivos

```bash
# No terminal do Coolify
cd /var/www/html
ls -la
# Deve mostrar: api/, auth/, bets/, etc.
```

#### 4. Verificar Apache

```bash
# No terminal do Coolify
apache2ctl status
# ou
ps aux | grep apache
```

#### 5. Verificar Porta

No Coolify:
1. Vá em **Configuration**
2. Verifique **Port**: deve ser `80`
3. Verifique **Expose Port**: deve estar marcado

## ✅ Verificações Básicas

### 1. Variáveis de Ambiente

No Coolify, verifique se estão configuradas:

```env
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=44951
DB_NAME=railway
DB_USER=root
DB_PASSWORD=wktlYoHTkATnPgiUrvSBVkxHcNACjprR
APP_ENV=production
TZ=America/Sao_Paulo
```

**Importante:** Marque `APP_ENV` como **"Runtime only"** para evitar warnings.

### 2. Estrutura de Arquivos

Verifique se os arquivos foram copiados:

```bash
# Deve existir:
/var/www/html/api/config.php
/var/www/html/backend/auth/login.php
/var/www/html/backend/bets/odds.php
```

### 3. Permissões

```bash
# No terminal do Coolify
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

## 🔄 Reiniciar Container

No Coolify:
1. Vá em **Deployments**
2. Clique em **Restart**
3. Aguarde alguns minutos
4. Teste novamente

## 🧪 Testes Manuais

### Teste 1: Verificar se Apache está rodando

```bash
curl http://localhost/
# Deve retornar algo (mesmo que 404)
```

### Teste 2: Verificar API

```bash
curl http://localhost/api/config.php
# Deve retornar JSON
```

### Teste 3: Verificar Backend

```bash
curl http://localhost/backend/bets/odds.php
# Deve retornar JSON com odds
```

## 🔧 Correções Comuns

### Problema: Arquivos não encontrados

**Solução:** Verifique se `.dockerignore` não está ignorando arquivos necessários.

### Problema: Apache não inicia

**Solução:** Verifique logs do Apache:
```bash
tail -f /var/log/apache2/error.log
```

### Problema: Permissões

**Solução:** Execute no Dockerfile ou via terminal:
```bash
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

### Problema: Healthcheck falhando

**Solução:** Desabilite temporariamente no Coolify:
1. Vá em **Configuration**
2. Desabilite **Healthcheck**
3. Deploy novamente

## 📝 Checklist de Debug

- [ ] Container está rodando?
- [ ] Apache está iniciado?
- [ ] Arquivos foram copiados corretamente?
- [ ] Permissões estão corretas?
- [ ] Variáveis de ambiente configuradas?
- [ ] Porta 80 está exposta?
- [ ] Healthcheck passou?
- [ ] Logs não mostram erros?

## 🆘 Se Nada Funcionar

1. **Recriar aplicação no Coolify:**
   - Delete a aplicação atual
   - Crie nova aplicação
   - Configure tudo novamente

2. **Verificar Dockerfile:**
   - Certifique-se que está correto
   - Teste build localmente: `docker build -t test .`

3. **Contatar Suporte:**
   - Coolify: https://coolify.io/docs
   - Verifique documentação oficial

## 🔗 Links Úteis

- **Backend:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com
- **Logs:** Verifique no painel do Coolify
- **Terminal:** Use o terminal do Coolify para debug

