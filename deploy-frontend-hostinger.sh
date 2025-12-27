#!/bin/bash

# Script de Deploy do Frontend para Hostinger
# Usa expect para automatizar a senha SSH

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

echo -e "${GREEN}🚀 Iniciando deploy do frontend para Hostinger...${NC}"

# Verificar se está no diretório correto
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório $FRONTEND_DIR não encontrado!${NC}"
    exit 1
fi

# Verificar se dist existe
if [ ! -d "$FRONTEND_DIR/dist" ]; then
    echo -e "${RED}❌ Erro: Diretório dist não encontrado! Execute 'npm run build' primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build encontrado!${NC}"

# Criar script expect temporário
EXPECT_SCRIPT=$(mktemp)
cat > "$EXPECT_SCRIPT" << 'EXPECT_EOF'
#!/usr/bin/expect -f
set timeout 60
set SSH_HOST [lindex $argv 0]
set SSH_PORT [lindex $argv 1]
set SSH_USER [lindex $argv 2]
set SSH_PASS [lindex $argv 3]
set REMOTE_PATH [lindex $argv 4]
set LOCAL_DIR [lindex $argv 5]

# Upload dos arquivos do dist
spawn scp -P $SSH_PORT -r $LOCAL_DIR/index.html $LOCAL_DIR/.htaccess $SSH_USER@$SSH_HOST:$REMOTE_PATH/
expect {
    "password:" {
        send "$SSH_PASS\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}

# Upload da pasta assets
spawn scp -P $SSH_PORT -r $LOCAL_DIR/assets $SSH_USER@$SSH_HOST:$REMOTE_PATH/
expect {
    "password:" {
        send "$SSH_PASS\r"
        exp_continue
    }
    eof
}

# Configurar permissões
spawn ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "cd $REMOTE_PATH && chmod 644 index.html .htaccess && chmod -R 755 assets/ && echo 'Permissões configuradas!'"
expect {
    "password:" {
        send "$SSH_PASS\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
EXPECT_EOF

chmod +x "$EXPECT_SCRIPT"

# Verificar se expect está instalado
if ! command -v expect &> /dev/null; then
    echo -e "${YELLOW}⚠️  expect não encontrado. Instalando...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install expect
        else
            echo -e "${RED}❌ Por favor, instale expect manualmente: brew install expect${NC}"
            rm "$EXPECT_SCRIPT"
            exit 1
        fi
    else
        echo -e "${RED}❌ Por favor, instale expect manualmente: sudo apt-get install expect${NC}"
        rm "$EXPECT_SCRIPT"
        exit 1
    fi
fi

# Executar deploy
echo -e "${YELLOW}📤 Fazendo upload dos arquivos...${NC}"
cd "$(dirname "$0")"
expect -f "$EXPECT_SCRIPT" "$SSH_HOST" "$SSH_PORT" "$SSH_USER" "$SSH_PASS" "$REMOTE_PATH" "$FRONTEND_DIR/dist"

# Limpar script temporário
rm "$EXPECT_SCRIPT"

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 Acesse: https://tradicaodobicho.site${NC}"
