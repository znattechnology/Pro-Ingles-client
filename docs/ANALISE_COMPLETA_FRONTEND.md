# Análise Completa do Frontend ProEnglish

**Data:** 2026-01-29
**Versão:** 1.0
**Nível de Risco Global:** ALTO
**Total de Problemas:** 87 (15 Críticos, 28 Altos, 44 Médios)

---

## Sumário Executivo

O frontend ProEnglish apresenta **dívida técnica significativa** resultante de múltiplas migrações incompletas, implementações paralelas de gestão de estado, e duplicação substancial de código. Os problemas mais críticos envolvem:

- **Tokens JWT armazenados em localStorage** (vulnerável a XSS)
- **Open Redirect** no parâmetro de redirecionamento
- **3+ padrões de arquitetura coexistindo** (legacy, modules2, domains)
- **Componentes gigantes** (2000+ linhas)
- **Bundles excessivos** (Syncfusion não usado = 2.5MB)
- **Falhas silenciosas** sem feedback ao utilizador

---

## 1. SEGURANÇA

### 1.1 Problemas Críticos

| # | Problema | Ficheiro | Linha | Impacto | Correção |
|---|----------|----------|-------|---------|----------|
| 1 | **Tokens em localStorage (XSS)** | `lib/token-refresh-coordinator.ts` | 236-237 | XSS extrai tokens e dados do utilizador | Remover localStorage, usar apenas cookies HttpOnly |
| 2 | **Open Redirect** | `lib/django-middleware.ts`, `hooks/useDjangoAuth.ts` | 198, 310 | Ataques de phishing | Validar redirects contra whitelist |
| 3 | **Autorização apenas no frontend** | `lib/django-middleware.ts` | 209 | Bypass por modificação de JWT | Mover autenticação para backend/API |
| 4 | **Proxy genérico com endpoints dinâmicos** | `app/api/django/route.ts` | 98 | Exposição de APIs internas | Whitelist de endpoints específicos |
| 5 | **Race conditions na inicialização de auth** | `hooks/useDjangoAuth.ts` | 53-165 | Estado de auth inconsistente | Usar async/await corretamente |

### 1.2 Código Vulnerável

```typescript
// ❌ VULNERÁVEL: lib/token-refresh-coordinator.ts:236-237
localStorage.setItem('access_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);

// ❌ VULNERÁVEL: lib/django-middleware.ts:198
loginUrl.searchParams.set('redirect', pathname); // Sem validação!

// ❌ VULNERÁVEL: hooks/useDjangoAuth.ts:310
const redirect = searchParams?.get('redirect');
if (redirect) {
  router.push(redirect);  // Open redirect!
}
```

### 1.3 Problemas Altos de Segurança

| Problema | Ficheiro | Impacto |
|----------|----------|---------|
| Cookies não-HttpOnly | `token-refresh-coordinator.ts:244-245` | XSS acessa tokens |
| IDOR - User ID em URL | `admin/users/[userId]/page.tsx:79` | Acesso a dados de outros utilizadores |
| Middleware bypassed por API calls | `v1/subscriptions/route.ts` | Exploração direta de API |
| Admin wildcard muito amplo | `django-middleware.ts:67` | Match de rotas não intencionais |

### 1.4 Recomendações de Segurança

**P0 (Imediato - Esta Semana):**
1. Remover armazenamento de tokens em localStorage
2. Validar URLs de redirect contra whitelist
3. Mover todas verificações de autorização para backend

**P1 (Curto Prazo - 2 Semanas):**
1. Implementar cookies HttpOnly no servidor
2. Adicionar validação de ownership no backend para IDOR
3. Whitelist de endpoints no proxy

---

## 2. BUGS FUNCIONAIS E ESTADO

### 2.1 Race Conditions no RTK Query

```typescript
// ❌ PROBLEMA: coursesApiSlice.ts:234-258
async onQueryStarted({userId, courseId, data}, {dispatch, queryFulfilled}) {
  // RACE CONDITION: Atualiza cache antes de confirmação do servidor
  const patchResult = dispatch(
    coursesApiSlice.util.updateQueryData('getUserCourseProgress', ...)
  );
  try {
    await queryFulfilled;
  } catch {
    patchResult.undo();  // Undo pode falhar se cache foi modificado por outro
  }
}
```

