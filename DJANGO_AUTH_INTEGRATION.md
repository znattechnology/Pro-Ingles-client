# Django Authentication Integration Guide

Este documento descreve como integrar e usar o novo sistema de autenticação Django no frontend Next.js.

## 📋 Resumo da Migração

Migração completa do sistema Clerk para Django authentication, mantendo os mesmos layouts e UX dos formulários, mas agora integrando com o backend Django via JWT tokens.

## 🚀 Componentes Criados

### 1. Serviços de API
- `lib/django-auth.ts` - Serviços para todas as chamadas de autenticação
- `lib/http-interceptor.ts` - Interceptor HTTP com refresh automático de tokens
- `lib/django-middleware.ts` - Middleware para proteção de rotas

### 2. Componentes de Interface
- `components/DjangoSignIn.tsx` - Formulário de login
- `components/DjangoSignUp.tsx` - Formulário de registro  
- `components/EmailVerification.tsx` - Verificação por código de 6 dígitos
- `components/PasswordReset.tsx` - Reset de senha com código

### 3. Redux Store
- `redux/features/auth/authSlice.ts` - Estado de autenticação atualizado
- `redux/features/auth/authApi.ts` - API calls do Django

### 4. Hooks Customizados
- `hooks/useDjangoAuth.ts` - Hook principal para gerenciar autenticação

### 5. Páginas Atualizadas
- `/signin` - Login com Django
- `/signup` - Registro com Django
- `/verify-email` - Nova página de verificação
- `/forgot-password` - Reset de senha

## 🔧 Configuração Necessária

### 1. Instalar Dependências
```bash
cd ProEnglish-client
npm install jwt-decode
```

### 2. Variáveis de Ambiente
Arquivo `.env.local` já criado com:
```env
NEXT_PUBLIC_DJANGO_API_URL=http://localhost:8002/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### 3. Atualizar Middleware (Opcional)
Para usar o novo middleware Django, substituir o conteúdo de `middleware.ts`:

```typescript
import { djangoAuthMiddleware } from "@/lib/django-middleware";

export default function middleware(request: NextRequest) {
  return djangoAuthMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## 🔄 Fluxos de Autenticação

### 1. Registro de Usuário
1. Usuário preenche formulário (`/signup`)
2. Django retorna `requires_verification: true`
3. Usuário é redirecionado para `/verify-email`
4. Após verificação, tokens JWT são armazenados
5. Redirecionamento baseado no role do usuário

### 2. Login
1. Usuário faz login (`/signin`)
2. Se email não verificado → redirecionamento para `/verify-email`
3. Se sucesso → tokens armazenados e redirecionamento

### 3. Reset de Senha
1. Usuário acessa `/forgot-password`
2. Digite email → código enviado por email
3. Digite código + nova senha → senha alterada

## 🛡️ Proteção de Rotas

### Middleware Automático
O middleware protege automaticamente:
- `/user/*` - Apenas estudantes
- `/teacher/*` - Apenas professores  
- `/admin/*` - Apenas administradores

### Hook para Componentes
```typescript
import { useAuthGuard } from "@/hooks/useDjangoAuth";

function TeacherComponent() {
  const { isAuthorized, isLoading } = useAuthGuard('teacher');
  
  if (isLoading) return <Loading />;
  if (!isAuthorized) return null;
  
  return <div>Conteúdo do professor</div>;
}
```

## 🧪 Como Testar

### 1. Iniciar o Backend Django
```bash
cd Tuwi-Backend
python manage.py runserver 0.0.0.0:8002
```

### 2. Iniciar o Frontend
```bash
cd ProEnglish-client
npm run dev
```

### 3. Fluxo de Teste Completo

**Teste de Registro:**
1. Acesse `http://localhost:3000/signup`
2. Preencha: nome, email, senha, confirme senha, role
3. Clique "Criar Conta"
4. Verifique redirecionamento para `/verify-email`
5. Verifique email recebido com código de 6 dígitos
6. Digite o código e verifique login automático

**Teste de Login:**
1. Acesse `http://localhost:3000/signin`  
2. Digite email e senha
3. Verifique redirecionamento baseado no role:
   - Student → `/user/courses`
   - Teacher → `/teacher/courses`
   - Admin → `/admin/dashboard`

**Teste de Reset de Senha:**
1. Acesse `http://localhost:3000/forgot-password`
2. Digite email
3. Verifique email recebido com código
4. Digite código + nova senha
5. Verifique redirecionamento para `/signin`

## 🔍 Debugging

### Logs Importantes
- Redux DevTools - Estado de autenticação
- Network Tab - Chamadas para Django API
- Console - Erros de JWT/autenticação
- Django logs - Verificação de recebimento das requisições

### Tokens no LocalStorage
```javascript
// No DevTools Console
localStorage.getItem('access_token');
localStorage.getItem('refresh_token');
```

### Estado Redux
```javascript
// No Redux DevTools
state.auth.isAuthenticated
state.auth.user
state.auth.pendingVerification
```

## ⚡ Próximos Passos

1. **Teste todos os fluxos** - Registro, login, verificação, reset
2. **Verificar integração com checkout** - Fluxo de compra
3. **Testar proteção de rotas** - Middleware funcionando
4. **Configurar refresh automático** - Tokens renovados automaticamente
5. **Testar logout** - Limpeza correta do estado

## 🆘 Problemas Comuns

1. **CORS Error** - Verificar Django `CORS_ALLOWED_ORIGINS`
2. **401 Unauthorized** - Token expirado ou inválido
3. **Email não recebido** - Verificar configurações SMTP do Django
4. **Redirect loop** - Middleware conflitante

## 📞 Endpoints Django Usados

- `POST /users/register/` - Registro
- `POST /users/login/` - Login
- `POST /users/verify-email/` - Verificação de email
- `POST /users/resend-verification/` - Reenviar código
- `POST /users/password-reset/` - Solicitar reset
- `POST /users/password-reset-confirm/` - Confirmar reset
- `POST /users/refresh-token/` - Renovar token
- `POST /users/logout/` - Logout
- `GET/PUT /users/profile/` - Perfil do usuário

A migração está completa e pronta para teste! 🎉