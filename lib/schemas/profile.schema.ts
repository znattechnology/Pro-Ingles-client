/**
 * Profile Validation Schemas
 * Zod schemas for user profile validation (teacher and student)
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// BASE PROFILE SCHEMA (Shared fields between teacher and student)
// ═══════════════════════════════════════════════════════════════════════════

const baseProfileSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'O nome deve conter apenas letras e espaços'),

  email: z
    .string()
    .email('Email inválido')
    .toLowerCase(),

  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+[1-9]\d{1,14}$/.test(val),
      'Telefone deve estar no formato internacional (ex: +244912345678)'
    ),

  // ✅ CATEGORIA 1: Bio sem limite (conteúdo longo)
  bio: z
    .string()
    .max(1_000_000, 'Biografia muito longa (máximo 1MB)')  // Anti-spam (era 500)
    .optional()
    .or(z.literal('')),

  // ✅ CATEGORIA 3: Location mantido em 100 (campo curto)
  location: z
    .string()
    .max(100, 'A localização deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
});

// ═══════════════════════════════════════════════════════════════════════════
// TEACHER PROFILE SCHEMA (Extends base with teacher-specific fields)
// ═══════════════════════════════════════════════════════════════════════════

export const teacherProfileSchema = baseProfileSchema.extend({
  // ✅ CATEGORIA 3: Specialization aumentado para 200 chars (era 150)
  specialization: z
    .string()
    .max(200, 'A especialização deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),

  // ✅ CATEGORIA 1: Experience sem limite (conteúdo longo)
  experience: z
    .string()
    .max(1_000_000, 'Experiência muito longa (máximo 1MB)')  // Anti-spam (era 200)
    .optional()
    .or(z.literal('')),
});

// ═══════════════════════════════════════════════════════════════════════════
// STUDENT PROFILE SCHEMA (Base schema, no additional fields currently)
// ═══════════════════════════════════════════════════════════════════════════

export const studentProfileSchema = baseProfileSchema;

// ═══════════════════════════════════════════════════════════════════════════
// AVATAR VALIDATION (Client-side file validation)
// ═══════════════════════════════════════════════════════════════════════════

export interface AvatarValidationResult {
  valid: boolean;
  error?: string;
  processedFile?: File;
}

/**
 * Validates avatar file before upload
 * @param file - File to validate
 * @returns Validation result with processed file
 */
export const validateAvatarFile = (file: File): AvatarValidationResult => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Por favor, selecione uma imagem válida',
    };
  }

  // Validate supported formats
  const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPG, PNG ou WebP',
    };
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'A imagem deve ter menos de 5MB',
    };
  }

  // Validate and truncate filename if too long (max 100 chars)
  let processedFile = file;
  if (file.name.length > 100) {
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
    const maxNameLength = 95 - extension.length;
    const truncatedName = nameWithoutExt.substring(0, maxNameLength);
    const newFileName = `${truncatedName}${extension}`;

    processedFile = new File([file], newFileName, { type: file.type });
    console.log(`Filename truncated: ${file.name.length} → ${newFileName.length} chars`);
  }

  return {
    valid: true,
    processedFile,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPESCRIPT TYPES (Inferred from schemas)
// ═══════════════════════════════════════════════════════════════════════════

export type TeacherProfileFormData = z.infer<typeof teacherProfileSchema>;
export type StudentProfileFormData = z.infer<typeof studentProfileSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates teacher profile data
 * @param data - Form data to validate
 * @returns Validation result
 */
export const validateTeacherProfile = (data: unknown) => {
  return teacherProfileSchema.safeParse(data);
};

/**
 * Validates student profile data
 * @param data - Form data to validate
 * @returns Validation result
 */
export const validateStudentProfile = (data: unknown) => {
  return studentProfileSchema.safeParse(data);
};
