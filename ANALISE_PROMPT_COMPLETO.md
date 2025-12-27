# 📊 Análise: Prompt Completo vs Código Atual

Este documento compara o prompt completo fornecido com a implementação atual do sistema.

## ✅ O QUE JÁ ESTÁ IMPLEMENTADO

### Banco de Dados
- ✅ Tabela `users` - Implementada corretamente
- ✅ Tabela `wallets` - Implementada (com diferenças - ver abaixo)
- ✅ Tabela `extractions` - Implementada (com diferenças estruturais)
- ✅ Tabela `games` - Implementada (com diferenças)
- ✅ Tabela `bets` - Implementada corretamente
- ✅ Tabela `bet_items` - Implementada corretamente
- ✅ Tabela `wallet_transactions` - Implementada corretamente
- ✅ Tabela `payments` - Implementada corretamente
- ✅ Tabela `withdrawals` - Implementada corretamente
- ✅ Tabela `settings` - Implementada corretamente
- ✅ Tabela `banners` - Implementada corretamente
- ✅ Tabela `promotions` - Implementada corretamente
- ✅ Tabela `stories` - Implementada corretamente

### Frontend
- ✅ Estrutura React com Vite
- ✅ Sistema de rotas
- ✅ Autenticação (AuthContext)
- ✅ Páginas principais implementadas
- ✅ Componentes reutilizáveis
- ✅ Layout responsivo

### Backend
- ✅ Sistema de autenticação
- ✅ CRUD de apostas
- ✅ Sistema de cálculo (BetCalculator)
- ✅ Sistema de liquidação (BetSettlement)
- ✅ Scrapers de resultados
- ✅ Sistema de carteira
- ✅ APIs públicas

## ⚠️ DIFERENÇAS E FALTANTES

### 1. Banco de Dados

#### Tabela `wallets` - FALTANDO CAMPOS
**Prompt pede:**
```sql
locked_balance DECIMAL(12,2) DEFAULT 0.00
total_deposited DECIMAL(12,2) DEFAULT 0.00
total_withdrawn DECIMAL(12,2) DEFAULT 0.00
total_wagered DECIMAL(12,2) DEFAULT 0.00
total_won DECIMAL(12,2) DEFAULT 0.00
```

**Código atual tem apenas:**
```sql
balance DECIMAL(12,2) DEFAULT 0.00
bonus_balance DECIMAL(12,2) DEFAULT 0.00
```

#### Tabela `extractions` - ESTRUTURA DIFERENTE
**Prompt pede:**
- Campo `loteria` VARCHAR(50) - nome da loteria (PT RIO, PT SP, LOOK, etc.)
- Campo `description` VARCHAR(120) - descrição completa

**Código atual tem:**
- Campo `description` VARCHAR(120) - usado para PPT, PTM, etc.
- Campo `game_type` VARCHAR(50) - usado para tipo de jogo
- **FALTA:** Campo `loteria` explícito

#### Tabela `games` - DIFERENÇA NO CAMPO ANIMAL
**Prompt pede:**
- Campo `animal` VARCHAR(50) - nome do animal (ex: "Avestruz")

**Código atual tem:**
- Campo `animal` INT - código do animal (1-25)

#### Tabela `odds` - AUSENTE
**Prompt pede tabela completa:**
```sql
CREATE TABLE odds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_type VARCHAR(50),
    bet_type VARCHAR(50),
    position INT NULL,
    multiplier DECIMAL(10,2),
    min_bet DECIMAL(10,2),
    max_bet DECIMAL(10,2),
    is_active BOOLEAN,
    ...
)
```

**Código atual:** Não existe tabela `odds`. As cotações parecem estar hardcoded ou em outro lugar.

#### Tabela `modalities` - AUSENTE
**Prompt pede:**
```sql
CREATE TABLE modalities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modality_id VARCHAR(50) UNIQUE,
    is_active BOOLEAN,
    ...
)
```

**Código atual:** Não existe tabela `modalities` para ativar/desativar modalidades.

### 2. Sistema de Extrações

#### Estrutura de Loterias
**Prompt define:**
- Campo `loteria` explícito (PT RIO, PT SP, LOOK, LOTECE, LOTEP, FEDERAL, NACIONAL, PARA TODOS)
- Mapeamento específico entre loteria e scraper
- Regras especiais (PPT 09:30 → PT RIO 09:20)

**Código atual:**
- Usa `description` e `game_type` combinados
- Pode não ter o mapeamento explícito conforme descrito

### 3. Sistema de Scrapers

**Prompt descreve:**
- Sistema detalhado de scraping do Bicho Certo API
- Parsing específico de HTML
- Normalização de tipos de jogo
- Mapeamento de LOTECE (Manhã → 11:00, Tarde 1 → 14:00, Tarde 2 → 15:00)

**Código atual:**
- Implementação de scrapers existe, mas precisa verificar se segue exatamente o padrão do prompt

### 4. Sistema de Liquidação

**Prompt descreve:**
- Algoritmos específicos para cada modalidade
- Verificação de horário (real_close_time + 5 minutos)
- Busca de resultados com caption exato

**Código atual:**
- BetSettlement existe, mas precisa verificar se segue todos os algoritmos descritos

### 5. Página de Resultados

**Prompt descreve:**
- Filtros por estado
- Agrupamento por loteria e horário
- Validações de estado
- Prevenção de duplicatas

**Código atual:**
- Página Resultados existe, mas precisa verificar se tem todas as funcionalidades descritas

## 🔧 PRÓXIMOS PASSOS RECOMENDADOS

1. **Atualizar banco de dados:**
   - Adicionar campos faltantes em `wallets`
   - Criar tabela `odds`
   - Criar tabela `modalities`
   - Adicionar campo `loteria` em `extractions` (ou mapear corretamente)
   - Decidir sobre campo `animal` em `games` (INT vs VARCHAR)

2. **Implementar sistema de cotações:**
   - Criar CRUD para tabela `odds`
   - API para buscar cotações dinâmicas
   - Atualizar frontend para usar cotações do banco

3. **Melhorar sistema de scrapers:**
   - Implementar parsing conforme descrito no prompt
   - Adicionar mapeamentos especiais (LOTECE, PPT, etc.)
   - Garantir normalização de tipos

4. **Aprimorar liquidação:**
   - Verificar algoritmos de cada modalidade
   - Implementar validações de horário
   - Melhorar busca de resultados

5. **Aprimorar página de Resultados:**
   - Implementar filtros por estado
   - Adicionar validações de estado
   - Prevenir duplicatas

## 📝 NOTAS IMPORTANTES

- O prompt é EXTREMAMENTE detalhado e pode conter especificações mais avançadas do que a implementação atual
- Algumas diferenças podem ser intencionais (ex: campo `animal` como INT pode ser mais eficiente que VARCHAR)
- É importante verificar se as funcionalidades existentes atendem aos requisitos do negócio, mesmo que a estrutura seja diferente

## ❓ PERGUNTAS PARA O USUÁRIO

1. Você quer que eu atualize o banco de dados para corresponder exatamente ao prompt?
2. Você quer que eu implemente as funcionalidades faltantes?
3. Existem diferenças intencionais ou prefere seguir exatamente o prompt?
4. Por onde devo começar? (Banco de dados, Scrapers, Liquidação, Frontend?)