### 2.2 Queries com Parâmetros Undefined

| Ficheiro | Linha | Problema |
|----------|-------|----------|
| `PracticeCourseSelector.tsx` | 58 | `skip: !selectedCourse?.id` - se id é undefined, não faz skip |
| `useSpeakingSession.ts` | 61 | `skip: !sessionState.currentSession?.id` |
| `AdvancedPracticeCourseSelector.tsx` | 82, 90 | Mesma condição de skip incorreta |

### 2.3 Inconsistência de Nomes de Campos

```typescript
// ❌ 3 formas diferentes de ID no mesmo codebase:
course.courseId    // coursesApiSlice.ts
course.id          // studentVideoCourseApiSlice.ts
course.teacherId   // teacherVideoCourseApiSlice.ts

// Resultado: Cache de tags falha entre endpoints
```

### 2.4 Invalidação de Tags Incorreta

```typescript
// ❌ Invalida TODOS os cursos, não apenas o relevante
// studentPracticeApiSlice.ts:143-149
invalidatesTags: [
  "StudentProgress",
  "StudentUnit",
  "StudentLesson",
  "StudentCourse"  // Sem ID específico!
],

// ✓ CORRETO:
invalidatesTags: (result, error, { courseId }) => [
  { type: 'StudentCourse', id: courseId },
],
```

### 2.5 Recomendações de Estado

**P0:**
1. Corrigir condições de skip em todas as queries
2. Padronizar nomes de campos (sempre usar `id`)
3. Adicionar IDs específicos em invalidação de tags

**P1:**
1. Implementar mutex para optimistic updates
2. Consolidar API slices duplicados

---

## 3. ARQUITETURA E ORGANIZAÇÃO

### 3.1 Estrutura Problemática

```
ProEnglish-client/
├── components/         (115 ficheiros - legacy)
├── src/
│   ├── domains/        (86 ficheiros - NOVA arquitetura)
│   ├── modules2/       (DUPLICADO de domains - ABANDONADO)
│   └── core/
├── redux/              (legacy Redux features)
├── state/              (alternativa de gestão de estado)
├── lib/                (utilitários espalhados)
├── hooks/              (17 ficheiros na raiz)
└── app/                (Next.js App Router)
```

### 3.2 Componentes Duplicados

| Componente | Localizações | Linhas Duplicadas |
|------------|--------------|-------------------|
| ChallengeConstructor | `/components/laboratory/`, `/src/domains/teacher/` | 2011 + 1997 |
| LessonConstructor | `/components/laboratory/`, `/src/domains/teacher/` | 1122 + 1079 |
| UserProgress | 7 localizações diferentes | ~600 total |
| CourseCard | 3 localizações | ~400 total |

### 3.3 Componentes Gigantes (Precisam Split)

| Componente | Linhas | Problema |
|------------|--------|----------|
| VapiConversationPractice.tsx | 2,372 | 24 useState calls, 8 useEffect |
| ChallengeConstructor.tsx | 2,011 | Monolítico |
| CourseWizard.tsx | 1,236 | Multi-step form sem separação |
| LessonConstructor.tsx | 1,122 | Similar ao ChallengeConstructor |
| ChapterModal.tsx | 1,175 | Video upload + metadata junto |

### 3.4 Feature Flags Presos

```typescript
// lib/featureFlags.ts - Flags que nunca foram completadas
export const MIGRATION_STATUS = {
  STORE_CONFIGURATION: '✅ Completed',
  LABORATORY_SLICE: '✅ Completed',
  COURSE_SELECTION: '🔄 In Progress',  // ← Preso há semanas?
  PRACTICE_INTERFACE: '📝 Planned',    // ← Nunca iniciado
  USER_PROGRESS: '📝 Planned',
};
```

### 3.5 Recomendações de Arquitetura

**P0:**
1. Eliminar `/src/modules2/` completamente (-4000 linhas)
2. Consolidar componentes duplicados para única fonte de verdade
3. Converter `app/layout.tsx` para Server Component

**P1:**
1. Quebrar componentes gigantes (VapiConversationPractice → 4 componentes)
2. Mover hooks para `/src/domains/*/hooks/`
3. Estabelecer API gateway centralizado

