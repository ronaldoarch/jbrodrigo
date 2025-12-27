# Resetar Senha de Admin

Se você definiu um usuário como admin manualmente no banco de dados mas não consegue fazer login, é provável que a senha não esteja hasheada corretamente.

## Solução 1: Usar o script de reset (Recomendado)

1. Faça uma requisição POST para: `https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/auth/reset-admin-password.php`

2. Com o seguinte JSON:
```json
{
  "email": "seu-email@exemplo.com",
  "new_password": "sua-nova-senha",
  "set_admin": true
}
```

### Usando curl:
```bash
curl -X POST https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/auth/reset-admin-password.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@exemplo.com",
    "new_password": "sua-nova-senha",
    "set_admin": true
  }'
```

## Solução 2: Atualizar diretamente no banco

Se você tem acesso ao banco de dados (Railway), execute:

```sql
-- Hash da senha (substitua 'sua-senha' pela senha desejada)
-- No PHP: password_hash('sua-senha', PASSWORD_DEFAULT)
-- Ou use um gerador online de bcrypt

UPDATE users 
SET password = '$2y$10$[hash-gerado]', 
    is_admin = 1 
WHERE email = 'seu-email@exemplo.com';
```

## Solução 3: Criar novo usuário admin via SQL

```sql
-- Gerar hash da senha primeiro (use password_hash do PHP ou gerador online)
INSERT INTO users (name, email, password, is_admin, created_at) 
VALUES (
    'Admin',
    'admin@exemplo.com',
    '$2y$10$[hash-da-senha]',
    1,
    NOW()
);

-- Criar carteira para o usuário
INSERT INTO wallets (user_id) 
VALUES (LAST_INSERT_ID());
```

## Gerar Hash de Senha

Você pode usar este script PHP temporário para gerar o hash:

```php
<?php
echo password_hash('sua-senha-aqui', PASSWORD_DEFAULT);
?>
```

Ou use uma ferramenta online de bcrypt hash generator.

## Importante

- O script `reset-admin-password.php` deve ser removido ou protegido após o uso
- Sempre use senhas fortes
- Mantenha as senhas de admin seguras

