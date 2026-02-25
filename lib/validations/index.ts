/**
 * Sistema de Validação Centralizado - Zod Schemas
 * 
 * Este arquivo centraliza todas as validações do sistema usando Zod,
 * proporcionando validação em tempo real e messages de erro consistentes.
 */

import { z } from 'zod';

// =============================================
// VALIDATION CONSTANTS
// =============================================

export const VALID_CATEGORIES = [
  'General',
  'Oil & Gas', 
  'Banking',
  'Technology',
  'Executive',
  'AI Enhanced'
] as const;

export const VALID_LEVELS = [
  'Beginner',
  'Intermediate', 
  'Advanced'
] as const;

export const VALID_STATUSES = [
  'Draft',
  'Published',
  'Archived'
] as const;

export const VALID_TEMPLATES = [
  'general',
  'oil-gas',
  'banking', 
  'technology',
  'executive',
  'ai-personal'
] as const;

// =============================================
// CUSTOM ERROR MESSAGES (Portuguese)
// =============================================

export const ERROR_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  MIN_LENGTH: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  MAX_LENGTH: (max: number) => `Deve ter no máximo ${max} caracteres`,
  INVALID_EMAIL: 'Email inválido',
  INVALID_URL: 'URL inválida',
  INVALID_OPTION: (options: string[]) => `Deve ser uma das opções: ${options.join(', ')}`,
  MIN_VALUE: (min: number) => `Deve ser pelo menos ${min}`,
  MAX_VALUE: (max: number) => `Deve ser no máximo ${max}`,
  ARRAY_MIN: (min: number) => `Deve ter pelo menos ${min} item(s)`,
  ARRAY_MAX: (max: number) => `Deve ter no máximo ${max} item(s)`,
} as const;

// =============================================
// BASE SCHEMAS - Reutilizáveis
// =============================================

// ✅ CATEGORIA 2: Título com limite generoso sincronizado (500 chars)
export const titleSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(3, ERROR_MESSAGES.MIN_LENGTH(3))
  .max(500, ERROR_MESSAGES.MAX_LENGTH(500))  // Aumentado de 200 → 500
  .trim();

// ✅ CATEGORIA 1: Descrição sem limite (conteúdo longo)
export const descriptionSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(10, ERROR_MESSAGES.MIN_LENGTH(10))
  .max(1_000_000, ERROR_MESSAGES.MAX_LENGTH(1_000_000))  // Anti-spam (era 1000)
  .trim();

export const emailSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .email(ERROR_MESSAGES.INVALID_EMAIL)
  .trim();

export const categorySchema = z
  .enum(VALID_CATEGORIES, {
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: ERROR_MESSAGES.INVALID_OPTION(VALID_CATEGORIES as any)
  });

export const levelSchema = z
  .enum(VALID_LEVELS, {
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: ERROR_MESSAGES.INVALID_OPTION(VALID_LEVELS as any)
  });

export const statusSchema = z
  .enum(VALID_STATUSES, {
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: ERROR_MESSAGES.INVALID_OPTION(VALID_STATUSES as any)
  });

export const templateSchema = z
  .enum(VALID_TEMPLATES, {
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: ERROR_MESSAGES.INVALID_OPTION(VALID_TEMPLATES as any)
  });

// =============================================
// COURSE SCHEMAS - Específicos para cursos
// =============================================

// ✅ CATEGORIA 1: Learning objectives - conteúdo longo sem limite
export const learningObjectiveSchema = z
  .string()
  .min(5, ERROR_MESSAGES.MIN_LENGTH(5))
  .max(1_000_000, ERROR_MESSAGES.MAX_LENGTH(1_000_000))  // Anti-spam (era 200)
  .trim();

// ✅ CATEGORIA 4: Array aumentado para 15 itens (era 10)
export const learningObjectivesSchema = z
  .array(learningObjectiveSchema)
  .min(1, ERROR_MESSAGES.ARRAY_MIN(1))
  .max(15, ERROR_MESSAGES.ARRAY_MAX(15));

