# 📚 Modular Architecture Guide

## Overview

Este projeto utiliza uma arquitetura modular que organiza o código por domínio de funcionalidade. Cada módulo é self-contained e exporta seus próprios components, hooks, services, e types.

## 🏗️ Structure

```
src/
├── modules/           # Módulos principais por domínio
│   ├── auth/         # Autenticação e autorização
│   ├── learning/     # Cursos, lições, e progresso
│   ├── gamification/ # Achievements, leaderboard, badges
│   ├── teacher/      # Ferramentas do professor
│   └── admin/        # Administração do sistema
├── shared/           # Componentes e utilitários compartilhados
└── core/            # Configurações core (API, Store, etc.)
```

## 🎯 Usage Examples

### Importing from modules

```typescript
// ✅ Import específico do módulo
import { SignIn, useAuth } from '@modules/auth'
import { CourseCard, useCourses } from '@modules/learning'
import { AchievementCard, useAchievements } from '@modules/gamification'

// ✅ Import namespace para clareza
import { Auth, Learning } from '@modules'

// ✅ Import compartilhados
import { Button, Card, useDebounce } from '@shared'
```

### Module Structure

Cada módulo segue a mesma estrutura:

```
module/
├── components/    # React components
├── hooks/        # Custom hooks  
├── services/     # API calls e business logic
├── types/        # TypeScript types
└── index.ts      # Barrel exports
```

## 🔄 Migration Strategy

A migração está sendo feita gradualmente:

1. **Phase 1** ✅ - Setup da estrutura modular
2. **Phase 2** - Migração gradual dos Redux features
3. **Phase 3** - Consolidação dos componentes
4. **Phase 4** - Camada de serviços unificada
5. **Phase 5** - Limpeza e otimização

## 🚀 Benefits

- **📦 Bundle Splitting**: Cada módulo pode ser carregado sob demanda
- **🧪 Isolated Testing**: Testes isolados por domínio
- **🔧 Easy Maintenance**: Responsabilidades claras
- **📈 Scalability**: Fácil adição de novos módulos
- **🎯 Developer Experience**: Imports limpos e intuitivos

## 📖 Module Guides

- [Auth Module](./auth.md) - Authentication and authorization
- [Learning Module](./learning.md) - Courses, lessons, and progress
- [Gamification Module](./gamification.md) - Achievements and leaderboards
- [Teacher Module](./teacher.md) - Teaching tools and analytics
- [Admin Module](./admin.md) - System administration

## 🔧 Development

### Adding a new module

1. Create module structure in `src/modules/new-module/`
2. Add components, hooks, services, types
3. Create barrel export in `index.ts`
4. Add path mapping to `tsconfig.json`
5. Export from main modules index

### Adding to existing module

1. Add new files to appropriate subfolder
2. Export from subfolder's `index.ts`
3. Update module's main `index.ts` if needed

## 🤝 Contributing

Siga as convenções estabelecidas:
- Use barrel exports (`index.ts`) 
- Mantenha compatibilidade durante migração
- Documente mudanças significativas
- Teste imports em diferentes cenários