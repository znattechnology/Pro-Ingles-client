# 🚀 Configuração do Vercel para ProEnglish

## 📋 Variáveis de Ambiente para o Vercel

Configure estas variáveis no **Dashboard do Vercel** → **Settings** → **Environment Variables**:

### 🔑 **Variáveis Obrigatórias:**

```bash
# API Backend (via Next.js proxy para contornar Mixed Content)
NEXT_PUBLIC_DJANGO_API_URL=/api/django

# Frontend URL
NEXT_PUBLIC_FRONTEND_URL=https://pro-ingles-client-nine.vercel.app

# Convex
NEXT_PUBLIC_CONVEX_URL=https://accurate-setter-955.convex.cloud
CONVEX_DEPLOYMENT=dev:accurate-setter-955

# AWS S3
S3_BUCKET_NAME=lms-s3-backet
CLOUDFRONT_DOMAIN=https://d13552ljikd29j.cloudfront.net

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51QXH9PKQiXV0t7h43Mhat1LkdFlvuA2kzhJxFGJ59RYOZzMcT1lNURhroa5VZUSguBAia4mv6ZaZ8HC0bCg4GIUK00UL2Blevf

# Feature Flags
NEXT_PUBLIC_REDUX_COURSE_SELECTION=true
NEXT_PUBLIC_REDUX_USER_PROGRESS=true
NEXT_PUBLIC_REDUX_PRACTICE_SESSION=true
NEXT_PUBLIC_REDUX_TEACHER_MANAGEMENT=true
NEXT_PUBLIC_REDUX_MAIN_LEARN_PAGE=true
NEXT_PUBLIC_REDUX_TEACHER_DASHBOARD=true
NEXT_PUBLIC_REDUX_UNIT_MANAGEMENT=true
NEXT_PUBLIC_OPTIMISTIC_UPDATES=true
NEXT_PUBLIC_DEBUG_REDUX=false
NEXT_PUBLIC_USE_MOCK_SPEAKING=false
```

## 🔧 **Status da Infraestrutura:**

### ✅ **Backend (AWS EC2 t3.small)**
- **URL**: https://34.245.99.169
- **Health Check**: https://34.245.99.169/api/health/
- **SSL**: ✅ Configurado (certificado auto-assinado)
- **CORS**: ✅ Configurado para Vercel
- **Status**: 🟢 Operacional

### ✅ **Database**
- **Tipo**: Neon PostgreSQL
- **Status**: 🟢 Conectado
- **Latency**: ~250ms

### ✅ **Storage**
- **S3 Bucket**: lms-s3-backet
- **CloudFront**: https://d13552ljikd29j.cloudfront.net
- **Status**: 🟢 Operacional

## 🚀 **Deploy Automático:**
- **Trigger**: Push para branch `main`
- **GitHub Actions**: ✅ Configurado
- **Vercel**: ✅ Deploy automático ativo

## 🔒 **Mixed Content Resolution:**
- ✅ API Route proxy `/api/django/[...path]` criado
- ✅ Suporta todos métodos HTTP (GET, POST, PUT, DELETE)
- ✅ CORS headers automáticos
- ✅ Contorna certificado SSL inválido
- ✅ Logs detalhados para debug

## 💰 **Custo Total:**
- **AWS EC2**: ~$20/mês
- **Vercel**: Gratuito (Hobby Plan)
- **Neon DB**: Gratuito (Starter Plan)
- **Total**: ~$20/mês (50% abaixo do orçamento)