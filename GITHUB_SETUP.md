# 📦 Configuração do Repositório GitHub

## 🔗 Repositório

**URL:** https://github.com/ronaldoarch/jbrodrigo.git

## 📥 Clonar Repositório

```bash
git clone https://github.com/ronaldoarch/jbrodrigo.git
cd jbrodrigo
```

## 🔧 Configuração Inicial

### 1. Configurar Banco de Dados

```bash
# Copiar arquivo de exemplo
cp backend/scraper/config/database.example.php backend/scraper/config/database.php

# Editar com suas credenciais
nano backend/scraper/config/database.php
```

### 2. Instalar Dependências do Frontend

```bash
cd frontend-react
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Frontend
cd frontend-react
echo "VITE_API_URL=https://seudominio.com.br/backend" > .env.production

# Backend (se necessário)
# Configure diretamente em database.php
```

## 🚀 Deploy a partir do GitHub

### Opção 1: Clonar no Servidor

```bash
# No servidor (VPS ou Hostinger via SSH)
ssh -p 65002 u127271520@212.85.6.24

# Clonar repositório
cd domains/tradicaodobicho.site
git clone https://github.com/ronaldoarch/jbrodrigo.git temp
mv temp/backend backend
mv temp/public_html/* public_html/
rm -rf temp

# Configurar banco de dados
nano backend/scraper/config/database.php
```

### Opção 2: Deploy Automático via GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build Frontend
        run: |
          cd frontend-react
          npm install
          npm run build
      
      - name: Deploy to Hostinger
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: 212.85.6.24
          username: u127271520
          password: ${{ secrets.HOSTINGER_PASSWORD }}
          local-dir: ./frontend-react/dist/
          server-dir: /domains/tradicaodobicho.site/public_html/
```

## 🔐 Segurança

### Arquivos Não Commitados

O `.gitignore` está configurado para **NÃO** commitar:

- ✅ `backend/scraper/config/database.php` (credenciais)
- ✅ `.env` e `.env.production` (variáveis sensíveis)
- ✅ `node_modules/` (dependências)
- ✅ `dist/` (builds)

### Configurar Secrets no GitHub

Para GitHub Actions, configure secrets em:
**Settings → Secrets and variables → Actions**

- `HOSTINGER_PASSWORD`: Senha SSH
- `DB_PASSWORD`: Senha do banco (se necessário)

## 📝 Comandos Git Úteis

```bash
# Ver status
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "Descrição das mudanças"

# Push
git push origin main

# Pull (atualizar do GitHub)
git pull origin main

# Ver histórico
git log --oneline

# Criar branch
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main
```

## 🔄 Workflow de Desenvolvimento

1. **Desenvolvimento Local:**
   ```bash
   git checkout -b feature/minha-feature
   # Fazer mudanças
   git add .
   git commit -m "Adiciona nova feature"
   git push origin feature/minha-feature
   ```

2. **Criar Pull Request no GitHub:**
   - Vá para https://github.com/ronaldoarch/jbrodrigo
   - Clique em "Pull requests" → "New pull request"
   - Compare `feature/minha-feature` com `main`
   - Revise e merge

3. **Deploy Automático:**
   - Após merge em `main`, o deploy pode ser automático (se configurado)

## 📚 Estrutura do Repositório

```
jbrodrigo/
├── .gitignore              # Arquivos ignorados
├── README.md              # Documentação principal
├── database.sql           # Estrutura do banco
├── backend/               # Backend PHP
├── frontend-react/         # Frontend React
├── api/                   # APIs públicas
└── docs/                  # Documentação adicional
```

## 🆘 Troubleshooting

### Erro ao fazer push

```bash
# Verificar remote
git remote -v

# Se necessário, reconfigurar
git remote set-url origin https://github.com/ronaldoarch/jbrodrigo.git
```

### Arquivo sensível commitado acidentalmente

```bash
# Remover do histórico (CUIDADO!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/scraper/config/database.php" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (apenas se necessário)
git push origin --force --all
```

### Atualizar do GitHub

```bash
git pull origin main
```

## ✅ Checklist de Setup

- [ ] Repositório clonado
- [ ] `database.php` configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Variáveis de ambiente configuradas
- [ ] Testes locais funcionando
- [ ] Deploy configurado (se necessário)

