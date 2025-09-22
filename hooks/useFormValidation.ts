/**
 * Hook de Validação em Tempo Real com Zod
 * 
 * Fornece validação em tempo real para formulários,
 * com debounce e feedback instantâneo ao usuário.
 */

import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { validateSafely, validateField } from '@/lib/validations';

interface UseFormValidationOptions {
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FieldValidation {
  isValid: boolean;
  error: string | null;
  isValidating: boolean;
  hasBeenTouched: boolean;
}

interface FormValidation<T> {
  // Estado dos campos
  fields: Record<keyof T, FieldValidation>;
  
  // Estado geral do formulário
  isFormValid: boolean;
  hasErrors: boolean;
  isValidating: boolean;
  
  // Métodos de validação
  validateField: (fieldName: keyof T, value: any) => void;
  validateForm: (data: T) => boolean;
  clearErrors: () => void;
  clearFieldError: (fieldName: keyof T) => void;
  setFieldTouched: (fieldName: keyof T) => void;
  
  // Helpers
  getFieldError: (fieldName: keyof T) => string | null;
  isFieldValid: (fieldName: keyof T) => boolean;
  getFormErrors: () => Record<string, string[]>;
}

export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: T,
  options: UseFormValidationOptions = {}
): FormValidation<T> {
  const {
    debounceMs = 300,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  // Estado dos campos individuais
  const [fields, setFields] = useState<Record<keyof T, FieldValidation>>(() => {
    const initialFields: any = {};
    Object.keys(initialData).forEach((key) => {
      initialFields[key] = {
        isValid: true,
        error: null,
        isValidating: false,
        hasBeenTouched: false,
      };
    });
    return initialFields;
  });

  // Estado de validação geral
  const [isFormValid, setIsFormValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Validar campo individual
  const validateSingleField = useCallback(
    (fieldName: keyof T, value: any, immediate = false) => {
      if (!validateOnChange && !immediate) return;

      // Cancelar timer anterior
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Atualizar estado para "validando"
      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          isValidating: true,
        },
      }));

      const performValidation = () => {
        try {
          // Extrair schema do campo específico
          const fieldSchema = schema.shape?.[fieldName as string];
          if (!fieldSchema) {
            console.warn(`Schema not found for field: ${String(fieldName)}`);
            return;
          }

          const result = validateField(fieldSchema, value);

          setFields((prev) => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              isValid: result.isValid,
              error: result.isValid ? null : result.error,
              isValidating: false,
            },
          }));
        } catch (error) {
          console.error(`Validation error for field ${String(fieldName)}:`, error);
          setFields((prev) => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              isValid: false,
              error: 'Erro de validação',
              isValidating: false,
            },
          }));
        }
      };

      if (immediate || debounceMs === 0) {
        performValidation();
      } else {
        const timer = setTimeout(performValidation, debounceMs);
        setDebounceTimer(timer);
      }
    },
    [schema, validateOnChange, debounceMs, debounceTimer]
  );

  // Validar formulário completo
  const validateForm = useCallback(
    (data: T): boolean => {
      setIsValidating(true);

      const result = validateSafely(schema, data);

      if (result.success) {
        // Limpar todos os erros
        setFields((prev) => {
          const newFields: any = {};
          Object.keys(prev).forEach((key) => {
            newFields[key] = {
              ...prev[key],
              isValid: true,
              error: null,
              isValidating: false,
            };
          });
          return newFields;
        });
        setIsFormValid(true);
        setIsValidating(false);
        return true;
      } else {
        // Atualizar erros por campo
        setFields((prev) => {
          const newFields: any = { ...prev };
          
          // Primeiro, limpar todos os erros
          Object.keys(newFields).forEach((key) => {
            newFields[key] = {
              ...newFields[key],
              isValid: true,
              error: null,
              isValidating: false,
            };
          });

          // Depois, definir os erros encontrados
          Object.entries(result.errors).forEach(([fieldPath, errors]) => {
            const fieldName = fieldPath.split('.')[0]; // Pegar primeiro nível do path
            if (newFields[fieldName]) {
              newFields[fieldName] = {
                ...newFields[fieldName],
                isValid: false,
                error: errors[0] || 'Campo inválido',
                isValidating: false,
              };
            }
          });

          return newFields;
        });
        setIsFormValid(false);
        setIsValidating(false);
        return false;
      }
    },
    [schema]
  );

  // Limpar todos os erros
  const clearErrors = useCallback(() => {
    setFields((prev) => {
      const newFields: any = {};
      Object.keys(prev).forEach((key) => {
        newFields[key] = {
          ...prev[key],
          isValid: true,
          error: null,
          isValidating: false,
        };
      });
      return newFields;
    });
    setIsFormValid(false);
  }, []);

  // Limpar erro de campo específico
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isValid: true,
        error: null,
        isValidating: false,
      },
    }));
  }, []);

  // Marcar campo como tocado
  const setFieldTouched = useCallback((fieldName: keyof T) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        hasBeenTouched: true,
      },
    }));
  }, []);

  // Helpers
  const getFieldError = useCallback(
    (fieldName: keyof T): string | null => {
      return fields[fieldName]?.error || null;
    },
    [fields]
  );

  const isFieldValid = useCallback(
    (fieldName: keyof T): boolean => {
      return fields[fieldName]?.isValid ?? true;
    },
    [fields]
  );

  const getFormErrors = useCallback((): Record<string, string[]> => {
    const errors: Record<string, string[]> = {};
    Object.entries(fields).forEach(([fieldName, validation]) => {
      if (!validation.isValid && validation.error) {
        errors[fieldName] = [validation.error];
      }
    });
    return errors;
  }, [fields]);

  // Calcular estado derivado
  const hasErrors = Object.values(fields).some((field) => !field.isValid);
  const isFormValidating = Object.values(fields).some((field) => field.isValidating) || isValidating;

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    // Estado
    fields,
    isFormValid,
    hasErrors,
    isValidating: isFormValidating,
    
    // Métodos
    validateField: validateSingleField,
    validateForm,
    clearErrors,
    clearFieldError,
    setFieldTouched,
    
    // Helpers
    getFieldError,
    isFieldValid,
    getFormErrors,
  };
}

// =============================================
// HOOK ESPECÍFICO PARA CRIAÇÃO DE CURSO
// =============================================

export function useCourseValidation(initialData: any) {
  return useFormValidation(
    z.object({
      title: z.string().min(3).max(200),
      description: z.string().min(10).max(1000),
      category: z.string().min(1),
      level: z.string().min(1),
      learningObjectives: z.array(z.string().min(5)).min(1),
      targetAudience: z.string().min(10),
      hearts: z.number().int().min(1).max(10),
      pointsPerChallenge: z.number().int().min(1).max(100),
      passingScore: z.number().int().min(50).max(100),
    }),
    initialData,
    {
      debounceMs: 300,
      validateOnChange: true,
      validateOnBlur: true,
    }
  );
}

// =============================================
// COMPONENTE DE FEEDBACK VISUAL
// =============================================

interface ValidationFeedbackProps {
  error: string | null;
  isValidating?: boolean;
  className?: string;
}

export function ValidationFeedback({ error, isValidating, className = '' }: ValidationFeedbackProps) {
  if (isValidating) {
    return (
      <div className={`text-sm text-gray-500 mt-1 ${className}`}>
        <span className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Validando...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-500 mt-1 ${className}`}>
        <span className="inline-flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      </div>
    );
  }

  return null;
}