# 🎲 Aplicar SQL do Bingo via HTTP (Alternativa)

Como o PHP CLI não está disponível no terminal do Coolify, você pode aplicar o SQL via HTTP!

## ✅ Método Recomendado: Via Endpoint HTTP

### Passo 1: Acessar o endpoint

Após o deploy, acesse no navegador ou via curl:

```
https://seu-backend-coolify.com/backend/bingo/apply-sql-via-http.php
```

**Substitua `seu-backend-coolify.com` pela URL do seu backend no Coolify.**

### Passo 2: Verificar resultado

O endpoint retornará um JSON com o resultado:

```json
{
    "success": true,
    "messages": [
        "📝 Criando tabela bingo_games...",
        "✅ Tabela bingo_games criada com sucesso",
        "📝 Criando tabela bingo_cards...",
        "✅ Tabela bingo_cards criada com sucesso",
        "🔍 Verificando tabelas...",
        "✅ Tabelas encontradas: bingo_games, bingo_cards",
        "🎉 Concluído!"
    ],
    "tables_created": ["bingo_games", "bingo_cards"],
    "executed": 2,
    "errors": 0
}
```

### Passo 3: Remover o arquivo (IMPORTANTE!)

⚠️ **Por segurança, remova o arquivo após usar:**

```bash
# No terminal do Coolify (ou via git)
rm backend/bingo/apply-sql-via-http.php
```

Ou faça commit removendo o arquivo após aplicar o SQL.

## 🔒 Segurança (Opcional)

Se quiser adicionar proteção por token, edite `backend/bingo/apply-sql-via-http.php` e descomente as linhas:

```php
$token = $_GET['token'] ?? '';
if ($token !== 'SEU_TOKEN_SECRETO_AQUI') {
    http_response_code(403);
    echo json_encode(['error' => 'Token inválido']);
    exit;
}
```

Depois acesse:
```
https://seu-backend-coolify.com/backend/bingo/apply-sql-via-http.php?token=SEU_TOKEN_SECRETO_AQUI
```

## 🎯 Pronto!

Após aplicar o SQL via HTTP, o módulo Bingo estará pronto para uso!

