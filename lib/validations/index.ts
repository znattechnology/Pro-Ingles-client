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

export const titleSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(3, ERROR_MESSAGES.MIN_LENGTH(3))
  .max(200, ERROR_MESSAGES.MAX_LENGTH(200))
  .trim();

export const descriptionSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(10, ERROR_MESSAGES.MIN_LENGTH(10))
  .max(1000, ERROR_MESSAGES.MAX_LENGTH(1000))
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

export const learningObjectiveSchema = z
  .string()
  .min(5, ERROR_MESSAGES.MIN_LENGTH(5))
  .max(200, ERROR_MESSAGES.MAX_LENGTH(200))
  .trim();

export const learningObjectivesSchema = z
  .array(learningObjectiveSchema)
  .min(1, ERROR_MESSAGES.ARRAY_MIN(1))
  .max(10, ERROR_MESSAGES.ARRAY_MAX(10));

export const targetAudienceSchema = z
  .string({ required_error: ERROR_MESSAGES.REQUIRED })
  .min(10, ERROR_MESSAGES.MIN_LENGTH(10))
  .max(500, ERROR_MESSAGES.MAX_LENGTH(500))
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
// UTILITY TYPES - Para TypeScript
// =============================================

export type CourseCreationData = z.infer<typeof courseCreationSchema>;
export type CourseBasicInfo = z.infer<typeof courseBasicInfoSchema>;
export type CourseLearningConfig = z.infer<typeof courseLearningConfigSchema>;
export type CourseTemplate = z.infer<typeof courseTemplateSchema>;

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