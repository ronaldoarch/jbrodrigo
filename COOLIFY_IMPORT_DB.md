# 📥 Importar Banco de Dados no Coolify

## 🚀 Método Rápido: Via Script PHP

### Passo 1: Acessar Terminal do Coolify

1. No Coolify, vá em **Terminal**
2. Aguarde conectar ao container

### Passo 2: Executar Script de Importação

```bash
# Navegar para diretório do backend
cd /var/www/html

# Executar script de importação
php import-database.php
```

O script irá:
- ✅ Conectar ao banco usando variáveis de ambiente
- ✅ Ler o arquivo `database.sql`
- ✅ Executar todos os comandos SQL
- ✅ Mostrar progresso e tabelas criadas

## 🔧 Método Alternativo: Via MySQL Direto

### Se mysql-client estiver instalado:

```bash
# Instalar mysql-client (se necessário)
apt-get update && apt-get install -y mysql-client

# Importar diretamente
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < /var/www/html/../../database.sql
```

### Ou copiar arquivo para container primeiro:

```bash
# No terminal do Coolify
cd /var/www/html

# Copiar database.sql para o container (se ainda não estiver)
# Ou fazer upload via interface do Coolify

# Importar
mysql -h mainline.proxy.rlwy.net -P 44951 -u root -p railway < database.sql
# Senha: wktlYoHTkATnPgiUrvSBVkxHcNACjprR
```

## 🔍 Verificar Importação

Após importar, verifique:

```bash
# No terminal do Coolify
php -r "
require '/var/www/html/scraper/config/database.php';
\$db = getDB();
\$stmt = \$db->query('SHOW TABLES');
\$tables = \$stmt->fetchAll(PDO::FETCH_COLUMN);
echo 'Tabelas: ' . implode(', ', \$tables) . PHP_EOL;
"
```

## ✅ Testar API Após Importação

```bash
# No terminal do Coolify
curl http://localhost/api/config.php

# Ou do seu computador
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/config.php
```

## 🐛 Troubleshooting

### Erro: "database.sql não encontrado"

**Solução:** O arquivo precisa estar no repositório ou copiado para o container.

```bash
# Verificar se arquivo existe
ls -la /var/www/html/../../database.sql

# Se não existir, copiar do repositório
# Ou fazer upload via interface do Coolify
```

### Erro: "Table already exists"

**Normal:** O script ignora esses erros automaticamente.

### Erro de permissão

```bash
# Dar permissões
chmod +x /var/www/html/import-database.php
```

## 📝 Checklist

- [ ] Terminal conectado ao container
- [ ] Arquivo `database.sql` acessível
- [ ] Variáveis de ambiente configuradas
- [ ] Script executado com sucesso
- [ ] Tabelas verificadas
- [ ] API testada

