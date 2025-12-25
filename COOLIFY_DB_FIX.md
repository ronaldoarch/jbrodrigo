# 🔧 Correção: Erro de Conexão com Banco de Dados

## ❌ Erro Atual

```
Erro de conexão: SQLSTATE[HY000] [2002] No such file or directory
```

## 🔍 Diagnóstico

O erro "No such file or directory" geralmente significa:
1. **Host do MySQL incorreto** - O PHP não consegue resolver o hostname
2. **Variáveis de ambiente não configuradas** - Coolify não está passando as variáveis
3. **Rede não configurada** - Container não consegue acessar MySQL externo

## ✅ Solução

### 1. Verificar Variáveis de Ambiente no Coolify

No Coolify, vá em **Configuration** → **Environment Variables** e verifique se estão configuradas:

```env
MYSQL_HOST=mainline.proxy.rlwy.net
MYSQL_PORT=44951
MYSQL_DATABASE=railway
MYSQL_USER=root
MYSQL_PASSWORD=wktlYoHTkATnPgiUrvSBVkxHcNACjprR
```

**OU** use o formato genérico:

```env
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=44951
DB_NAME=railway
DB_USER=root
DB_PASSWORD=wktlYoHTkATnPgiUrvSBVkxHcNACjprR
```

### 2. Verificar se Variáveis Estão Sendo Lidas

No Coolify, vá em **Terminal** e execute:

```bash
# Verificar variáveis de ambiente
env | grep MYSQL
env | grep DB_

# Testar conexão manualmente
php -r "
\$host = getenv('MYSQL_HOST') ?: 'mainline.proxy.rlwy.net';
\$port = getenv('MYSQL_PORT') ?: '44951';
\$db = getenv('MYSQL_DATABASE') ?: 'railway';
\$user = getenv('MYSQL_USER') ?: 'root';
\$pass = getenv('MYSQL_PASSWORD') ?: 'wktlYoHTkATnPgiUrvSBVkxHcNACjprR';
try {
    \$pdo = new PDO(\"mysql:host=\$host;port=\$port;dbname=\$db\", \$user, \$pass);
    echo 'Conexão OK!';
} catch (Exception \$e) {
    echo 'Erro: ' . \$e->getMessage();
}
"
```

### 3. Testar Conexão do Container

No terminal do Coolify:

```bash
# Instalar mysql-client se necessário
apt-get update && apt-get install -y mysql-client

# Testar conexão
mysql -h mainline.proxy.rlwy.net -P 44951 -u root -p railway
# Senha: wktlYoHTkATnPgiUrvSBVkxHcNACjprR
```

### 4. Verificar Logs do PHP

Os logs agora incluem informações de debug. Verifique no Coolify → **Logs**:

```
Tentando conectar: host=..., port=..., db=..., user=...
```

Isso ajuda a identificar qual variável está faltando.

## 🔧 Configuração Recomendada no Coolify

### Environment Variables (Runtime Only):

```
MYSQL_HOST=mainline.proxy.rlwy.net
MYSQL_PORT=44951
MYSQL_DATABASE=railway
MYSQL_USER=root
MYSQL_PASSWORD=wktlYoHTkATnPgiUrvSBVkxHcNACjprR
APP_ENV=production
TZ=America/Sao_Paulo
```

**Importante:**
- Marque `APP_ENV` como **"Runtime only"** para evitar warnings
- Marque `MYSQL_PASSWORD` como **"Hide value"** para segurança

## 🐛 Troubleshooting

### Erro: "No such file or directory"

**Causa:** Host não resolvido ou porta incorreta

**Solução:**
1. Verifique se `MYSQL_HOST` está correto: `mainline.proxy.rlwy.net`
2. Verifique se `MYSQL_PORT` está correto: `44951`
3. Teste conectividade: `ping mainline.proxy.rlwy.net`

### Erro: "Access denied"

**Causa:** Credenciais incorretas

**Solução:**
1. Verifique `MYSQL_USER` e `MYSQL_PASSWORD`
2. Teste credenciais manualmente
3. Verifique se banco `railway` existe

### Erro: "Unknown database"

**Causa:** Banco não existe

**Solução:**
1. Crie o banco no Railway
2. Importe `database.sql`
3. Verifique nome do banco nas variáveis

## ✅ Checklist

- [ ] Variáveis de ambiente configuradas no Coolify
- [ ] Variáveis marcadas como "Runtime only" (exceto senha)
- [ ] Teste de conexão manual funcionando
- [ ] Logs mostram tentativa de conexão
- [ ] Banco de dados existe e está acessível
- [ ] Firewall permite conexão do Coolify para Railway

## 🔄 Após Corrigir

1. Reinicie o container no Coolify
2. Verifique logs novamente
3. Teste API: `curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/api/config.php`

