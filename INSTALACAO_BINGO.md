# 🎲 Instalação do Módulo Bingo Automático

## 📋 Passo a Passo

### 1. Banco de Dados

Execute o arquivo SQL no seu banco de dados:

```bash
mysql -u usuario -p nome_do_banco < database_bingo.sql
```

Ou via phpMyAdmin:
1. Acesse phpMyAdmin
2. Selecione o banco de dados
3. Vá em "SQL"
4. Cole o conteúdo de `database_bingo.sql`
5. Execute

### 2. Verificar Estrutura

Após executar o SQL, verifique se as tabelas foram criadas:

```sql
SHOW TABLES LIKE 'bingo%';
DESCRIBE bingo_games;
DESCRIBE bingo_cards;
```

### 3. Backend

Os arquivos PHP já estão criados em:
- `backend/bingo/BingoCardGenerator.php`
- `backend/bingo/BingoDraw.php`
- `backend/bingo/BingoValidator.php`
- `backend/bingo/BingoService.php`
- `backend/bingo/create-card.php`
- `backend/bingo/list-cards.php`
- `backend/bingo/get-card.php`

Certifique-se de que o backend está acessível e que o Apache/PHP está configurado corretamente.

### 4. Frontend

Os arquivos React já estão criados:
- `frontend-react/src/pages/Bingo.jsx`
- `frontend-react/src/pages/Bingo.css`

A rota já foi adicionada ao `App.jsx` e o link no menu do `Layout.jsx`.

### 5. Build e Deploy

Para fazer deploy do frontend:

```bash
cd frontend-react
npm run build
cd ..
./deploy-frontend-hostinger.sh
```

### 6. Testar

1. Faça login no sistema
2. Acesse a página "Bingo" no menu
3. Defina o valor da aposta
4. Clique em "Nova Cartela"
5. Aguarde a animação
6. Veja o resultado

## 🔧 Configurações

### Multiplicadores de Prêmio

Os multiplicadores estão definidos em `BingoService.php`:

```php
$multipliers = [
    'linha' => 2.0,
    'coluna' => 2.0,
    'diagonal_principal' => 3.0,
    'diagonal_secundaria' => 3.0,
    'cheia' => 10.0
];
```

Para alterar, edite o método `calculatePrize()` na classe `BingoService`.

### Velocidade da Animação

A velocidade da revelação dos números está em `Bingo.jsx`:

```javascript
}, 100); // 100ms entre cada número
```

Para alterar, edite a função `startRevealAnimation()`.

## ✅ Checklist de Verificação

- [ ] Tabelas criadas no banco (`bingo_games`, `bingo_cards`)
- [ ] Arquivos PHP no servidor
- [ ] Frontend buildado e deployado
- [ ] Rota `/bingo` funcionando
- [ ] Link "Bingo" aparece no menu
- [ ] Criar cartela funciona
- [ ] Animação funciona
- [ ] Histórico carrega
- [ ] Prêmios são creditados corretamente
- [ ] Apostas são debitadas corretamente

## 🐛 Troubleshooting

### Erro: "Tabela não encontrada"
- Verifique se executou o SQL corretamente
- Confirme que está usando o banco correto

### Erro: "Saldo insuficiente"
- Adicione saldo na carteira do usuário
- Verifique se o campo `balance` existe em `wallets`

### Cartela não aparece
- Verifique console do navegador (F12)
- Confirme que a API está retornando dados
- Teste endpoint diretamente: `/backend/bingo/create-card.php`

### Animação não funciona
- Verifique se `numbers_drawn` está no retorno da API
- Confirme que `numbers_matched` está correto

## 📞 Suporte

Para problemas, verifique:
1. Logs do PHP (`error_log`)
2. Console do navegador (F12)
3. Network tab (requisições à API)
4. Estrutura do banco de dados