// ✅ CATEGORIA 1: Target audience - conteúdo longo sem limite
export const targetAudienceSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(10, ERROR_MESSAGES.MIN_LENGTH(10))
  .max(1_000_000, ERROR_MESSAGES.MAX_LENGTH(1_000_000))  // Anti-spam (era 500)
  .trim();

export const heartsSchema = z
  .number({ 
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: 'Deve ser um número'
  })
  .int('Deve ser um número inteiro')
  .min(1, ERROR_MESSAGES.MIN_VALUE(1))
  .max(10, ERROR_MESSAGES.MAX_VALUE(10));

export const pointsPerChallengeSchema = z
  .number({ 
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: 'Deve ser um número'
  })
  .int('Deve ser um número inteiro')
  .min(1, ERROR_MESSAGES.MIN_VALUE(1))
  .max(100, ERROR_MESSAGES.MAX_VALUE(100));

export const passingScoreSchema = z
  .number({ 
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: 'Deve ser um número'
  })
  .int('Deve ser um número inteiro')
  .min(50, ERROR_MESSAGES.MIN_VALUE(50))
  .max(100, ERROR_MESSAGES.MAX_VALUE(100));

// =============================================
// UNIT SCHEMAS - Para unidades de curso
// =============================================

// ✅ CATEGORIA 2: Unit title com limite generoso sincronizado
export const unitTitleSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(3, ERROR_MESSAGES.MIN_LENGTH(3))
  .max(500, ERROR_MESSAGES.MAX_LENGTH(500))  // Aumentado de 100 → 500
  .trim();

// ✅ CATEGORIA 1: Unit description - conteúdo longo sem limite
export const unitDescriptionSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(10, ERROR_MESSAGES.MIN_LENGTH(10))
  .max(1_000_000, ERROR_MESSAGES.MAX_LENGTH(1_000_000))  // Anti-spam (era 500)
  .trim();

export const unitOrderSchema = z
  .number({ 
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: 'Deve ser um número'
  })
  .int('Deve ser um número inteiro')
  .min(1, ERROR_MESSAGES.MIN_VALUE(1))
  .max(100, ERROR_MESSAGES.MAX_VALUE(100));

// =============================================
// LESSON SCHEMAS - Para lições
// =============================================

// ✅ CATEGORIA 2: Lesson title com limite generoso sincronizado
export const lessonTitleSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(3, ERROR_MESSAGES.MIN_LENGTH(3))
  .max(500, ERROR_MESSAGES.MAX_LENGTH(500))  // Aumentado de 150 → 500
  .trim();

// ✅ CATEGORIA 1: Lesson objectives - conteúdo longo sem limite
export const lessonObjectiveSchema = z
  .string()
  .min(5, ERROR_MESSAGES.MIN_LENGTH(5))
  .max(1_000_000, ERROR_MESSAGES.MAX_LENGTH(1_000_000))  // Anti-spam (era 200)
  .trim();

// ✅ CATEGORIA 4: Array aumentado para 5 itens (mantido)
export const lessonObjectivesSchema = z
  .array(lessonObjectiveSchema)
  .min(1, ERROR_MESSAGES.ARRAY_MIN(1))
  .max(5, ERROR_MESSAGES.ARRAY_MAX(5));

export const lessonDurationSchema = z
  .number({ 
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: 'Deve ser um número'
  })
  .int('Deve ser um número inteiro')
  .min(5, ERROR_MESSAGES.MIN_VALUE(5))
  .max(60, ERROR_MESSAGES.MAX_VALUE(60));

export const templateTypeSchema = z
  .enum(['vocabulary-intro', 'grammar-basics', 'conversation-practice', 'comprehensive-review'], {
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: ERROR_MESSAGES.INVALID_OPTION(['vocabulary-intro', 'grammar-basics', 'conversation-practice', 'comprehensive-review'])
  });

// =============================================
// CHALLENGE SCHEMAS - Para desafios/exercícios
// =============================================

export const VALID_CHALLENGE_TYPES = [
  'multiple-choice',
  'fill-blank',
  'translation',
  'listening',
  'speaking',
  'match-pairs',
  'sentence-order',
  'true-false'
] as const;