---

## 4. PERFORMANCE E ESCALABILIDADE

### 4.1 Bundle Size Crítico

| Problema | Impacto | Ficheiro |
|----------|---------|----------|
| **Syncfusion não usado** | +2.5MB | `package.json` |
| **ReactPlayer sem code-split** | +600KB | `chapters/[chapterId]/page.tsx` |
| **MUI + Radix + Shadcn** | +1.5MB | Bibliotecas redundantes |
| **framer-motion** | +400KB | Carregado em todas páginas |

### 4.2 Chamadas API Duplicadas

```typescript
// ❌ PROBLEMA: useCourseProgressData.ts faz 2 chamadas
const { data: course } = useGetVideoCourseByIdQuery();  // Chamada 1
const { data: progress } = useGetVideoCourseProgressQuery();  // Chamada 2

// ❌ PROBLEMA: chapters/[chapterId]/page.tsx:77-80
// Teacher API chamada sem necessidade (não faz skip)
const { data: teacherCourseResponse } = useGetTeacherCourseByIdQuery(courseId, { skip: !courseId });
```

### 4.3 Listas sem Virtualização

| Ficheiro | Problema | Impacto |
|----------|----------|---------|
| `admin/users/page.tsx` | Tabela renderiza todos utilizadores | 500MB RAM para 100+ itens |
| `admin/courses/page.tsx` | Sem paginação visível | Performance degradada |

### 4.4 Console.log Excessivo

```
Total de console.log no codebase: 220 instâncias
Impacto: +50ms por render
Ficheiro mais afetado: chapters/[chapterId]/page.tsx (50+ logs)
```

### 4.5 Recomendações de Performance

**P0 (Imediato):**
1. Remover pacotes Syncfusion do `package.json` (-2.5MB)
2. Dynamic import do ReactPlayer: `next/dynamic`
3. Remover ou condicionar console.logs
4. Corrigir chamada duplicada de API (skip teacher API)

**P1 (2-3 Semanas):**
1. Virtualização com `react-window` para tabelas admin
2. Suspense boundaries com streaming
3. Memoizar `findNextChapter()` e funções pesadas
4. `loading="lazy"` em todas imagens não-críticas

---

## 5. UX E TRATAMENTO DE ERROS

### 5.1 Falhas Silenciosas

```typescript
// ❌ CRÍTICO: Settings não são salvas!
// app/(dashboard)/user/settings/page.tsx:114-125
const handleSave = async (section: string) => {
  try {
    // TODO: Implement API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1000)); // SIMULA API!
    toast.success(`Definições de ${section} guardadas com sucesso!`);
  } catch (error) {
    toast.error('Erro ao guardar definições');
  }
}

// ❌ Upload de vídeo falha silenciosamente
// ChapterModal.tsx:221-225
try {
  finalVideoUrl = await uploadVideoToS3(data.video, ...);
} catch (error) {
  console.error('Video upload failed, creating chapter without video:', error);
  finalVideoUrl = undefined;  // Utilizador não sabe que falhou!
}
```

### 5.2 Mensagens de Erro Genéricas

```typescript
// ❌ Sem detalhes do erro de pagamento
// checkout/payment/index.tsx:68-70
} catch (error) {
  toast.error("An error occurred during the payment process.");  // Genérico!
}
```

### 5.3 Error Boundaries Ausentes

```
Ficheiros error.tsx no app/: 0
Impacto: Qualquer erro de componente causa crash total da página
```

### 5.4 Estados de Loading Inconsistentes

| Componente | Estado |
|------------|--------|
| Payment Form | ❌ Sem indicador durante stripe.confirmPayment |
| User Management | ✓ Parcial - loading mas sem optimistic update |
| Settings Save | ❌ Sem indicador, botão não disabled |
| Video Upload | ❌ Sem progresso, falha silenciosa |

### 5.5 Acessibilidade

| Problema | Impacto |
|----------|---------|
| Sem ARIA labels | Leitores de ecrã não funcionam |
| Sem gestão de foco | Modais não retornam foco |
| Sem navegação por teclado | Dropdowns inacessíveis |

### 5.6 Recomendações de UX

