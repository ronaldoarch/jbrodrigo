# 🧪 Testar Backend Deployado no Coolify

## 🌐 URL do Backend

**Backend:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com

## ✅ Testes Rápidos

### 1. Testar API de Configurações

```bash
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/config.php
```

**Resposta esperada:**
```json
{
  "success": true,
  "config": {
    "site_name": "Jogo do Bicho",
    ...
  }
}
```

### 2. Testar API de Extrações

```bash
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/extractions-list.php
```

**Resposta esperada:**
```json
{
  "success": true,
  "extractions": [...]
}
```

### 3. Testar API de Banners

```bash
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/banners.php?position=home
```

### 4. Testar Endpoint de Odds (Público)

```bash
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/bets/odds.php
```

## 🔧 Configurar Frontend

Atualize o frontend para usar esta URL:

### Opção 1: Variável de Ambiente no Build

```bash
cd frontend-react
VITE_API_URL=https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com npm run build
```

### Opção 2: Configurar no Coolify (Frontend)

Se o frontend também estiver no Coolify:

**Environment Variables:**
```
VITE_API_URL=https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com
```

## 🔒 Configurar CORS

Edite `backend/cors.php` para incluir o domínio do frontend:

```php
$allowedOrigins = [
    'https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com',
    'https://seudominio.com.br',  // Seu domínio do frontend
    'https://www.seudominio.com.br',
];
```

## 🐛 Troubleshooting

### Erro 404

- Verifique se o arquivo existe: `/api/config.php`
- Verifique logs no Coolify
- Teste via terminal do container

### Erro de CORS

- Verifique `backend/cors.php`
- Verifique headers no Apache
- Teste com `curl -H "Origin: https://seudominio.com.br"`

### Erro de Conexão com Banco

- Verifique variáveis de ambiente no Coolify
- Teste conexão manualmente
- Verifique logs do container

## 📝 Próximos Passos

1. ✅ Backend deployado e funcionando
2. ⏳ Configurar frontend para usar esta URL
3. ⏳ Configurar domínio personalizado (opcional)
4. ⏳ Configurar SSL (já deve estar ativo)
5. ⏳ Testar sistema completo

## 🔗 Links Úteis

- **Backend API:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com
- **API Config:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/config.php
- **API Extrações:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/extractions-list.php

