# Teste HTTP API em Produção

## URLs para testar:

1. **Planos públicos (sem auth):**
   ```
   http://34.245.99.169/api/v1/subscriptions/plans/
   ```

2. **Cursos públicos (sem auth):**
   ```
   http://34.245.99.169/api/v1/student/video-courses/
   ```

3. **Analytics (requer auth):**
   ```
   http://34.245.99.169/api/v1/subscriptions/analytics/
   ```

## Configuração Vercel:

Configure estas variáveis no Vercel e teste:

```
NEXT_PUBLIC_DJANGO_API_URL = http://34.245.99.169/api/v1
NEXT_PUBLIC_API_URL = http://34.245.99.169
NEXT_PUBLIC_FRONTEND_URL = https://pro-ingles-client-nine.vercel.app
```

## Resultado esperado:
- Endpoints públicos devem retornar dados
- Endpoints privados devem retornar 401 (sem token)
- Login deve funcionar normalmente

## Se não funcionar:
Precisaremos implementar uma das soluções HTTPS:
1. Domínio próprio + Let's Encrypt
2. AWS Application Load Balancer com certificado
3. CloudFlare como proxy SSL