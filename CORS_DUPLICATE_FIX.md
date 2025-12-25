# 🔧 Correção de Headers CORS Duplicados

## Problema Identificado

O erro mostrava:
```
The 'Access-Control-Allow-Origin' header contains multiple values 
'https://tradicaodobicho.site, https://tradicaodobicho.site', 
but only one is allowed.
```

## Causa

Tanto o **Apache `.htaccess`** quanto o **PHP `cors.php`** estavam enviando headers CORS, causando duplicação.

## Solução Aplicada

Removido o envio de headers CORS do `cors.php`, deixando apenas o Apache gerenciar via `.htaccess`.

### Por que Apache?

- ✅ Mais rápido (processa antes do PHP)
- ✅ Funciona mesmo com output buffering
- ✅ Não interfere com sessões PHP
- ✅ Mais confiável para requisições OPTIONS

### Arquivo `backend/cors.php` Atualizado

Agora o arquivo não envia headers, apenas mantém compatibilidade para código que ainda o inclui.

## Status dos Logs

Pelos logs, vejo que:
- ✅ Healthcheck passando (200 OK)
- ✅ Banco de dados conectado
- ✅ Registro funcionando (200 OK no POST)
- ✅ CORS funcionando (requisições chegando)

## Próximo Passo

**Faça redeploy no Coolify** para aplicar a correção.

## Teste Após Redeploy

Após redeploy, teste no navegador:
1. Acesse: https://tradicaodobicho.site
2. Tente criar uma conta
3. **Não deve haver erro de CORS duplicado**
4. Deve funcionar normalmente

## Status

- ✅ Headers CORS duplicados removidos
- ✅ Apache gerencia CORS via .htaccess
- ✅ PHP não interfere mais
- ✅ Commitado e no GitHub
- ⏳ Aguardando redeploy no Coolify

