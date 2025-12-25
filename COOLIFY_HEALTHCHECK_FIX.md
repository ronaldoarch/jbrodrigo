# 🔧 Correção: Healthcheck falhando (404 Not Found)

## ❌ Problema

O healthcheck está falhando com erro 404:
```
curl: (22) The requested URL returned error: 404 Not Found
GET /api/config.php HTTP/1.1" 404
```

## ✅ Solução

O Dockerfile agora copia tanto `backend/` quanto `api/` para o container.

### Mudanças no Dockerfile:

1. ✅ Adicionado: `COPY api/ /var/www/html/api/`
2. ✅ Healthcheck ajustado para usar endpoint correto
3. ✅ Start period aumentado para 40s (tempo para Apache iniciar)

## 🚀 Deploy Novamente

1. No Coolify, clique em **Deploy**
2. Aguarde o build completar
3. O healthcheck deve passar agora

## 🔍 Verificação

Após deploy bem-sucedido, teste:

```bash
# Testar API
curl https://backend.seudominio.com.br/api/config.php

# Deve retornar JSON:
# {"success":true,"config":{...}}
```

## 🐛 Se ainda falhar

### Opção 1: Desabilitar Healthcheck Temporariamente

No Coolify:
1. Vá em **Configuration**
2. Desabilite **Healthcheck**
3. Deploy novamente
4. Teste manualmente depois

### Opção 2: Usar Endpoint Alternativo

Se `/api/config.php` ainda não funcionar, podemos usar outro endpoint:

```dockerfile
# No Dockerfile, alterar healthcheck para:
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/backend/bets/odds.php || exit 1
```

### Opção 3: Verificar Estrutura no Container

Conectar ao container e verificar:

```bash
# No Coolify, vá em Terminal
ls -la /var/www/html/
ls -la /var/www/html/api/
```

## ✅ Checklist

- [ ] Dockerfile atualizado com `COPY api/`
- [ ] Healthcheck configurado corretamente
- [ ] Deploy realizado
- [ ] Healthcheck passou
- [ ] API testada manualmente

