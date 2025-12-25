# 🔧 Troubleshooting CORS

## Problema Atual

Os headers CORS não estão sendo retornados nas respostas do backend.

## Diagnóstico

### 1. Verificar se o arquivo cors.php existe
```bash
ls -la backend/cors.php
```

### 2. Verificar se está sendo incluído
Todos os arquivos de autenticação incluem:
```php
require_once __DIR__ . '/../cors.php';
```

### 3. Testar CORS diretamente

Após redeploy no Coolify, teste:

```bash
# Teste OPTIONS (preflight)
curl -v -X OPTIONS \
  https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/test-cors.php \
  -H "Origin: https://tradicaodobicho.site" \
  -H "Access-Control-Request-Method: GET"

# Deve retornar:
# Access-Control-Allow-Origin: https://tradicaodobicho.site
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
# Access-Control-Allow-Credentials: true
```

### 4. Verificar no navegador

Após redeploy, abra o console (F12) e verifique:
- Não deve haver erros de CORS
- As requisições devem funcionar

## Solução

### Passo 1: Redeploy no Coolify
**IMPORTANTE:** Faça redeploy do backend no Coolify para aplicar as mudanças de CORS.

### Passo 2: Testar após redeploy

```bash
# Teste de CORS
curl -v https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/test-cors.php \
  -H "Origin: https://tradicaodobicho.site"

# Teste de registro
curl -v -X POST \
  https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/auth/register.php \
  -H "Origin: https://tradicaodobicho.site" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456","cpf":"12345678901","phone":"11999999999"}'
```

### Passo 3: Verificar logs

Se ainda não funcionar, verifique os logs do Coolify:
- Acesse logs do container
- Procure por erros relacionados a CORS ou headers

## Possíveis Causas

1. **Backend não foi redeployado** - Mudanças não aplicadas
2. **Headers já enviados** - Algum código está enviando headers antes do CORS
3. **Apache bloqueando** - Configuração do Apache pode estar interferindo
4. **Cache** - Navegador pode estar usando cache antigo

## Solução Alternativa: CORS via .htaccess

Se o CORS via PHP não funcionar, podemos configurar via `.htaccess`:

```apache
<IfModule mod_headers.c>
    SetEnvIf Origin "^https?://(tradicaodobicho\.site|www\.tradicaodobicho\.site)$" AccessControlAllowOrigin=$0
    Header always set Access-Control-Allow-Origin %{AccessControlAllowOrigin}e env=AccessControlAllowOrigin
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>
```

## Status

- ✅ Código corrigido
- ✅ Arquivo de teste criado
- ⏳ Aguardando redeploy no Coolify
- ⏳ Aguardando testes após redeploy

