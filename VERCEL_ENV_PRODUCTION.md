# Configurações de Variáveis de Ambiente para Produção no Vercel

## Problema Identificado
O frontend em produção (Vercel) está tentando acessar `http://34.245.99.169:8000` mas o servidor está configurado com Nginx que:
1. Redireciona todo tráfego HTTP para HTTPS
2. Faz proxy reverso para Django na porta 8000
3. Usa certificado SSL self-signed

## Solução: Configurar as seguintes variáveis no Vercel

### Painel Vercel → Settings → Environment Variables

## ✅ SOLUÇÃO DEFINITIVA: HTTPS com domínio próprio

Certificado SSL Let's Encrypt configurado com sucesso!

```
NEXT_PUBLIC_DJANGO_API_URL = https://proenglish.cloud/api/v1
NEXT_PUBLIC_API_URL = https://proenglish.cloud
NEXT_PUBLIC_FRONTEND_URL = https://pro-ingles-client-nine.vercel.app
```

**Status:**
- ✅ DNS propagado: proenglish.cloud → 34.245.99.169
- ✅ Certificado SSL válido até 07/02/2026
- ✅ URLs hardcoded localhost:8000 corrigidas no frontend (commit 53f73c7)
- 🔄 Atualizar variáveis no Vercel e fazer redeploy

### ⚠️ Importante:
- **NÃO** adicione barra (`/`) no final das URLs
- Use **HTTPS** (não HTTP)
- **NÃO** inclua a porta `:8000` pois o Nginx faz o proxy
- O Nginx está configurado para permitir CORS da origem do Vercel

## Configuração Atual do Nginx no Servidor

O servidor EC2 está rodando Nginx que:
- Escuta na porta 80 (HTTP) e redireciona para HTTPS
- Escuta na porta 443 (HTTPS) com certificado self-signed
- Faz proxy para Django (`http://127.0.0.1:8000`)
- Configurado com headers CORS para `https://pro-ingles-client-nine.vercel.app`

## Teste de Conectividade

✅ **Funcionando:** `https://34.245.99.169/api/v1/student/video-courses/` (200 OK)
✅ **Funcionando:** `https://34.245.99.169/api/v1/subscriptions/analytics/` (401 - esperado sem token)

## Próximos Passos

1. Configurar as variáveis no Vercel (acima)
2. Fazer redeploy do frontend no Vercel
3. Testar todos os endpoints que estavam falhando

## Endpoints que devem funcionar após a correção

- `/api/v1/subscriptions/analytics/`
- `/api/v1/student/video-courses/{id}/`
- `/api/v1/practice/courses/` (laboratório)
- Todos os outros endpoints da API

## Configuração do Certificado SSL

O servidor está usando certificado self-signed. Para produção, recomenda-se:
- Let's Encrypt com Certbot
- Ou certificado SSL válido