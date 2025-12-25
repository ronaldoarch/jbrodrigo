# 🔧 Correção de Erros 404 nos Endpoints

## Problema Identificado

Os endpoints do backend estavam retornando **404 Not Found**:
- `/backend/auth/register.php` → 404
- `/backend/auth/me.php` → 404

## Causa

O Dockerfile estava copiando `backend/` para `/var/www/html/`, fazendo com que os arquivos ficassem em:
- `/var/www/html/auth/` (errado)
- `/var/www/html/bets/` (errado)

Mas o frontend esperava:
- `/var/www/html/backend/auth/` (correto)
- `/var/www/html/backend/bets/` (correto)

## Solução Aplicada

### 1. Corrigido Dockerfile

**Antes:**
```dockerfile
COPY backend/ /var/www/html/
```

**Depois:**
```dockerfile
COPY backend/ /var/www/html/backend/
```

### 2. Criado .htaccess na Raiz

Criado `.htaccess` na raiz do projeto para aplicar CORS globalmente.

### 3. Estrutura Correta Agora

```
/var/www/html/
├── .htaccess          ← CORS global
├── index.php          ← Página inicial da API
├── backend/
│   ├── .htaccess      ← CORS específico do backend
│   ├── auth/
│   │   ├── register.php
│   │   ├── login.php
│   │   ├── me.php
│   │   └── logout.php
│   ├── bets/
│   └── wallet/
└── api/
    ├── config.php
    ├── extractions-list.php
    └── banners.php
```

## Próximo Passo

**Faça redeploy no Coolify** para aplicar a correção.

## Teste Após Redeploy

```bash
# Teste registro
curl -v https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/auth/register.php \
  -X POST \
  -H "Origin: https://tradicaodobicho.site" \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456","cpf":"12345678901","phone":"11999999999"}'

# Deve retornar 200 OK ou erro de validação (não mais 404)
```

## Status

- ✅ Dockerfile corrigido
- ✅ Estrutura de diretórios corrigida
- ✅ .htaccess criado na raiz
- ✅ Commitado e no GitHub
- ⏳ Aguardando redeploy no Coolify