export const challengeTypeSchema = z
  .enum(VALID_CHALLENGE_TYPES, {
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: ERROR_MESSAGES.INVALID_OPTION(VALID_CHALLENGE_TYPES as any)
  });

// ✅ CATEGORIA 1: Challenge question - conteúdo longo sem limite
export const challengeQuestionSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(5, ERROR_MESSAGES.MIN_LENGTH(5))
  .max(1_000_000, ERROR_MESSAGES.MAX_LENGTH(1_000_000))  // Anti-spam (era 500)
  .trim();

export const challengeOrderSchema = z
  .number({
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: 'Deve ser um número'
  })
  .int('Deve ser um número inteiro')
  .min(1, ERROR_MESSAGES.MIN_VALUE(1))
  .max(50, ERROR_MESSAGES.MAX_VALUE(50));

// ✅ CATEGORIA 3: Hint aumentado para 300 chars (era 200)
export const challengeHintSchema = z
  .string()
  .min(3, ERROR_MESSAGES.MIN_LENGTH(3))
  .max(300, ERROR_MESSAGES.MAX_LENGTH(300))
  .trim();

// ✅ CATEGORIA 4: Array aumentado para 5 hints (era 3)
export const challengeHintsSchema = z
  .array(challengeHintSchema)
  .max(5, ERROR_MESSAGES.ARRAY_MAX(5));

// ✅ CATEGORIA 1: Challenge explanation - conteúdo longo sem limite
export const challengeExplanationSchema = z
  .string()
  .max(1_000_000, ERROR_MESSAGES.MAX_LENGTH(1_000_000))  // Anti-spam (era 300)
  .trim()
  .optional();

// ✅ CATEGORIA 3: Challenge option text aumentado para 300 chars (era 200)
export const challengeOptionTextSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(1, ERROR_MESSAGES.MIN_LENGTH(1))
  .max(300, ERROR_MESSAGES.MAX_LENGTH(300))
  .trim();

export const challengeOptionSchema = z.object({
  text: challengeOptionTextSchema,
  is_correct: z.boolean().default(false),
  order: z.number().int().min(0),
  image_url: z.string().url('URL de imagem inválida').optional(),
  audio_url: z.string().url('URL de áudio inválida').optional(),
});

export const challengeOptionsSchema = z
  .array(challengeOptionSchema)
  .min(0, ERROR_MESSAGES.ARRAY_MIN(0)) // Permitir arrays vazios para speaking
  .max(8, ERROR_MESSAGES.ARRAY_MAX(8))
  .refine(
    (options) => {
      // Se não há opções, não precisa validar is_correct (para speaking)
      if (options.length === 0) return true;
      return options.some(option => option.is_correct);
    },
    'Pelo menos uma opção deve estar marcada como correta (quando há opções)'
  );

// =============================================
// COMPLETE COURSE CREATION SCHEMA
// =============================================

export const courseCreationSchema = z.object({
  // Informações básicas - OBRIGATÓRIAS
  title: titleSchema,
  description: descriptionSchema,
  category: categorySchema,
  level: levelSchema.default('Beginner'),
  
  // Template e status - OPCIONAIS com defaults
  template: templateSchema.optional(),
  status: statusSchema.default('Draft'),
  
  // Configurações de aprendizado - OBRIGATÓRIAS
  learningObjectives: learningObjectivesSchema,
  targetAudience: targetAudienceSchema,
  
  // Gamificação - OPCIONAIS com defaults
  hearts: heartsSchema.default(5),
  pointsPerChallenge: pointsPerChallengeSchema.default(10),
  passingScore: passingScoreSchema.default(70),
  
  // Metadados - OPCIONAIS (preenchidos automaticamente)
  language: z.string().default('pt-BR'),
  teacher_id: z.string().optional(),
  teacher_email: emailSchema.optional(),
  teacher_name: z.string().optional(),
  created_by: z.string().optional(),
});

// =============================================
// STEP-BY-STEP SCHEMAS - Para validação por etapa
// =============================================

export const courseBasicInfoSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  category: categorySchema,
  level: levelSchema.default('Beginner'),
});

