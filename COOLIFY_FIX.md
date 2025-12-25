# 🔧 Correção: Dockerfile não encontrado no Coolify

## ❌ Problema

Erro no deploy:
```
ERROR: failed to build: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

## ✅ Solução

O Coolify procura o `Dockerfile` na **raiz do repositório**, mas estava em `backend/Dockerfile`.

### Opção 1: Usar Dockerfile na Raiz (Recomendado)

✅ **Já criado!** O arquivo `Dockerfile` na raiz agora copia o conteúdo do `backend/`.

**No Coolify:**
1. Vá em **Configuration**
2. **Dockerfile Path**: Deixe vazio ou `./Dockerfile`
3. **Root Directory**: Deixe vazio (raiz)
4. Clique em **Deploy**

### Opção 2: Configurar Caminho no Coolify

Se preferir manter `backend/Dockerfile`:

1. No Coolify, vá em **Configuration**
2. **Root Directory**: `backend`
3. **Dockerfile Path**: `Dockerfile` (ou deixe vazio)
4. Clique em **Deploy**

## 🔧 Configuração Recomendada no Coolify

### Application Settings:

- **Repository**: `ronaldoarch/jbrodrigo`
- **Branch**: `main`
- **Build Pack**: `Docker`
- **Dockerfile Path**: (vazio ou `./Dockerfile`)
- **Root Directory**: (vazio - raiz)
- **Port**: `80`

### Environment Variables:

```env
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=44951
DB_NAME=railway
DB_USER=root
DB_PASSWORD=wktlYoHTkATnPgiUrvSBVkxHcNACjprR
APP_ENV=production
TZ=America/Sao_Paulo
```

**Importante:** Marque `APP_ENV` como **"Runtime only"** para evitar o warning de build-time.

## 🚀 Deploy Novamente

1. No Coolify, clique em **Deploy**
2. Aguarde o build completar
3. Verifique os logs se houver erros

## ✅ Verificação

Após deploy bem-sucedido:

```bash
# Testar API
curl https://backend.seudominio.com.br/api/config.php

# Deve retornar JSON com configurações
```

## 🐛 Troubleshooting

### Ainda não encontra Dockerfile?

1. Verifique se o arquivo `Dockerfile` está na raiz do repositório
2. Verifique se foi commitado: `git ls-files | grep Dockerfile`
3. Faça push: `git push origin main`

### Erro de permissão?

O Dockerfile já configura permissões corretas. Se ainda houver problema:

```dockerfile
# Adicionar ao Dockerfile se necessário
RUN chmod -R 777 /var/www/html/logs
```

### Erro de conexão com banco?

Verifique variáveis de ambiente no Coolify e teste conexão manualmente.

