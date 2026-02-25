# Análise Técnica Profunda - Landing Page ProEnglish

**Data:** 2026-01-29
**Autor:** Product Engineer + UX Strategist + Security-minded Developer

---

## 1. VISÃO GERAL DA LANDING PAGE

### Estrutura Atual (10 componentes)
```
1. Header (fixed) - Navegação + Auth
2. Hero - Proposta de valor + AITutorDemo
3. About - História da empresa + setores
4. Features - 6 features em Bento Grid
5. PracticeLab - 4 tipos de exercícios interativos
6. Testimonials - 9 testemunhos em carousel
7. Pricing - 3 planos com toggle mensal/anual
8. CallToAction - CTA final (muito básico)
9. Footer - Links + copyright
10. Chatbot - Widget flutuante (sempre carregado)
```

### Métricas de Conteúdo
| Métrica | Valor | Avaliação |
|---------|-------|-----------|
| Secções principais | 8 | **Excessivo** |
| CTAs concorrentes | 12+ | **Crítico** |
| Estatísticas repetidas | 4x | **Redundante** |
| Tempo de scroll (estimado) | 8-10 screens | **Muito longo** |
| Palavras totais | ~2,500+ | **Excesso de informação** |

---

## 2. PONTOS FORTES

### Positivos Identificados

1. **Posicionamento claro para Angola** 🇦🇴
   - Badge "A primeira plataforma de inglês feita para Angola"
   - Preços em AOA
   - Setores específicos angolanos (Sonangol, BAI, Unitel)
   - Testemunhos de profissionais locais

2. **AITutorDemo interativo**
   - Demonstra o produto em ação
   - Auto-play com rotação de cenários
   - Feedback visual imediato

3. **Social proof bem estruturado**
   - Logos de empresas (Sonangol, BAI, Unitel, BFA)
   - 9 testemunhos com resultados específicos
   - Ratings e estatísticas

4. **Pricing transparente**
   - 3 tiers claros
   - Toggle mensal/anual
   - Benefícios por plano bem listados
   - Garantia de 30 dias

5. **Design visual consistente**
   - Paleta roxa/violeta coesa
   - Gradientes e glassmorphism modernos
   - Animações fluidas (Framer Motion)

---

## 3. EXCESSO DE INFORMAÇÃO (O QUE REMOVER/MOVER)

### 3.1 Estatísticas Redundantes (Aparecem 4x)
| Estatística | Hero | About | Features | PracticeLab |
|-------------|------|-------|----------|-------------|
| "10K+" | ✅ | ✅ | ✅ | - |
| "94%" | ✅ | ✅ | ✅ | "92%" |
| "50+" | ✅ | ✅ | ✅ | - |

**Problema:** O utilizador vê os mesmos números 4 vezes. Perde credibilidade.

### 3.2 Secções Redundantes

#### **About Section - MOVER PARA PÁGINA INTERNA**
```
Localização: /sections/About.tsx (200 linhas)
```
**Conteúdo atual:**
- História da empresa (2024, fundação)
- 6 cidades de Angola
- 4 setores atendidos
- Missão corporativa

**Problema:** Informação institucional não converte. Novos utilizadores querem saber "o que ganho?" não "quem são vocês?"

**Recomendação:** Mover para `/about` page dedicada.

#### **Features vs PracticeLab - REDUNDÂNCIA**
```
Features.tsx: 6 features gerais
PracticeLab.tsx: 4 tipos de exercícios (mais detalhado)
```

**Sobreposição:**
- Speaking Practice (Features) ≈ Speaking Challenge (PracticeLab)
- Listening (Features) ≈ Listening Lab (PracticeLab)

**Recomendação:** Manter apenas PracticeLab (mais específico e interativo).

### 3.3 CTAs Concorrentes (12+ botões de conversão)

```
Hero:
- "Começar Grátis - 7 Dias"
- "Ver Demonstração do IA Tutor"

About:
- (sem CTA - OK)

Features:
- "Começar Teste Grátis"
- "Ver Demonstração"

PracticeLab:
- "Experimentar Agora"
- "Começar English Practice Lab Grátis"
- "Ver Demo do Lab"

Testimonials:
- "Começar Minha Transformação"
- "Ver Mais Casos de Sucesso"

Pricing:
- 3x botões por plano
- "Começar Teste Grátis"
- "Falar com Consultor"

CallToAction:
- "Obtenha de graça"
- "Saber mais"
```

**Problema:** 12+ CTAs diferentes confundem o utilizador. Não sabe onde clicar.

**Recomendação:** 1 CTA principal consistente: **"Começar Grátis"**

