/**
 * Constants for Vapi Conversation Practice
 */

import { Home, Fuel, Monitor, Briefcase } from 'lucide-react';
import type { LevelOption, DomainOption, CorrectionModeOption } from './types';

export const LEVELS: LevelOption[] = [
  { id: 'A1', name: 'A1 - Basico', description: 'Frases simples e vocabulario basico', color: 'bg-green-500' },
  { id: 'A2', name: 'A2 - Pre-Intermediario', description: 'Conversas simples do dia-a-dia', color: 'bg-green-600' },
  { id: 'B1', name: 'B1 - Intermediario', description: 'Discussoes sobre topicos familiares', color: 'bg-blue-500' },
  { id: 'B2', name: 'B2 - Intermediario Avancado', description: 'Conversas complexas e naturais', color: 'bg-blue-600' },
  { id: 'C1', name: 'C1 - Avancado', description: 'Discussoes fluentes e sofisticadas', color: 'bg-purple-500' },
  { id: 'C2', name: 'C2 - Proficiente', description: 'Conversas nativas e especializadas', color: 'bg-purple-600' }
];

export const DOMAINS: DomainOption[] = [
  {
    id: 'general',
    name: 'Geral',
    description: 'Conversacao cotidiana',
    icon: Home,
    color: 'bg-gray-500',
    objectives: [
      'Praticar conversacao casual',
      'Melhorar fluencia geral',
      'Desenvolver confianca'
    ]
  },
  {
    id: 'petroleum',
    name: 'Petroleo & Gas',
    description: 'Ingles tecnico para industria',
    icon: Fuel,
    color: 'bg-orange-500',
    objectives: [
      'Vocabulario tecnico offshore',
      'Comunicacao de seguranca',
      'Procedimentos operacionais'
    ]
  },
  {
    id: 'IT',
    name: 'Tecnologia',
    description: 'Ingles para area de TI',
    icon: Monitor,
    color: 'bg-blue-500',
    objectives: [
      'Terminologia de software',
      'Discussoes tecnicas',
      'Apresentacoes de projetos'
    ]
  },
  {
    id: 'business',
    name: 'Negocios',
    description: 'Ingles corporativo',
    icon: Briefcase,
    color: 'bg-green-500',
    objectives: [
      'Reunioes de negocios',
      'Negociacoes',
      'Apresentacoes executivas'
    ]
  }
];

export const CORRECTION_MODES: CorrectionModeOption[] = [
  { id: 'gentle', name: 'Suave', description: 'Correcoes discretas e encorajadoras' },
  { id: 'direct', name: 'Direto', description: 'Feedback claro e especifico' }
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';
export const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

export const DEFAULT_CONFIG = {
  level: 'B1' as const,
  domain: 'general' as const,
  objective: '',
  correction_mode: 'gentle' as const,
  speaking_speed_target: 1.0,
  maxDurationMinutes: 10,
  autoEndEnabled: true
};