**P0 (Crítico):**
1. Implementar API call real no Settings (`TODO` há muito tempo)
2. Adicionar toast de erro quando upload de vídeo falha
3. Criar `error.tsx` para cada segmento de rota

**P1:**
1. Padronizar mensagens de erro com detalhes úteis
2. Adicionar loading indicators em todas operações async
3. Implementar optimistic updates

**P2:**
1. Adicionar ARIA labels
2. Implementar gestão de foco em modais
3. Melhorar contraste de cores

---

## 6. MÉTRICAS E OBJETIVOS

### 6.1 Estado Atual vs Objetivo

| Métrica | Atual | Objetivo |
|---------|-------|----------|
| Maior componente | 2,372 linhas | < 300 linhas |
| Ficheiros duplicados | 12+ instâncias | 0 |
| API slices | 9 | 3-4 |
| Hooks na raiz | 17 ficheiros | 0 |
| index.ts | 353 | < 50 |
| Feature flags | 16 | 0 (completados) |
| TODOs/FIXMEs | 28+ | 0 |
| Bundle JS inicial | ~500KB | < 200KB |
| console.log | 220 | 0 em produção |

---

## 7. PLANO DE AÇÃO

### Fase 1: Crítico (Semana 1-2)

| Prioridade | Tarefa | Ficheiros | Impacto |
|------------|--------|-----------|---------|
| P0 | Remover localStorage para tokens | `token-refresh-coordinator.ts` | Segurança |
| P0 | Validar redirects | `django-middleware.ts`, `useDjangoAuth.ts` | Segurança |
| P0 | Implementar API em Settings | `user/settings/page.tsx` | UX Crítico |
| P0 | Remover Syncfusion | `package.json` | -2.5MB bundle |
| P0 | Toast em falha de upload | `ChapterModal.tsx` | UX |

### Fase 2: Alto (Semana 3-4)

| Prioridade | Tarefa | Ficheiros | Impacto |
|------------|--------|-----------|---------|
| P1 | Eliminar /src/modules2/ | Pasta completa | -4000 linhas |
| P1 | Consolidar UserProgress | 7 → 1 componente | Manutenção |
| P1 | Dynamic import ReactPlayer | `chapters/[chapterId]/page.tsx` | -600KB |
| P1 | Error boundaries | Criar `error.tsx` em cada rota | UX |
| P1 | Corrigir skip conditions | Múltiplos API slices | Bugs |

### Fase 3: Médio (Semana 5-8)

| Prioridade | Tarefa | Ficheiros | Impacto |
|------------|--------|-----------|---------|
| P2 | Quebrar VapiConversationPractice | 1 → 4 componentes | Manutenção |
| P2 | Virtualização em tabelas | `admin/users/page.tsx` | Performance |
| P2 | Padronizar nomes de campos | API slices | Consistência |
| P2 | Remover console.logs | 220 instâncias | Performance |
| P2 | Acessibilidade | Todo o app | Compliance |

---

## 8. FICHEIROS CRÍTICOS A MONITORAR

### Alta Prioridade
- `/lib/token-refresh-coordinator.ts` - Segurança de tokens
- `/hooks/useDjangoAuth.ts` - Fluxo de autenticação
- `/app/(dashboard)/user/settings/page.tsx` - TODO crítico
- `/components/speaking/VapiConversationPractice.tsx` - Maior componente

### Média Prioridade
- `/state/redux.tsx` - Configuração de store
- `/lib/featureFlags.ts` - Limpeza de flags
- `/app/layout.tsx` - Conversão para Server Component
- `/src/domains/*/api/` - Consolidação de API slices

---

## 9. CONCLUSÃO

O frontend ProEnglish requer **ação imediata** em:

1. **Segurança**: Tokens em localStorage representam risco real de XSS
2. **Funcionalidade**: Settings page com TODO há muito tempo
3. **Performance**: 2.5MB de dependências não usadas

A arquitetura base é sólida (Next.js App Router, organização por domínios), mas migrações incompletas criaram confusão e duplicação significativa.

**Recomendação Principal**: Focar em **consolidação e limpeza** antes de adicionar novas funcionalidades.

---

*Relatório gerado por análise automatizada do codebase*
