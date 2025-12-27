# 📁 Estrutura do Módulo Bingo Automático

## 🗂️ Arquivos Criados

### Banco de Dados
```
database_bingo.sql          # Script SQL para criar tabelas
```

### Backend PHP
```
backend/bingo/
├── BingoCardGenerator.php  # Geração de cartelas 5x5
├── BingoDraw.php           # Sorteio determinístico
├── BingoValidator.php      # Validação de padrões de vitória
├── BingoService.php        # Serviço principal (lógica completa)
├── create-card.php         # Endpoint: Criar cartela
├── list-cards.php          # Endpoint: Listar cartelas
└── get-card.php            # Endpoint: Buscar cartela específica
```

### Frontend React
```
frontend-react/src/
├── pages/
│   ├── Bingo.jsx           # Componente principal do Bingo
│   └── Bingo.css           # Estilos do Bingo
```

### Integrações
```
frontend-react/src/
├── App.jsx                 # Rota /bingo adicionada
└── components/
    └── Layout.jsx          # Link "Bingo" no menu
```

### Documentação
```
BINGO_README.md             # Documentação completa
INSTALACAO_BINGO.md         # Guia de instalação
BINGO_ESTRUTURA.md          # Este arquivo
```

## 🔄 Fluxo de Dados

### 1. Criar Cartela
```
Frontend (Bingo.jsx)
  ↓ POST /backend/bingo/create-card.php
Backend (create-card.php)
  ↓ BingoService::createCard()
  ├─ BingoCardGenerator::generateCard() → Cartela 5x5
  ├─ Criar bingo_games (com seed)
  ├─ BingoDraw::generateDrawSequence() → Sequência 1-75
  ├─ BingoDraw::drawUntilWin() → Números acertados
  ├─ BingoValidator::checkWin() → Resultado
  ├─ Debitar aposta (wallet)
  ├─ Creditar prêmio se ganhou (wallet)
  └─ Criar bingo_cards
  ↓ Retorna cartela completa
Frontend exibe cartela com animação
```

### 2. Listar Histórico
```
Frontend (Bingo.jsx)
  ↓ GET /backend/bingo/list-cards.php
Backend (list-cards.php)
  ↓ BingoService::getUserCards()
  └─ Busca bingo_cards do usuário
  ↓ Retorna lista de cartelas
Frontend exibe histórico
```

## 📊 Tabelas do Banco

### bingo_games
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID do jogo |
| seed | VARCHAR(255) | Seed para sorteio |
| numbers_drawn | TEXT (JSON) | Sequência completa de números |
| status | ENUM | active/finished |
| created_at | TIMESTAMP | Data de criação |

### bingo_cards
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID da cartela |
| user_id | INT | ID do usuário |
| game_id | INT | ID do jogo |
| card_numbers | TEXT (JSON) | Números da cartela |
| numbers_matched | TEXT (JSON) | Números acertados |
| win_pattern | VARCHAR(50) | Padrão de vitória |
| result | ENUM | win/lose/pending |
| prize_amount | DECIMAL | Prêmio creditado |
| bet_amount | DECIMAL | Valor apostado |
| created_at | TIMESTAMP | Data de criação |

## 🔌 Endpoints API

### POST /backend/bingo/create-card.php
**Body:**
```json
{
  "bet_amount": 1.00
}
```

**Response:**
```json
{
  "success": true,
  "card": {
    "id": 1,
    "user_id": 123,
    "game_id": 1,
    "card_numbers": [1, 16, 31, ...],
    "numbers_matched": [1, 16, ...],
    "win_pattern": "linha",
    "result": "win",
    "prize_amount": 2.00,
    "bet_amount": 1.00,
    "seed": "...",
    "numbers_drawn": [1, 2, 3, ..., 75]
  }
}
```

### GET /backend/bingo/list-cards.php?limit=20&offset=0
**Response:**
```json
{
  "success": true,
  "cards": [...],
  "count": 20
}
```

### GET /backend/bingo/get-card.php?id=123
**Response:**
```json
{
  "success": true,
  "card": {...}
}
```

## 🎨 Componentes Frontend

### Bingo.jsx
- Estado da cartela atual
- Histórico de partidas
- Controles (valor da aposta, criar cartela)
- Animação de revelação
- Exibição de resultado

### Bingo.css
- Estilos da cartela 5x5
- Animações de números acertados
- Layout responsivo
- Cores do tema (dourado/azul)

## 🔐 Segurança

- ✅ Autenticação obrigatória (`requireAuth()`)
- ✅ Validação de saldo antes de criar cartela
- ✅ Transações atômicas (beginTransaction/commit)
- ✅ Prepared statements (SQL injection protection)
- ✅ Validação de entrada (bet_amount)
- ✅ Verificação de propriedade (só vê próprias cartelas)

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar estatísticas (taxa de vitória, etc)
- [ ] Adicionar diferentes tamanhos de cartela
- [ ] Adicionar mais padrões de vitória
- [ ] Adicionar ranking de jogadores
- [ ] Adicionar modo "cartela grátis" (bonus)
- [ ] Adicionar notificações de vitória

