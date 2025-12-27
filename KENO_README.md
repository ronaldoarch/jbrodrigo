# 🎰 Módulo Keno

Módulo de Keno integrado ao sistema, compartilhando a lógica de sorteio determinístico com o Bingo.

## 📋 Estrutura

### Backend

```
backend/keno/
├── KenoDraw.php           # Sorteio determinístico (reutiliza lógica do Bingo)
├── KenoValidator.php      # Validação de números escolhidos
├── KenoPayout.php         # Tabela de premiação configurável
├── KenoService.php        # Lógica principal do jogo
├── create-game.php        # API: Criar jogo
├── get-game.php           # API: Buscar jogo por ID
├── list-games.php         # API: Listar jogos do usuário
├── payout-table.php       # API: Tabela de premiação
└── apply-sql-via-terminal.php  # Script para aplicar SQL
```

### Frontend

```
frontend-react/src/pages/
├── Keno.jsx               # Componente principal
├── Keno.css               # Estilos
└── Bingo.jsx              # Modificado para incluir tabs (Bingo/Keno)
```

## 🎮 Regras do Jogo

1. **Seleção de Números:**
   - Usuário escolhe entre 2 e 10 números
   - Números de 1 a 80
   - Cada número pode ser escolhido apenas uma vez

2. **Sorteio:**
   - Sistema sorteia 20 números aleatórios de 1 a 80
   - Sorteio é determinístico (usa seed baseada no game_id)
   - Mesmo input sempre gera o mesmo resultado

3. **Premiação:**
   - Baseada em tabela configurável
   - Depende da quantidade de números escolhidos e acertos
   - Prêmio = Valor apostado × Multiplicador

4. **Tabela de Premiação:**
   - 2 números: 10x (2 acertos)
   - 3 números: 2x (2 acertos), 50x (3 acertos)
   - 4 números: 2x (2), 10x (3), 100x (4)
   - 5 números: 2x (3), 10x (4), 200x (5)
   - 6 números: 1x (3), 5x (4), 25x (5), 500x (6)
   - 7 números: 2x (4), 10x (5), 50x (6), 1000x (7)
   - 8 números: 5x (5), 25x (6), 100x (7), 2000x (8)
   - 9 números: 2x (5), 10x (6), 50x (7), 500x (8), 5000x (9)
   - 10 números: 2x (5), 5x (6), 25x (7), 200x (8), 1000x (9), 10000x (10)

## 🗄️ Banco de Dados

### Tabela: `keno_games`

```sql
CREATE TABLE `keno_games` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `seed` VARCHAR(255) NOT NULL,
    `chosen_numbers` TEXT NOT NULL,  -- JSON array
    `drawn_numbers` TEXT NOT NULL,   -- JSON array (20 números)
    `hits` INT NOT NULL DEFAULT 0,
    `prize` DECIMAL(12,2) DEFAULT 0.00,
    `bet_amount` DECIMAL(12,2) NOT NULL,
    `status` ENUM('finished') DEFAULT 'finished',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
```

## 📡 APIs

### POST `/backend/keno/create-game.php`

Cria um novo jogo de Keno.

**Request:**
```json
{
  "chosen_numbers": [1, 5, 10, 15, 20],
  "bet_amount": 1.00
}
```

**Response:**
```json
{
  "success": true,
  "game": {
    "id": 1,
    "user_id": 1,
    "chosen_numbers": [1, 5, 10, 15, 20],
    "drawn_numbers": [2, 5, 8, 10, 12, ...],
    "hits": 2,
    "prize": 2.00,
    "bet_amount": 1.00
  },
  "balance": 99.00
}
```

### GET `/backend/keno/get-game.php?id=1`

Busca um jogo por ID.

### GET `/backend/keno/list-games.php?limit=20&offset=0`

Lista jogos do usuário autenticado.

### GET `/backend/keno/payout-table.php`

Retorna a tabela de premiação completa.

## 🚀 Instalação

1. **Aplicar SQL:**

```bash
php backend/keno/apply-sql-via-terminal.php
```

Ou via HTTP:
```
https://seu-backend.com/backend/keno/apply-sql-via-http.php
```

2. **Frontend já está integrado**

O Keno aparece como uma tab na página do Bingo (`/bingo`).

## 🎯 Uso

1. Usuário acessa `/bingo`
2. Clica na tab "🎰 Keno"
3. Seleciona de 2 a 10 números
4. Define valor da aposta
5. Clica em "Jogar"
6. Sistema sorteia 20 números com animação
7. Mostra acertos e prêmio (se houver)

## 🔄 Integração com Sistema Existente

- **Wallet:** Usa a mesma carteira (`wallets`)
- **Transações:** Cria registros em `wallet_transactions` com `reference_type='keno'`
- **Autenticação:** Usa o mesmo sistema de autenticação
- **Sorteio:** Reutiliza lógica determinística do Bingo (adaptada para 1-80, 20 números)

## 📝 Notas

- Não usa WebSocket (assíncrono, não ao vivo)
- Usa créditos virtuais (mesma carteira do sistema)
- Sorteio é determinístico e auditável
- Tabela de premiação é configurável em `KenoPayout.php`

