/**
 * Profile Form Hook
 * Custom hook for setting up React Hook Form with Zod validation
 */

import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { z } from 'zod';

export interface UseProfileFormOptions<T extends z.ZodType<any, any>> {
  schema: T;
  user: any; // User object from auth
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

export interface UseProfileFormReturn<T> extends UseFormReturn<T> {
  formValues: T;
}

/**
 * Custom hook for profile form setup with React Hook Form + Zod
 *
 * Features:
 * - Automatic form setup with Zod validation
 * - Auto-populates form when user data changes
 * - Real-time validation with onChange mode
 * - Type-safe form values via watch()
 *
 * @param options - Configuration options
 * @param options.schema - Zod validation schema
 * @param options.user - User object from authentication
 * @param options.mode - Validation mode (default: 'onChange')
 * @returns React Hook Form instance with form values
 *
 * @example
 * ```typescript
 * const {
 *   register,
 *   handleSubmit: handleFormSubmit,
 *   formState: { errors },
 *   reset,
 *   formValues,
 * } = useProfileForm({
 *   schema: teacherProfileSchema,
 *   user,
 * });
 *
 * // In JSX:
 * <form onSubmit={handleFormSubmit(onSubmit)}>
 *   <input {...register('name')} />
 *   {errors.name && <p>{errors.name.message}</p>}
 * </form>
 * ```
 */
export function useProfileForm<T extends z.ZodType<any, any>>({
  schema,
  user,
  mode = 'onChange',
}: UseProfileFormOptions<T>): UseProfileFormReturn<z.infer<T>> {
  type FormData = z.infer<T>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode,
    defaultValues: {} as FormData,
  });

  const { reset, watch } = form;
  const formValues = watch();

  // Auto-populate form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        bio: (user as any).bio || '',
        location: (user as any).location || '',
        // Teacher-specific fields (will be ignored if not in schema)
        specialization: (user as any).specialization || '',
        experience: (user as any).experience || '',
      } as FormData);
    }
  }, [user, reset]);

  return {
    ...form,
    formValues,
  };
}