export const courseLearningConfigSchema = z.object({
  learningObjectives: learningObjectivesSchema,
  targetAudience: targetAudienceSchema,
  hearts: heartsSchema.default(5),
  pointsPerChallenge: pointsPerChallengeSchema.default(10),
  passingScore: passingScoreSchema.default(70),
});

export const courseTemplateSchema = z.object({
  template: templateSchema,
  category: categorySchema, // Definido automaticamente pelo template
});

// =============================================
// UNIT CREATION SCHEMA
// =============================================

export const unitCreationSchema = z.object({
  title: unitTitleSchema,
  description: unitDescriptionSchema,
  order: unitOrderSchema.default(1),
  course: z.string().uuid('ID do curso deve ser um UUID válido').optional(),
});

// =============================================
// LESSON CREATION SCHEMA
// =============================================

export const lessonCreationSchema = z.object({
  title: lessonTitleSchema,
  objectives: lessonObjectivesSchema,
  estimatedDuration: lessonDurationSchema.default(15),
  selectedTemplate: templateTypeSchema,
  unit: z.string().uuid('ID da unidade deve ser um UUID válido').optional(),
  order: unitOrderSchema.default(1),
});

// =============================================
// CHALLENGE CREATION SCHEMA - Base Flexível
// =============================================

export const challengeCreationSchema = z.object({
  type: challengeTypeSchema,
  question: challengeQuestionSchema,
  options: z.array(challengeOptionSchema).default([]), // Flexível, pode ser vazio
  order: challengeOrderSchema.default(1),
  hints: challengeHintsSchema.default([]),
  explanation: challengeExplanationSchema.optional(), // Opcional
  lesson: z.string().uuid('ID da lição deve ser um UUID válido').optional(),
});

// Type-specific challenge validation schemas - SIMPLIFICADOS
export const multipleChoiceChallengeSchema = challengeCreationSchema;

export const fillBlankChallengeSchema = challengeCreationSchema;

export const translationChallengeSchema = challengeCreationSchema;

export const listeningChallengeSchema = challengeCreationSchema;

export const speakingChallengeSchema = challengeCreationSchema;

export const matchPairsChallengeSchema = challengeCreationSchema;

export const sentenceOrderChallengeSchema = challengeCreationSchema;

export const trueFalseChallengeSchema = challengeCreationSchema;

// =============================================
// UTILITY TYPES - Para TypeScript
// =============================================

export type CourseCreationData = z.infer<typeof courseCreationSchema>;
export type CourseBasicInfo = z.infer<typeof courseBasicInfoSchema>;
export type CourseLearningConfig = z.infer<typeof courseLearningConfigSchema>;
export type CourseTemplate = z.infer<typeof courseTemplateSchema>;

export type UnitCreationData = z.infer<typeof unitCreationSchema>;
export type LessonCreationData = z.infer<typeof lessonCreationSchema>;

// Challenge Types
export type ChallengeCreationData = z.infer<typeof challengeCreationSchema>;
export type ChallengeOption = z.infer<typeof challengeOptionSchema>;
export type ChallengeType = typeof VALID_CHALLENGE_TYPES[number];

export type ValidationCategory = typeof VALID_CATEGORIES[number];
export type ValidationLevel = typeof VALID_LEVELS[number];
export type ValidationStatus = typeof VALID_STATUSES[number];
export type ValidationTemplate = typeof VALID_TEMPLATES[number];

// =============================================
// VALIDATION HELPERS - Funções utilitárias
// =============================================

/**
 * Valida dados de forma segura e retorna erros amigáveis
 */
export function validateSafely<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string[]> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(error.message);
  });
  
  return { success: false, errors };
}

/**
 * Valida um campo específico e retorna o primeiro erro
 */
export function validateField<T>(
  schema: z.ZodSchema<T>, 
  value: unknown
): { isValid: true; value: T } | { isValid: false; error: string } {
  const result = schema.safeParse(value);
  
  if (result.success) {
    return { isValid: true, value: result.data };
  }
  
  return { 
    isValid: false, 
    error: result.error.errors[0]?.message || 'Valor inválido' 
  };
}

/**
 * Cria um objeto com valores padrão baseado no schema
 */
