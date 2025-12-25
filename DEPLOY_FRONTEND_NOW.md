# 🚀 Deploy do Frontend - Instruções

## ✅ Build Concluído

O build do frontend foi concluído com sucesso:
- ✅ Arquivos gerados em `frontend-react/dist/`
- ✅ CSS: 35.29 kB (6.06 kB gzip)
- ✅ JS: 227.94 kB (74.57 kB gzip)

## 📤 Opções de Deploy

### Opção 1: Upload Manual via SCP (Recomendado)

Execute o comando abaixo e digite a senha quando solicitado:

```bash
cd /Users/ronaldodiasdesousa/Desktop/Projetos/jbrodrigo
./deploy-frontend-manual.sh
```

**Senha SSH:** `2403Auror@`

### Opção 2: Upload Manual via FileZilla

1. Abra o FileZilla
2. Conecte-se ao servidor:
   - **Host:** `sftp://212.85.6.24`
   - **Porta:** `65002`
   - **Usuário:** `u127271520`
   - **Senha:** `2403Auror@`
3. Navegue até: `domains/tradicaodobicho.site/public_html/`
4. Faça upload de **todo o conteúdo** de `frontend-react/dist/` para `public_html/`
5. Certifique-se de que o `.htaccess` também foi enviado

### Opção 3: Comando SCP Direto

```bash
cd /Users/ronaldodiasdesousa/Desktop/Projetos/jbrodrigo/frontend-react

# Upload dos arquivos
scp -P 65002 -r dist/* u127271520@212.85.6.24:domains/tradicaodobicho.site/public_html/

# Upload do .htaccess
scp -P 65002 dist/.htaccess u127271520@212.85.6.24:domains/tradicaodobicho.site/public_html/
```

**Senha:** `2403Auror@`

## 📋 Arquivos para Upload

Certifique-se de enviar:
- ✅ `index.html`
- ✅ `assets/` (pasta completa com CSS e JS)
- ✅ `.htaccess` (importante para SPA routing)

## ✅ Verificação Pós-Deploy

Após o upload:

1. **Acesse:** https://tradicaodobicho.site
2. **Verifique:**
   - ✅ Página carrega sem erros
   - ✅ Cores azul e dourado estão corretas
   - ✅ Animações funcionando
   - ✅ Console do navegador sem erros (F12)
   - ✅ Login funciona corretamente

## 🔧 Troubleshooting

### Se a página não carregar:
1. Verifique se o `.htaccess` foi enviado
2. Verifique permissões dos arquivos (644 para arquivos, 755 para pastas)
3. Verifique o console do navegador (F12) para erros

### Se houver erro 404:
- Certifique-se de que o `.htaccess` está na raiz do `public_html/`
- Verifique se o Apache tem `mod_rewrite` habilitado

### Se as cores não estiverem corretas:
- Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
- Verifique se os arquivos CSS foram enviados corretamente

## 📝 Status

- ✅ Build concluído
- ✅ Arquivos prontos em `frontend-react/dist/`
- ⏳ Aguardando upload para Hostinger

---

**Próximo passo:** Execute o upload usando uma das opções acima!

