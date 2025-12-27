# Migrações de Banco de Dados

Este diretório contém scripts de migração para atualizar a estrutura do banco de dados.

## Como Aplicar

### Opção 1: Via MySQL/MariaDB CLI
```bash
mysql -u usuario -p nome_do_banco < migrations/001_add_missing_fields.sql
```

### Opção 2: Via PHP (Recomendado)
Execute o script PHP que aplica as migrações:
```bash
php migrations/apply-migrations.php
```

### Opção 3: Via Admin do Banco (phpMyAdmin, etc.)
1. Acesse seu painel de administração do banco
2. Selecione o banco de dados
3. Vá para a aba "SQL"
4. Cole o conteúdo do arquivo de migração
5. Execute

## Ordem de Aplicação

As migrações devem ser aplicadas em ordem numérica:
1. `001_add_missing_fields.sql` - Campos e tabelas básicas

## Verificação

Após aplicar as migrações, verifique:
- Campos foram adicionados corretamente
- Tabelas foram criadas
- Dados padrão foram inseridos
- Índices foram criados

## Rollback

Para reverter uma migração, use os scripts de rollback (se disponíveis):
```bash
mysql -u usuario -p nome_do_banco < migrations/001_add_missing_fields_rollback.sql
```

