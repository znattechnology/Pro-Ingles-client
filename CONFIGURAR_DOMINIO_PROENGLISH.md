# Configuração Completa do Domínio proenglish.cloud

## ✅ Passo 1: DNS já configurado na Hostinger

### Registros DNS necessários:
```
A       @         34.245.99.169
A       www       34.245.99.169  
CNAME   api       proenglish.cloud
```

## 🔧 Passo 2: Aguardar propagação DNS (30min - 48h)

Teste se propagou:
```bash
nslookup proenglish.cloud
ping proenglish.cloud
```

## 🔒 Passo 3: Configurar SSL Let's Encrypt

Quando DNS propagar, execute no servidor:

```bash
# 1. Atualizar configuração Nginx
sudo cp /etc/nginx/conf.d/proenglish-dev.conf /etc/nginx/conf.d/proenglish-ssl.conf

# 2. Editar arquivo para usar domínio
sudo nano /etc/nginx/conf.d/proenglish-ssl.conf
# Mudar: server_name 34.245.99.169;
# Para:  server_name proenglish.cloud www.proenglish.cloud;

# 3. Testar configuração
sudo nginx -t

# 4. Recarregar Nginx
sudo systemctl reload nginx

# 5. Obter certificado SSL
sudo certbot --nginx -d proenglish.cloud -d www.proenglish.cloud --non-interactive --agree-tos --email vivaldo.adao2019@gmail.com
```

## 🚀 Passo 4: Variáveis de ambiente Vercel

Após SSL configurado, atualizar no Vercel:

```
NEXT_PUBLIC_DJANGO_API_URL = https://proenglish.cloud/api/v1
NEXT_PUBLIC_API_URL = https://proenglish.cloud
NEXT_PUBLIC_FRONTEND_URL = https://pro-ingles-client-nine.vercel.app
```

## 🎯 Resultado Final

Endpoints funcionais:
- https://proenglish.cloud/api/v1/student/video-courses/
- https://proenglish.cloud/api/v1/subscriptions/plans/
- https://www.proenglish.cloud (redirecionamento)

## ⏰ Tempo estimado:
- DNS propagação: 30min - 48h
- Configuração SSL: 5 minutos
- Total: Máximo 48h para estar 100% funcional

## 🔍 Como verificar cada etapa:

### DNS propagou?
```bash
nslookup proenglish.cloud
# Deve retornar: 34.245.99.169
```

### Nginx funcionando?
```bash
curl -I http://proenglish.cloud/api/v1/subscriptions/plans/
# Deve retornar: 200 OK
```

### SSL funcionando?
```bash
curl -I https://proenglish.cloud/api/v1/subscriptions/plans/
# Deve retornar: 200 OK com certificado válido
```