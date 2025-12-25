# 🎲 Sistema de Jogo do Bicho

Sistema completo de apostas online para o Jogo do Bicho desenvolvido com React + PHP.

## 📋 Estrutura do Projeto

```
jbrodrigo/
├── database.sql              # Estrutura completa do banco de dados
├── backend/                  # Backend PHP
│   ├── auth/                # Autenticação
│   ├── bets/                # Sistema de apostas
│   ├── wallet/              # Carteira e transações
│   ├── payments/            # Pagamentos
│   ├── admin/               # Painel administrativo
│   ├── scraper/             # Scrapers de resultados
│   ├── cron/                # Cron jobs
│   └── utils/               # Utilitários
├── api/                      # APIs públicas
├── frontend-react/           # Frontend React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── contexts/       # Contextos
│   │   └── services/       # Serviços API
│   └── package.json
└── public_html/              # Arquivos públicos para deploy
```

## 🚀 Instalação

### Pré-requisitos

- PHP 7.4+
- MySQL/MariaDB 5.7+
- Node.js 18+
- Apache com mod_rewrite

### 1. Banco de Dados

```bash
# Criar banco de dados
mysql -u root -p
CREATE DATABASE jogo_do_bicho CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Importar estrutura
mysql -u root -p jogo_do_bicho < database.sql
```

### 2. Configuração do Backend

Copie `backend/scraper/config/database.example.php` para `backend/scraper/config/database.php` e configure:

```php
$host = 'localhost';
$dbname = 'jogo_do_bicho';
$username = 'seu_usuario';
$password = 'sua_senha';
```

### 3. Frontend React

```bash
cd frontend-react
npm install
npm run dev  # Desenvolvimento
npm run build  # Produção
```

## 📚 Documentação

- **`INSTALL.md`** - Guia de instalação completo
- **`DEPLOY_ARCHITECTURE.md`** - Arquiteturas de deploy
- **`DEPLOY_HOSTINGER_VPS_RAILWAY.md`** - Deploy distribuído
- **`DEPLOY_HOSTINGER_SSH.md`** - Deploy na Hostinger
- **`QUICK_DEPLOY.md`** - Deploy rápido

## 🔧 Funcionalidades

- ✅ Sistema de autenticação (login/registro)
- ✅ Sistema de apostas completo
- ✅ Cálculo de apostas e prêmios
- ✅ Sistema de liquidação automática
- ✅ Carteira e transações
- ✅ Listagem de extrações
- ✅ Resultados dos sorteios
- ✅ Frontend React completo
- ✅ Design responsivo

## 🔐 Segurança

- Validação de CPF
- Hash de senhas (bcrypt)
- Prepared statements (SQL injection)
- Proteção CSRF
- Validação de horários de fechamento
- Transações de banco para operações críticas

## 📝 Licença

Este projeto é fornecido como está, para fins educacionais.

## ⚠️ Aviso Legal

Este sistema é apenas para fins educacionais. Certifique-se de cumprir todas as leis e regulamentações locais relacionadas a jogos de azar antes de usar em produção.
