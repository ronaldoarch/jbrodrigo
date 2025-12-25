#!/bin/bash

# Script de Deploy Automático para Hostinger
# Uso: ./deploy-hostinger.sh

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações SSH
SSH_HOST="212.85.6.24"
SSH_PORT="65002"
SSH_USER="u127271520"
SSH_PASS="2403Auror@"
REMOTE_PATH="domains/tradicaodobicho.site/public_html"

# Configurações do projeto
FRONTEND_DIR="frontend-react"
BACKEND_API_URL="${BACKEND_API_URL:-https://tradicaodobicho.site/backend}"

echo -e "${GREEN}🚀 Iniciando deploy para Hostinger...${NC}"

# Verificar se está no diretório correto
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório $FRONTEND_DIR não encontrado!${NC}"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Erro: npm não está instalado!${NC}"
    exit 1
fi

# Verificar se node está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Erro: node não está instalado!${NC}"
    exit 1
fi

# Carregar nvm se existir (para usuários que usam nvm)
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
fi

# Build do frontend
echo -e "${YELLOW}📦 Fazendo build do frontend...${NC}"
cd "$FRONTEND_DIR"

# Criar .env.production se não existir
if [ ! -f ".env.production" ]; then
    echo "VITE_API_URL=$BACKEND_API_URL" > .env.production
    echo -e "${GREEN}✅ Criado .env.production${NC}"
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependências...${NC}"
    npm install
fi

# Verificar se build já existe e limpar se necessário
if [ -d "dist" ]; then
    echo -e "${YELLOW}🧹 Limpando build anterior...${NC}"
    rm -rf dist
fi

# Build usando npm run build
echo -e "${YELLOW}🔨 Executando build...${NC}"
npm run build

# Copiar .htaccess para dist (se não foi copiado automaticamente)
if [ -f ".htaccess" ] && [ ! -f "dist/.htaccess" ]; then
    cp .htaccess dist/.htaccess
    echo -e "${GREEN}✅ .htaccess copiado${NC}"
fi

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erro: Build falhou! Diretório dist não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído!${NC}"

# Verificar se sshpass está instalado (para senha automática)
if command -v sshpass &> /dev/null; then
    USE_SSHPASS=true
else
    USE_SSHPASS=false
    echo -e "${YELLOW}⚠️  sshpass não encontrado. Você precisará digitar a senha manualmente.${NC}"
    echo -e "${YELLOW}   Instale com: brew install hudochenkov/sshpass/sshpass (Mac) ou apt-get install sshpass (Linux)${NC}"
fi

# Upload via SCP
echo -e "${YELLOW}📤 Fazendo upload dos arquivos...${NC}"

if [ "$USE_SSHPASS" = true ]; then
    sshpass -p "$SSH_PASS" scp -P "$SSH_PORT" -r dist/* "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"
    sshpass -p "$SSH_PASS" scp -P "$SSH_PORT" ../public_html/.htaccess "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"
else
    scp -P "$SSH_PORT" -r dist/* "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"
    scp -P "$SSH_PORT" ../public_html/.htaccess "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"
fi

echo -e "${GREEN}✅ Upload concluído!${NC}"

# Configurar permissões via SSH
echo -e "${YELLOW}🔧 Configurando permissões...${NC}"

if [ "$USE_SSHPASS" = true ]; then
    sshpass -p "$SSH_PASS" ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" << EOF
cd $REMOTE_PATH
chmod 644 index.html
chmod 644 .htaccess
chmod -R 755 assets/
echo "Permissões configuradas!"
EOF
else
    echo -e "${YELLOW}⚠️  Configure permissões manualmente via SSH:${NC}"
    echo -e "${YELLOW}   ssh -p $SSH_PORT $SSH_USER@$SSH_HOST${NC}"
    echo -e "${YELLOW}   cd $REMOTE_PATH${NC}"
    echo -e "${YELLOW}   chmod 644 index.html .htaccess${NC}"
    echo -e "${YELLOW}   chmod -R 755 assets/${NC}"
fi

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 Acesse: https://tradicaodobicho.site${NC}"

