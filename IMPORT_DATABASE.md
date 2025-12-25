# 📥 Importar Banco de Dados no Railway

## 🔍 Problema

O backend está conectando ao banco, mas retorna erro 500 porque as tabelas não existem ainda.

## ✅ Solução: Importar Estrutura do Banco

### Opção 1: Via Railway CLI (Recomendado)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Linkar projeto
railway link

# Conectar ao MySQL
railway mysql

# Dentro do MySQL, importar:
source database.sql;
```

### Opção 2: Via MySQL Workbench/DBeaver

1. **Configurações de Conexão:**
   - Host: `mainline.proxy.rlwy.net`
   - Port: `44951`
   - Database: `railway`
   - Username: `root`
   - Password: `wktlYoHTkATnPgiUrvSBVkxHcNACjprR`

2. **Importar SQL:**
   - Abra MySQL Workbench/DBeaver
   - Conecte ao banco
   - Vá em "Server" → "Data Import"
   - Selecione o arquivo `database.sql`
   - Clique em "Start Import"

### Opção 3: Via Terminal Local

```bash
# Do seu computador
mysql -h mainline.proxy.rlwy.net -P 44951 -u root -p railway < database.sql

# Quando solicitado, digite a senha:
# wktlYoHTkATnPgiUrvSBVkxHcNACjprR
```

### Opção 4: Via PHPMyAdmin (se disponível)

1. Acesse PHPMyAdmin do Railway (se tiver interface web)
2. Selecione o banco `railway`
3. Vá em "Import"
4. Escolha o arquivo `database.sql`
5. Clique em "Go"

## ✅ Verificar Importação

Após importar, verifique se as tabelas foram criadas:

```sql
SHOW TABLES;

-- Deve mostrar:
-- users, wallets, extractions, games, bets, bet_items, 
-- wallet_transactions, payments, withdrawals, settings, 
-- banners, promotions, stories
```

## 🧪 Testar API Após Importação

```bash
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/config.php

# Deve retornar JSON com configurações
```

## 📝 Próximos Passos

1. ✅ Importar `database.sql`
2. ✅ Verificar tabelas criadas
3. ✅ Testar API
4. ✅ Configurar dados iniciais (se necessário)

