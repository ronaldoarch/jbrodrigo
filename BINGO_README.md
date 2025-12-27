# 🎲 Módulo Bingo Automático

Módulo completo de Bingo Automático integrado ao sistema JB.

## 📋 Estrutura

### Banco de Dados

**Tabela: `bingo_games`**
- Armazena jogos de bingo
- Contém seed e sequência completa de números sorteados

**Tabela: `bingo_cards`**
- Armazena cartelas dos usuários
- Vinculada a `bingo_games` e `users`
- Contém resultado e prêmio

### Backend PHP

**Classes:**
- `BingoCardGenerator.php` - Gera cartelas 5x5
- `BingoDraw.php` - Sorteio determinístico baseado em seed
- `BingoValidator.php` - Valida padrões de vitória
- `BingoService.php` - Serviço principal com lógica completa

**Endpoints:**
- `POST /backend/bingo/create-card.php` - Criar nova cartela
- `GET /backend/bingo/list-cards.php` - Listar cartelas do usuário
- `GET /backend/bingo/get-card.php?id=123` - Buscar cartela específica

### Frontend React

**Componentes:**
- `Bingo.jsx` - Página principal do bingo
- `Bingo.css` - Estilos da página

**Funcionalidades:**
- Criação de cartela
- Animação de revelação de números
- Visualização de resultado
- Histórico de partidas

## 🚀 Como Usar

### 1. Aplicar Estrutura do Banco

Execute o SQL:
```sql
-- Executar database_bingo.sql no banco de dados
```

Ou via MySQL:
```bash
mysql -u usuario -p nome_do_banco < database_bingo.sql
```

### 2. Funcionalidades

#### Criar Cartela
```javascript
// POST /backend/bingo/create-card.php
{
  "bet_amount": 1.00
}
```

#### Listar Cartelas
```javascript
// GET /backend/bingo/list-cards.php?limit=20&offset=0
```

#### Buscar Cartela
```javascript
// GET /backend/bingo/get-card.php?id=123
```

## 🎮 Como Funciona

1. **Geração da Cartela:**
   - Sistema gera cartela 5x5 com números aleatórios
   - Números respeitam faixas por coluna (B: 1-15, I: 16-30, etc)

2. **Sorteio Determinístico:**
   - Usa seed baseada em `game_id + timestamp`
   - Gera sequência completa de números (1-75)
   - Mesma seed = mesma sequência (reproduzível)

3. **Validação:**
   - Verifica padrões: linha, coluna, diagonal, cartela cheia
   - Processa resultado automaticamente

4. **Prêmios:**
   - Linha/Coluna: 2x da aposta
   - Diagonal: 3x da aposta
   - Cartela Cheia: 10x da aposta

5. **Frontend:**
   - Revela números com animação (delay de 100ms)
   - Resultado já está processado no backend
   - Apenas efeito visual

## 📝 Padrões de Vitória

- **Linha**: Uma linha completa (5 números)
- **Coluna**: Uma coluna completa (5 números)
- **Diagonal Principal**: (0,0) a (4,4)
- **Diagonal Secundária**: (0,4) a (4,0)
- **Cartela Cheia**: Todos os 25 números acertados

## 🔧 Integração

### Sistema de Carteira

O módulo integra com o sistema de carteira existente:
- Debita valor da aposta
- Credita prêmio se ganhou
- Cria transações em `wallet_transactions`

### Autenticação

Usa o mesmo sistema de autenticação:
- Requer usuário logado
- Verifica saldo antes de criar cartela
- Protege endpoints com `requireAuth()`

## 📊 Estrutura de Dados

### Cartela
```json
{
  "id": 1,
  "user_id": 123,
  "game_id": 1,
  "card_numbers": [1, 16, 31, 46, 61, ...], // Array unidimensional
  "numbers_matched": [1, 16, 31, ...],
  "win_pattern": "linha",
  "result": "win",
  "prize_amount": 2.00,
  "bet_amount": 1.00
}
```

### Jogo
```json
{
  "id": 1,
  "seed": "md5_hash",
  "numbers_drawn": [1, 2, 3, ..., 75], // Sequência completa
  "status": "finished"
}
```

## ⚠️ Observações

1. **Sorteio Determinístico**: O resultado já está definido quando a cartela é criada
2. **Não é ao vivo**: Não depende de outros jogadores
3. **Créditos Virtuais**: Usa sistema de carteira do JB
4. **Sem WebSocket**: Tudo é processado via API REST
5. **Modular**: Código separado em classes reutilizáveis

## 🎨 Interface

A interface inclui:
- Cartela visual 5x5 com letras B-I-N-G-O
- Números acertados destacados em dourado
- Animação de revelação
- Exibição de prêmio
- Histórico de partidas

## 🔐 Segurança

- Validação de autenticação
- Verificação de saldo
- Transações atômicas (beginTransaction/commit)
- Validação de entrada
- Prepared statements

