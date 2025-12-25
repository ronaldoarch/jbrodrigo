#!/bin/bash

# Script de Deploy do Frontend para Hostinger
# Uso: ./deploy-frontend-hostinger.sh

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando deploy do frontend para Hostinger...${NC}"

# Configurações
FRONTEND_DIR="frontend-react"
BACKEND_URL="https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com"
HOSTINGER_HOST="212.85.6.24"
HOSTINGER_PORT="65002"
HOSTINGER_USER="u127271520"
HOSTINGER_PATH="domains/tradicaodobicho.site/public_html"

# Verificar se está no diretório correto
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório $FRONTEND_DIR não encontrado!${NC}"
    echo "Execute este script da raiz do projeto."
    exit 1
fi

# Entrar no diretório do frontend
cd "$FRONTEND_DIR"

echo -e "${YELLOW}📦 Configurando variáveis de ambiente...${NC}"
echo "VITE_API_URL=$BACKEND_URL" > .env.production

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependências...${NC}"
    npm install
fi

# Build
echo -e "${YELLOW}🔨 Fazendo build do frontend...${NC}"
npm run build

# Verificar se build foi bem-sucedido
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erro: Build falhou! Diretório dist/ não foi criado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído!${NC}"

# Perguntar se deseja fazer upload
read -p "Deseja fazer upload para Hostinger agora? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}⏭️  Upload cancelado. Arquivos estão em $FRONTEND_DIR/dist/${NC}"
    exit 0
fi

# Upload via SCP
echo -e "${YELLOW}📤 Fazendo upload para Hostinger...${NC}"
echo "Senha SSH: 2403Auror@"

# Upload dos arquivos
scp -P "$HOSTINGER_PORT" -r dist/* "$HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/"

# Upload do .htaccess
if [ -f ".htaccess" ]; then
    echo -e "${YELLOW}📤 Enviando .htaccess...${NC}"
    scp -P "$HOSTINGER_PORT" .htaccess "$HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/"
fi

echo -e "${GREEN}✅ Upload concluído!${NC}"
echo ""
echo -e "${GREEN}🎉 Deploy finalizado!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Acesse: https://tradicaodobicho.site"
echo "2. Verifique o console do navegador (F12)"
echo "3. Teste as funcionalidades"
echo ""
echo -e "${YELLOW}⚠️  Lembre-se: Faça redeploy do backend no Coolify para aplicar as mudanças de CORS!${NC}"

