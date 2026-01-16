/**
 * Profile Update Hook
 * Custom hook for handling profile form submission with avatar upload
 */

import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { userLoggedIn } from '@/src/domains/auth';
import { uploadProfileWithAvatar } from '@/lib/profile.utils';
import { fetchUserFromBackend } from '@/lib/django-middleware';

export interface UseProfileUpdateOptions {
  updateProfileMutation: any; // RTK Query mutation hook result
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  avatarFile: File | null;
  setIsEditing: (editing: boolean) => void;
  clearAvatarState: () => void;
}

export interface UseProfileUpdateReturn {
  onSubmit: (formData: any) => Promise<void>;
}

/**
 * Custom hook for profile update/form submission
 *
 * Handles:
 * - Form submission with validated data
 * - Avatar upload to S3 (if file is selected)
 * - Profile update via API
 * - localStorage and Redux state updates
 * - Success/error toast notifications
 * - State cleanup after submission
 *
 * @param options - Configuration options
 * @returns Form submission handler
 *
 * @example
 * ```typescript
 * const { onSubmit } = useProfileUpdate({
 *   updateProfileMutation: updateProfile,
 *   isUploading,
 *   setIsUploading,
 *   avatarFile,
 *   setIsEditing,
 *   clearAvatarState,
 * });
 *
 * // In form:
 * <form onSubmit={handleFormSubmit(onSubmit)}>
 * ```
 */
export const useProfileUpdate = ({
  updateProfileMutation,
  isUploading,
  setIsUploading,
  avatarFile,
  setIsEditing,
  clearAvatarState,
}: UseProfileUpdateOptions): UseProfileUpdateReturn => {
  const dispatch = useDispatch();

  /**
   * Form submission handler with avatar upload support
   * @param formData - Validated form data from React Hook Form
   */
  const onSubmit = async (formData: any) => {
    // Prevent double submission
    if (isUploading) return;

    setIsUploading(true);

    try {
      let updatedUser;

      if (avatarFile) {
        // Path 1: Upload avatar and update profile
        await uploadProfileWithAvatar(avatarFile);

        // Fetch fresh user data from backend (includes new avatar)
        updatedUser = await fetchUserFromBackend();

        if (updatedUser) {
          // Update Redux state with fresh backend data
          const accessToken = localStorage.getItem('access_token') || '';
          const refreshToken = localStorage.getItem('refresh_token') || '';

          dispatch(userLoggedIn({
            accessToken,
            refreshToken,
            user: updatedUser
          }));

          toast.success('Perfil e foto atualizados com sucesso!');

          // Clear states
          setIsEditing(false);
          clearAvatarState();
        } else {
          throw new Error('Falha ao buscar dados atualizados do servidor');
        }
      } else {
        // Path 2: Update profile data only (no avatar)
        // formData is already validated by Zod!
        updatedUser = await updateProfileMutation(formData).unwrap();

        // Fetch fresh user data from backend to ensure consistency
        const freshUser = await fetchUserFromBackend();
        if (freshUser) {
          const accessToken = localStorage.getItem('access_token') || '';
          const refreshToken = localStorage.getItem('refresh_token') || '';

          dispatch(userLoggedIn({
            accessToken,
            refreshToken,
            user: freshUser
          }));
        }

        toast.success('Perfil atualizado com sucesso!');
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error?.message || error?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    onSubmit,
  };
};