### 3.4 Conteúdo Prematuro

| Secção | Conteúdo | Problema |
|--------|----------|----------|
| About | "Fundação 2024" | Startup nova não é selling point |
| Testimonials | 9 testemunhos | 3-4 bastam, 9 é exaustivo |
| Chatbot | FAQ hardcoded | Promete WhatsApp mas não funciona |
| CallToAction | Texto genérico | "Junte-se a Nós" - sem personalidade |

---

## 4. PROBLEMAS DE UX

### 4.1 Hierarquia Visual

```
ATUAL (8-10 screens):
[Hero] → [About] → [Features] → [PracticeLab] → [Testimonials] → [Pricing] → [CTA] → [Footer]
     ↓
 Muita informação antes do pricing!
```

**Problema:** Utilizador precisa fazer scroll por 6 secções antes de ver preços.

**Estrutura ideal (3-4 screens):**
```
[Hero com demo integrado]
    ↓
[PracticeLab/Features simplificado]
    ↓
[Pricing + Testemunhos condensados]
    ↓
[Footer]
```

### 4.2 Sobrecarga Cognitiva

1. **Cada secção tem sua própria "caixa CTA"** no final
   - Features tem CTA box
   - PracticeLab tem CTA box
   - Testimonials tem CTA box
   - Pricing tem CTA box

2. **Múltiplos carrosséis/animações:**
   - AITutorDemo (auto-play)
   - Testimonials (auto-scroll 3 colunas)
   - Feature icons (animações infinitas)

3. **Textos longos em cada secção:**
   - About: ~300 palavras
   - Features: ~250 palavras
   - PracticeLab: ~400 palavras

### 4.3 Pontos de Abandono

| Ponto | Problema | Risco |
|-------|----------|-------|
| Hero → About | Transição brusca para história corporativa | Alto abandono |
| Features → PracticeLab | Redundância percebida | Confusão |
| Testimonials | 9 cards em auto-scroll | Fadiga |
| CallToAction | Texto genérico, botões sem destino | Perda de conversão |

### 4.4 Problemas de Navegação

**Footer.tsx linha 21:**
```tsx
<a href="search">Cursos</a>  // ❌ Falta "/"
```
Deveria ser: `<a href="/search">Cursos</a>`

**Header links quebrados:**
```tsx
<a href="#service">Serviços</a>  // ❌ ID não existe
<a href="#plan">Planos</a>       // ❌ ID não existe (é #pricing)
<a href="#testimonial">           // ❌ ID não existe (é #testimonials)
```

---

## 5. IMPACTOS DE PERFORMANCE

### 5.1 Bundle Size Estimado