export function getDefaultValues<T extends z.ZodObject<any>>(schema: T): Partial<z.infer<T>> {
  const shape = schema.shape;
  const defaults: any = {};
  
  Object.keys(shape).forEach((key) => {
    const field = shape[key];
    if (field._def.defaultValue !== undefined) {
      defaults[key] = field._def.defaultValue();
    }
  });
  
  return defaults;
}

// =============================================
// VALIDATION STATUS HELPERS
// =============================================

/**
 * Verifica se um step está válido
 */
export function isStepValid(step: 'template' | 'basic-info' | 'learning-config', data: any): boolean {
  switch (step) {
    case 'template':
      return courseTemplateSchema.safeParse(data).success;
    case 'basic-info':
      return courseBasicInfoSchema.safeParse(data).success;
    case 'learning-config':
      return courseLearningConfigSchema.safeParse(data).success;
    default:
      return false;
  }
}

/**
 * Obtém erros de validação para um step específico
 */
export function getStepErrors(step: 'template' | 'basic-info' | 'learning-config', data: any): Record<string, string[]> {
  let schema: z.ZodSchema;
  
  switch (step) {
    case 'template':
      schema = courseTemplateSchema;
      break;
    case 'basic-info':
      schema = courseBasicInfoSchema;
      break;
    case 'learning-config':
      schema = courseLearningConfigSchema;
      break;
    default:
      return {};
  }
  
  const result = validateSafely(schema, data);
  return result.success ? {} : result.errors;
}

// =============================================
// CHALLENGE VALIDATION HELPERS
// =============================================

/**
 * Valida um desafio com regras flexíveis baseadas no tipo
 */
export function validateChallenge(challengeData: any): { success: true; data: any } | { success: false; errors: Record<string, string[]> } {
  // Usar sempre o schema base flexível
  return validateSafely(challengeCreationSchema, challengeData);
}

/**
 * Obtém as regras de validação para um tipo de desafio específico
 */
export function getChallengeValidationRules(challengeType: ChallengeType): {
  minOptions: number;
  maxOptions: number;
  requiresCorrectAnswer: boolean;
  allowsMultipleCorrect: boolean;
  description: string;
} {
  switch (challengeType) {
    case 'multiple-choice':
      return {
        minOptions: 3,
        maxOptions: 4,
        requiresCorrectAnswer: true,
        allowsMultipleCorrect: false,
        description: 'Deve ter entre 3 e 4 opções com exatamente uma resposta correta'
      };
    case 'fill-blank':
    case 'translation':
      return {
        minOptions: 1,
        maxOptions: 1,
        requiresCorrectAnswer: true,
        allowsMultipleCorrect: false,
        description: 'Deve ter apenas uma resposta correta'
      };
    case 'listening':
      return {
        minOptions: 3,
        maxOptions: 4,
        requiresCorrectAnswer: true,
        allowsMultipleCorrect: false,
        description: 'Deve ter entre 3 e 4 opções com exatamente uma resposta correta'
      };
    case 'speaking':
      return {
        minOptions: 0,
        maxOptions: 0,
        requiresCorrectAnswer: false,
        allowsMultipleCorrect: false,
        description: 'Não requer opções de resposta'
      };
    case 'match-pairs':
      return {
        minOptions: 4,
        maxOptions: 8,
        requiresCorrectAnswer: false,
        allowsMultipleCorrect: true,
        description: 'Deve ter entre 4 e 8 elementos em pares'
      };
    case 'sentence-order':
      return {
        minOptions: 4,
        maxOptions: 8,
        requiresCorrectAnswer: false,
        allowsMultipleCorrect: false,
        description: 'Deve ter entre 4 e 8 palavras para ordenar'
      };
    case 'true-false':
      return {
        minOptions: 2,
        maxOptions: 2,
        requiresCorrectAnswer: true,
        allowsMultipleCorrect: false,
        description: 'Deve ter exatamente 2 opções com uma resposta correta'
      };
    default:
      return {
        minOptions: 1,
        maxOptions: 8,
        requiresCorrectAnswer: true,
        allowsMultipleCorrect: false,
        description: 'Regras de validação padrão'
      };
  }
}