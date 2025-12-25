# ⚡ Deploy Rápido - Hostinger

## 🚀 Método Rápido (Script Automático)

```bash
# 1. Tornar script executável (se ainda não estiver)
chmod +x deploy-hostinger.sh

# 2. Executar deploy
./deploy-hostinger.sh
```

O script irá:
- ✅ Fazer build do frontend
- ✅ Upload automático via SCP
- ✅ Configurar permissões
- ✅ Pronto para uso!

## 📋 Método Manual (Passo a Passo)

### 1. Build do Frontend

```bash
cd frontend-react

# Configurar URL do backend
echo "VITE_API_URL=https://tradicaodobicho.site/backend" > .env.production

# Build
npm run build
```

### 2. Upload via SFTP (FileZilla)

**Configurações:**
- Host: `212.85.6.24`
- Porta: `65002`
- Protocolo: `SFTP`
- Usuário: `u127271520`
- Senha: `2403Auror@`

**Upload:**
- Navegue até: `domains/tradicaodobicho.site/public_html/`
- Upload de: `frontend-react/dist/*`
- Upload de: `public_html/.htaccess`

### 3. Upload via SCP (Linha de Comando)

```bash
cd frontend-react/dist

# Upload arquivos
scp -P 65002 -r * u127271520@212.85.6.24:domains/tradicaodobicho.site/public_html/

# Upload .htaccess
scp -P 65002 ../public_html/.htaccess u127271520@212.85.6.24:domains/tradicaodobicho.site/public_html/
```

### 4. Configurar Permissões

```bash
# Conectar via SSH
ssh -p 65002 u127271520@212.85.6.24

# Navegar para public_html
cd domains/tradicaodobicho.site/public_html

# Configurar permissões
chmod 644 index.html
chmod 644 .htaccess
chmod -R 755 assets/
```

## ✅ Verificação

1. Acesse: `https://tradicaodobicho.site`
2. Abra Console (F12) e verifique erros
3. Teste login/registro

## 🔧 Configuração do Backend

Se backend estiver na mesma Hostinger:

```bash
# Via SSH
ssh -p 65002 u127271520@212.85.6.24

# Criar diretório backend
mkdir -p domains/tradicaodobicho.site/backend

# Upload backend (do seu computador)
scp -P 65002 -r backend/* u127271520@212.85.6.24:domains/tradicaodobicho.site/backend/
```

## 📝 Credenciais SSH

- **IP:** `212.85.6.24`
- **Porta:** `65002`
- **Usuário:** `u127271520`
- **Senha:** `2403Auror@`
- **Comando:** `ssh -p 65002 u127271520@212.85.6.24`

## 🆘 Problemas Comuns

### Erro de permissão SSH
```bash
# Adicionar chave SSH (recomendado)
ssh-copy-id -p 65002 u127271520@212.85.6.24
```

### Erro 404 nas rotas
- Verifique se `.htaccess` está no lugar correto
- Verifique se `mod_rewrite` está habilitado

### Erro de CORS
- Configure `VITE_API_URL` corretamente no build
- Verifique URL do backend