| Dependência | Tamanho | Uso na Landing |
|-------------|---------|----------------|
| framer-motion | ~11MB (npm) | **Todas as 8 secções** |
| lucide-react | ~500KB | 50+ ícones |
| tailwind-merge | ~50KB | Condicionais CSS |
| @radix-ui/* | ~300KB | Sheet, Dropdown, Avatar |

### 5.2 Componentes Pesados

```
1. Chatbot.tsx (420 linhas) - SEMPRE carregado
   - Estado local complexo
   - Animações Framer Motion
   - Event listeners

2. AITutorDemo.tsx (347 linhas) - No Hero
   - Auto-play com setInterval
   - 3 cenários em memória
   - Múltiplas animações concorrentes

3. Testimonials.tsx (253 linhas)
   - 9 avatares carregados upfront
   - 3 colunas com infinite scroll
   - Duplicação de DOM (2x para loop)
```

### 5.3 Oportunidades de Otimização

#### **1. Lazy Loading de Secções**
```tsx
// ATUAL - Tudo carregado de uma vez
import Hero from "@/sections/Hero";
import About from "@/sections/About";
// ...

// RECOMENDADO - Lazy load below fold
import dynamic from 'next/dynamic';
const About = dynamic(() => import('@/sections/About'));
const Features = dynamic(() => import('@/sections/Features'));
```

#### **2. Chatbot Lazy Load**
```tsx
// ATUAL
<Chatbot /> // Sempre no DOM

// RECOMENDADO
const [showChat, setShowChat] = useState(false);
{showChat && <Chatbot />}
// Botão flutuante apenas trigger
```

#### **3. Imagens de Testemunhos**
```tsx
// ATUAL - 9 avatares carregados
import avatar1 from "@/public/avatar-1.png";
// ...
import avatar9 from "@/public/avatar-9.png";

// RECOMENDADO - Next/Image com lazy
<Image src={imageSrc} loading="lazy" />
```

### 5.4 Métricas Web Vitals (Estimativas)

| Métrica | Estimativa Atual | Target |
|---------|------------------|--------|
| FCP (First Contentful Paint) | ~1.8-2.5s | < 1.8s |
| LCP (Largest Contentful Paint) | ~3-4s | < 2.5s |
| TTI (Time to Interactive) | ~4-5s | < 3.8s |
| CLS (Cumulative Layout Shift) | ~0.15-0.25 | < 0.1 |

**Causas principais:**
- Framer Motion inicialização
- 9 imports de avatar
- Chatbot sempre carregado
- Animações infinitas

---

## 6. RISCOS DE SEGURANÇA

### 6.1 Exposição de Dados ✅ (Baixo Risco)

```tsx
// api.ts linha 13
baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
```
**Status:** OK - variáveis NEXT_PUBLIC são públicas por design.

### 6.2 Endpoints Expostos

**Landing page NÃO faz chamadas API** - apenas:
- `useDjangoAuth()` - só se autenticado
- Chatbot é local (FAQ hardcoded)

**Status:** ✅ Sem risco na landing.

### 6.3 Problemas Menores

1. **Chatbot expõe números de contacto:**
```tsx
// Chatbot.tsx linha 80
"📱 **WhatsApp:** +244 923 456 789"
"📧 **Email:** contato@proenglish.ao"
```
**Risco:** Baixo, mas pode facilitar spam/scraping.

2. **Footer sem HTTPS enforcement:**
```tsx
<a href="search">  // Relativo sem /
```
**Risco:** Pode causar navegação incorreta.

### 6.4 Headers de Segurança
Verificar em `next.config.js`:
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

---

## 7. ALINHAMENTO COM O PRODUTO

### 7.1 Promessas vs Realidade

| Promessa (Landing) | Status Real | Problema |
|--------------------|-------------|----------|
| "10K+ Angolanos" | Verificar DB | Possível overpromise |
| "94% Taxa de sucesso" | Verificar métricas | Muito específico |
| "50+ Cursos" | Verificar catálogo | Verificar |
| "2 sessões com nativos/mês" (Enterprise) | Implementado? | Verificar |
| "Certificados oficiais" | Sistema implementado | ✅ OK |
| "IA Personal Tutor" | Vapi integration | ✅ Parcialmente |

### 7.2 Features Anunciadas vs Implementadas

**Hero.tsx:**
```tsx
"A única plataforma que combina IA Personal Tutor com English Practice Lab"
```
**Verificar:** Practice Lab tem todos os 4 tipos de exercício funcionando?

**Pricing.tsx (Enterprise):**
```tsx
"2 sessões com nativos/mês"
```
**Verificar:** Há sistema de agendamento com nativos?

### 7.3 Inconsistências de Mensagem

1. **Nome do produto:**
   - "ProEnglish" (Header)
   - "ProEnglish Academy" (CallToAction)
   - "ProEnglish Angola" (Chatbot, Testimonials)

2. **Trial period:**
   - "7 Dias" (Hero)
   - "Teste Grátis" (Features, Pricing) - sem especificar duração

3. **Garantia:**
   - "30 dias ou dinheiro de volta" (Pricing)
   - Não mencionado em outros lugares

---

## 8. RECOMENDAÇÕES PRÁTICAS

### P0 - REMOVER/CORRIGIR AGORA

| Item | Ação | Ficheiro |
|------|------|----------|
| Links quebrados no Footer | Corrigir `href="search"` → `href="/search"` | Footer.tsx:21 |
| Links quebrados no Header | Corrigir IDs: `#service` → `#features` | Header.tsx |
| Console.log em produção | Remover `console.log("Demo button clicked")` | Hero.tsx:13 |
| Comentários mortos | Remover 40+ linhas comentadas | Header.tsx:190-229 |

### P1 - AJUSTAR CURTO PRAZO (1-2 semanas)

| Item | Ação | Impacto |
|------|------|---------|
| Remover About section | Mover para `/about` | -200 linhas, menos scroll |
| Condensar Features + PracticeLab | Manter só PracticeLab | -264 linhas |
| Reduzir testemunhos | 9 → 4 | Menos fadiga |
| Unificar CTAs | 1 texto consistente | Clareza |
| Lazy load Chatbot | Carregar on-demand | Performance |
| CallToAction melhorado | Reescrever com copy focado | Conversão |

### P2 - MELHORIAS ESTRATÉGICAS (1-2 meses)

| Item | Ação | Impacto |
|------|------|---------|
| A/B testing Hero | Testar variantes de copy | Conversão |
| Lazy load all sections | Dynamic imports | Performance |
| Testimonials com filtro | Por setor (petróleo, bancos, TI) | Relevância |
| Pricing comparison tool | Calcular economia anual | Upsell |
| Exit intent popup | Capturar abandonos | Leads |
| Analytics eventos | Track scroll depth, cliques | Dados |

---

## 9. ESTRUTURA IDEAL PROPOSTA

### Nova Landing Page (4 secções principais)

```
┌─────────────────────────────────────┐
│           HEADER (fixed)            │
│  Logo | Nav | [Entrar] [Começar]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│              HERO                   │
│                                     │
│  Badge: "Inglês para Angola"        │
│                                     │
│  H1: Inglês Especializado           │
│      com IA Personal Tutor          │
│                                     │
│  Subtitle: Para petróleo, bancos,   │
│            TI. Preços em AOA.       │
│                                     │
│  [Começar Grátis - 7 Dias]          │
│                                     │
│  Stats: 10K+ | 94% | 50+            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     AI Tutor Demo           │    │
│  │     (integrado no hero)     │    │
│  └─────────────────────────────┘    │
│                                     │
│  Logos: Sonangol | BAI | Unitel     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         COMO FUNCIONA               │
│   (PracticeLab simplificado)        │
│                                     │
│  4 cards horizontais:               │
│  Speaking | Listening | Writing |   │
│  Scenarios                          │
│                                     │
│  [Ver Demo Completo]                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      PRICING + SOCIAL PROOF         │
│                                     │
│  Toggle: Mensal | Anual             │
│                                     │
│  ┌─────┐ ┌─────────┐ ┌─────┐        │
│  │Free │ │ Pro 👑  │ │Enterp│       │
│  │ 0   │ │ 14.950  │ │24.950│       │
│  └─────┘ └─────────┘ └─────┘        │
│                                     │
│  ──────────────────────────         │
│                                     │
│  3 Testemunhos (1 linha):           │
│  Carlos/Sonangol | Ana/BAI |        │
│  Miguel/Unitel                      │
│                                     │
│  Garantia 30 dias                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│             FOOTER                  │
│  Links | Redes | © 2024             │
└─────────────────────────────────────┘

┌─────┐
│ 💬 │ ← Chatbot (lazy loaded)
└─────┘
```

### Benefícios da Nova Estrutura

| Métrica | Atual | Proposto | Melhoria |
|---------|-------|----------|----------|
| Secções | 8 | 4 | -50% |
| Scroll screens | 8-10 | 3-4 | -60% |
| Tempo até pricing | 6 secções | 2 secções | -66% |
| CTAs concorrentes | 12+ | 3 | -75% |
| Código removido | - | ~800 linhas | Manutenção |
| Peso estimado | ~100% | ~60% | -40% |

---

## 10. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1 - Quick Wins (P0)
- [ ] Corrigir link Footer: `search` → `/search`
- [ ] Corrigir IDs Header navigation
- [ ] Remover `console.log` em Hero.tsx
- [ ] Remover código comentado em Header.tsx

### Fase 2 - Reestruturação (P1)
- [ ] Mover About.tsx para `/about/page.tsx`
- [ ] Remover Features.tsx (manter PracticeLab)
- [ ] Reduzir Testimonials de 9 para 4
- [ ] Reescrever CallToAction.tsx
- [ ] Implementar lazy loading no Chatbot
- [ ] Unificar texto de CTAs

### Fase 3 - Otimização (P2)
- [ ] Dynamic imports para todas secções
- [ ] A/B test com nova estrutura
- [ ] Implementar analytics de scroll
- [ ] Criar filtro de testemunhos por setor
- [ ] Otimizar imagens com `next/image`
- [ ] Verificar/atualizar estatísticas (10K, 94%, 50+)

---

## CONCLUSÃO

A landing page atual tem uma **base visual sólida** e um **posicionamento claro** para Angola, mas sofre de:

1. **Excesso de informação** que dilui a mensagem
2. **Redundância** entre secções
3. **Múltiplos CTAs** que confundem
4. **Performance sub-óptima** por falta de lazy loading
5. **Possível overpromising** em estatísticas

**Prioridade máxima:** Simplificar. A landing page deve responder em 5 segundos:
- **O quê?** Plataforma de inglês com IA
- **Para quem?** Profissionais angolanos
- **Por quê?** Inglês técnico para petróleo, bancos, TI
- **Quanto?** Grátis para começar, planos em AOA
- **Como?** Botão "Começar Grátis"

---

*Relatório gerado com análise de código fonte completo.*
