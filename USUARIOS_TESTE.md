# 👥 Usuários de Teste - ProEnglish

## 🎓 Estudante
- **Email:** `estudante@proenglish.com`
- **Senha:** `Estudante123!`
- **Role:** `student`
- **Dashboard:** `/user/courses`

## 👨‍🏫 Professor  
- **Email:** `professor@proenglish.com`
- **Senha:** `Professor123!`
- **Role:** `teacher`
- **Dashboard:** `/teacher/courses`

## 👨‍💼 Administrador
- **Email:** `admin@proenglish.com`
- **Senha:** `Admin123!`
- **Role:** `admin`
- **Dashboard:** `/admin/dashboard`
- **Django Admin:** `/admin/` (acesso completo)

## 🔧 Como Testar

1. **Acesse o sistema:** http://localhost:3003
2. **Clique em "Log in"** no header
3. **Use um dos usuários acima** para fazer login
4. **Será redirecionado** automaticamente para o dashboard correto
5. **Teste as funcionalidades** específicas de cada role

## 📋 Funcionalidades por Role

### Estudante (`student`)
- ✅ Visualizar cursos matriculados
- ✅ Acessar conteúdo dos cursos
- ✅ Gerenciar perfil
- ✅ Ver histórico de pagamentos
- ✅ Configurações de notificação

### Professor (`teacher`)
- ✅ Gerenciar seus cursos
- ✅ Criar novos cursos
- ✅ Editar conteúdo
- ✅ Gerenciar perfil
- ✅ Ver relatórios de pagamento
- ✅ Configurações de notificação

### Administrador (`admin`)
- ✅ Acesso completo ao sistema
- ✅ Gerenciar todos os usuários
- ✅ Gerenciar todos os cursos
- ✅ Dashboard administrativo
- ✅ Django Admin Panel
- ✅ Todas as funcionalidades

## 🌐 URLs Importantes

- **Frontend:** http://localhost:3003
- **Backend API:** http://localhost:8000
- **Django Admin:** http://localhost:8000/admin/
- **API Documentation:** http://localhost:8000/api/docs/

## 🔐 Notas de Segurança

⚠️ **Estes são usuários de TESTE apenas!**
- Senhas simples para facilitar testes
- Em produção, usar senhas fortes
- Todos os emails estão marcados como verificados
- Não usar em ambiente de produção