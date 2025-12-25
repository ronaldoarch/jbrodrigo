# 🚀 Guia Rápido de Deploy

## ⚡ Resumo das Opções

### Opção 1: Tudo na Hostinger (Simples - R$ 15-30/mês)
✅ **Melhor para:** Começar, testar, MVP  
✅ **Vantagens:** Simples, barato, tudo em um lugar  
❌ **Limitações:** Recursos compartilhados, menos escalável

### Opção 2: Distribuído (Recomendado - R$ 70-85/mês)
✅ **Melhor para:** Produção, muitos usuários  
✅ **Vantagens:** Performance, escalabilidade, recursos dedicados  
📋 **Arquitetura:**
- Frontend → Hostinger
- Backend → VPS (DigitalOcean/Linode)
- Banco → Railway

## 📚 Documentação Completa

- **`DEPLOY_ARCHITECTURE.md`** - Comparação detalhada das arquiteturas
- **`DEPLOY_HOSTINGER_VPS_RAILWAY.md`** - Guia passo a passo completo
- **`INSTALL.md`** - Instalação geral do sistema

## 🎯 Recomendação

**Para começar:** Use tudo na Hostinger (Opção 1)  
**Para produção:** Use arquitetura distribuída (Opção 2)

A arquitetura distribuída vale a pena se você espera:
- Muitos usuários simultâneos
- Alto volume de apostas
- Necessidade de performance consistente
- Escalabilidade futura

## 🔧 Configurações Importantes

### Para Arquitetura Distribuída

1. **Backend**: Configure variáveis de ambiente no VPS
2. **CORS**: Configure domínios permitidos em `backend/cors.php`
3. **Frontend**: Configure `VITE_API_URL` no build
4. **Banco**: Use credenciais do Railway em `database.php`

Veja `DEPLOY_HOSTINGER_VPS_RAILWAY.md` para detalhes completos.

