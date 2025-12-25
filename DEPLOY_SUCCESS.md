# ✅ Deploy Concluído com Sucesso!

## 🎉 Status Atual

- ✅ **Backend deployado** no Coolify
- ✅ **Banco de dados importado** (13 tabelas criadas)
- ✅ **Configurações inseridas** (7 configurações)
- ✅ **Conexão com MySQL Railway** funcionando

## 📊 Tabelas Criadas

1. `users` - Usuários
2. `wallets` - Carteiras
3. `extractions` - Extrações/Sorteios
4. `games` - Resultados brutos
5. `bets` - Apostas
6. `bet_items` - Itens das apostas
7. `wallet_transactions` - Transações
8. `payments` - Pagamentos
9. `withdrawals` - Saques
10. `settings` - Configurações
11. `banners` - Banners promocionais
12. `promotions` - Promoções
13. `stories` - Stories/Notícias

## 🌐 URLs do Sistema

- **Backend API:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com
- **API Config:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/config.php
- **API Extrações:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/extractions-list.php
- **API Banners:** https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/banners.php

## 🧪 Testar APIs

### Testar Configurações:
```bash
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/config.php
```

### Testar Extrações:
```bash
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/extractions-list.php
```

### Testar Odds:
```bash
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/bets/odds.php
```

## 📝 Próximos Passos

### 1. Configurar Frontend

No frontend, configure a URL da API:

```bash
cd frontend-react
echo "VITE_API_URL=https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com" > .env.production
npm run build
```

### 2. Deploy do Frontend

- **Opção A:** Deploy no Coolify (Static Site)
- **Opção B:** Deploy na Hostinger (via SFTP)
- **Opção C:** Deploy em outro servidor

### 3. Configurar CORS

Edite `backend/cors.php` para incluir o domínio do frontend:

```php
$allowedOrigins = [
    'https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com',
    'https://seudominio.com.br',  // Seu domínio do frontend
    'https://www.seudominio.com.br',
];
```

### 4. Configurar Cron Jobs

No Coolify, configure Scheduled Tasks:

**Tarefa 1:**
- Command: `php /var/www/html/cron/scheduled-fetch-and-verify.php?token=SEU_TOKEN`
- Schedule: `*/5 * * * *` (a cada 5 minutos)

**Tarefa 2:**
- Command: `php /var/www/html/jobs/process-bet-prizes.php`
- Schedule: `*/2 * * * *` (a cada 2 minutos)

## ✅ Checklist Final

- [x] Backend deployado no Coolify
- [x] Banco de dados importado
- [x] Conexão com MySQL Railway funcionando
- [x] APIs públicas funcionando
- [ ] Frontend configurado e deployado
- [ ] CORS configurado
- [ ] Cron jobs configurados
- [ ] Domínio personalizado configurado (opcional)
- [ ] SSL ativado (já deve estar ativo)

## 🎯 Sistema Pronto!

O backend está funcionando e pronto para receber requisições do frontend!

