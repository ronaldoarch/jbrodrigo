# 🔧 Correção de Sessões Cross-Domain

## Problema Identificado

O login estava funcionando (criando sessão), mas o `/backend/auth/me.php` retornava 401 porque as sessões PHP não funcionam automaticamente entre domínios diferentes.

**Frontend:** `tradicaodobicho.site`  
**Backend:** `dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com`

## Causa

Cookies de sessão PHP não são compartilhados automaticamente entre domínios diferentes, mesmo com `withCredentials: true` no axios.

## Solução Aplicada

Criado `backend/session-config.php` que configura cookies de sessão para funcionar cross-domain:

### Configurações Aplicadas:

```php
ini_set('session.cookie_samesite', 'None');  // Permite cross-domain
ini_set('session.cookie_secure', '1');       // Apenas HTTPS
ini_set('session.cookie_httponly', '1');     // Segurança

session_set_cookie_params([
    'domain' => '',      // Vazio = permite cross-domain
    'secure' => true,    // Apenas HTTPS
    'httponly' => true,
    'samesite' => 'None' // Permite cross-domain
]);
```

### Arquivos Atualizados:

- ✅ `backend/session-config.php` - Criado
- ✅ `backend/auth/login.php` - Inclui session-config.php
- ✅ `backend/auth/register.php` - Inclui session-config.php
- ✅ `backend/auth/logout.php` - Inclui session-config.php
- ✅ `backend/utils/auth-helper.php` - Inclui session-config.php

## Próximo Passo

**Faça redeploy do backend no Coolify** para aplicar a correção.

## Teste Após Redeploy

1. Acesse: https://tradicaodobicho.site/login
2. Faça login com uma conta criada
3. **Deve funcionar agora!**
4. Verifique no console - não deve haver erro 401 em `/backend/auth/me.php`

## Verificação

Após login bem-sucedido, verifique no navegador (DevTools > Application > Cookies):
- Deve haver um cookie `JBRODRIGO_SESSION` 
- Com `SameSite=None` e `Secure=true`

## Status

- ✅ Configuração de sessão cross-domain criada
- ✅ Todos os arquivos de autenticação atualizados
- ✅ Commitado e no GitHub
- ⏳ Aguardando redeploy no Coolify

## Nota Importante

Para que funcione, o backend **deve estar em HTTPS** (já está). Cookies com `SameSite=None` **só funcionam em HTTPS**.

