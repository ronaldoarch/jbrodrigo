# 🔧 Solução CORS via Apache .htaccess

## Problema

Os headers CORS não estão sendo enviados mesmo com o código PHP correto. Isso pode acontecer porque:
1. O Apache intercepta requisições OPTIONS antes do PHP
2. Output buffering interfere com os headers
3. Headers podem ser sobrescritos

## Solução: CORS via Apache

Configurei CORS diretamente no Apache usando `.htaccess`, que é mais confiável para requisições OPTIONS.

### Arquivo Criado: `backend/.htaccess`

```apache
# Configuração de CORS via Apache
<IfModule mod_headers.c>
    # Permitir origens específicas
    SetEnvIf Origin "^https?://(tradicaodobicho\.site|www\.tradicaodobicho\.site|dsssg0wkk4cwcgcckkwsco0w\.agenciamidas\.com|localhost(:[0-9]+)?)$" AccessControlAllowOrigin=$0
    Header always set Access-Control-Allow-Origin %{AccessControlAllowOrigin}e env=AccessControlAllowOrigin
    
    # Headers CORS básicos
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Max-Age "86400"
</IfModule>

# Responder requisições OPTIONS diretamente
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

### Vantagens

- ✅ Apache processa CORS antes do PHP
- ✅ Funciona mesmo com output buffering
- ✅ Mais rápido (não precisa executar PHP para OPTIONS)
- ✅ Headers sempre enviados

## Próximo Passo

**Faça redeploy no Coolify** para aplicar esta configuração.

## Teste Após Redeploy

```bash
# Teste OPTIONS (preflight)
curl -v -X OPTIONS \
  https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/auth/register.php \
  -H "Origin: https://tradicaodobicho.site" \
  -H "Access-Control-Request-Method: POST" \
  2>&1 | grep -i "access-control"
```

**Deve mostrar:**
```
< access-control-allow-origin: https://tradicaodobicho.site
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
< access-control-allow-headers: Content-Type, Authorization, X-Requested-With
< access-control-allow-credentials: true
```

## Verificação no Coolify

Após redeploy, verifique se o arquivo existe:

```bash
ls -la /var/www/html/.htaccess
cat /var/www/html/.htaccess
```

## Status

- ✅ `.htaccess` criado com configuração CORS
- ✅ Dockerfile atualizado para copiar `.htaccess`
- ✅ Commitado e no GitHub
- ⏳ Aguardando redeploy no Coolify

## Nota

Esta solução funciona **em conjunto** com o `cors.php`. O Apache processa primeiro, e se não funcionar, o PHP ainda tenta. Isso garante máxima compatibilidade.

