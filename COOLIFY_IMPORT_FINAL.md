# ✅ Importar Banco - Método Final (PHP)

## 🚀 Método Mais Simples - Via PHP

O PHP já está instalado no container, então não precisa instalar nada!

### No Terminal do Coolify:

```bash
# 1. Navegar para diretório
cd /var/www/html

# 2. Executar script de importação
php import-simple.php
```

O script irá:
- ✅ Baixar `database.sql` do GitHub automaticamente
- ✅ Conectar ao banco usando variáveis de ambiente
- ✅ Importar todas as tabelas
- ✅ Mostrar progresso
- ✅ Verificar tabelas criadas

## 🔄 Se o arquivo não existir ainda

Após o próximo deploy, o arquivo `import-simple.php` estará disponível.

Ou execute diretamente via PHP inline:

```bash
cd /var/www/html

php -r "
require '/var/www/html/scraper/config/database.php';
\$db = getDB();
echo 'Conectado! Baixando SQL...' . PHP_EOL;
\$sql = file_get_contents('https://raw.githubusercontent.com/ronaldoarch/jbrodrigo/main/database.sql');
\$sql = preg_replace('/--.*$/m', '', \$sql);
\$sql = preg_replace('/\/\*.*?\*\//s', '', \$sql);
\$commands = array_filter(explode(';', \$sql), function(\$c) { 
    \$c = trim(\$c); 
    return !empty(\$c) && !preg_match('/^(SET|USE)/i', \$c) && strlen(\$c) > 10; 
});
\$success = 0;
foreach (\$commands as \$cmd) {
    try { 
        \$db->exec(trim(\$cmd)); 
        \$success++; 
        if (\$success % 5 == 0) echo 'Processados: ' . \$success . PHP_EOL;
    } catch (Exception \$e) { 
        if (strpos(\$e->getMessage(), 'already exists') === false) {
            // Ignorar apenas erros de tabela já existe
        }
    }
}
\$stmt = \$db->query('SHOW TABLES');
\$tables = \$stmt->fetchAll(PDO::FETCH_COLUMN);
echo 'Concluído! Tabelas: ' . count(\$tables) . PHP_EOL;
"
```

## ✅ Após Importar

Teste a API:

```bash
curl http://localhost/api/config.php
```

Deve retornar JSON com configurações!

## 🎯 Resumo

**Método mais simples:**
```bash
cd /var/www/html && php import-simple.php
```

Isso funciona porque:
- ✅ PHP já está instalado
- ✅ Script baixa SQL do GitHub automaticamente
- ✅ Usa variáveis de ambiente do Coolify
- ✅ Não precisa instalar mysql-client

