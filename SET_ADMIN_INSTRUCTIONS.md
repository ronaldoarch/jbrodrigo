# Como Definir Admin

Após fazer o deploy do backend no Coolify, você pode executar o script de duas formas:

## Opção 1: Via Navegador (Mais Fácil)

1. Acesse: `https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/auth/set-admin.php`
2. O script irá automaticamente:
   - Criar ou atualizar o usuário com email: `midasreidoblack@gmail.com`
   - Definir a senha como: `Admin123`
   - Definir como admin

## Opção 2: Via curl

```bash
curl https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com/backend/auth/set-admin.php
```

## Credenciais

- **Email:** midasreidoblack@gmail.com
- **Senha:** Admin123
- **Admin:** Sim

## Segurança

⚠️ **IMPORTANTE:** Após usar o script, remova ou proteja o arquivo `set-admin.php` para evitar que outras pessoas usem.

Para remover após o uso:
1. Delete o arquivo do servidor
2. Ou adicione uma verificação de token/IP

