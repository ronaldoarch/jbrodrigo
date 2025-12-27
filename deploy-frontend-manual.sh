#!/bin/bash

# Script de Deploy Manual do Frontend para Hostinger
# Execute este script e digite a senha quando solicitado

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploy Manual do Frontend para Hostinger${NC}"
echo ""

# Configurações
HOSTINGER_HOST="212.85.6.24"
HOSTINGER_PORT="65002"
HOSTINGER_USER="u127271520"
HOSTINGER_PATH="domains/tradicaodobicho.site/public_html"
FRONTEND_DIR="frontend-react/dist"

# Verificar se dist existe
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório $FRONTEND_DIR não encontrado!${NC}"
    echo "Execute primeiro: cd frontend-react && npm run build"
    exit 1
fi

echo -e "${YELLOW}📤 Fazendo upload para Hostinger...${NC}"
echo "Senha SSH: 2403Auror@"
echo ""

# Upload dos arquivos
echo "Upload dos arquivos..."
scp -P "$HOSTINGER_PORT" -r "$FRONTEND_DIR"/* "$HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/"

# Upload do .htaccess
if [ -f "$FRONTEND_DIR/.htaccess" ]; then
    echo -e "${YELLOW}📤 Enviando .htaccess...${NC}"
    scp -P "$HOSTINGER_PORT" "$FRONTEND_DIR/.htaccess" "$HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/"
fi

echo ""
echo -e "${GREEN}✅ Upload concluído!${NC}"
echo ""
echo -e "${GREEN}🎉 Deploy finalizado!${NC}"
echo ""
echo "Acesse: https://tradicaodobicho.site"
echo ""

