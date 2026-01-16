/**
 * Avatar Upload Hook
 * Custom hook for handling avatar file selection, validation, and preview
 */

import { useState } from 'react';
import { validateAvatarFile } from '@/lib/validators/avatar.validator';
import { toast } from 'react-hot-toast';

export interface UseAvatarUploadReturn {
  avatarFile: File | null;
  avatarPreview: string | null;
  isUploading: boolean;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearAvatarState: () => void;
  setIsUploading: (uploading: boolean) => void;
}

/**
 * Custom hook for avatar upload functionality
 *
 * Provides:
 * - File selection and validation
 * - Preview generation
 * - Upload state management
 * - State cleanup utilities
 *
 * @param onFileSelected - Optional callback when a valid file is selected
 * @returns Avatar upload state and handlers
 *
 * @example
 * ```typescript
 * const {
 *   avatarFile,
 *   avatarPreview,
 *   isUploading,
 *   handleAvatarChange,
 *   clearAvatarState,
 * } = useAvatarUpload(() => setIsEditing(true));
 *
 * // In JSX:
 * <input type="file" onChange={handleAvatarChange} />
 * <Avatar src={avatarPreview || user.avatar} />
 * ```
 */
export const useAvatarUpload = (
  onFileSelected?: () => void
): UseAvatarUploadReturn => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Handles avatar file selection with validation and preview generation
   */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use centralized avatar validator
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }

    setAvatarFile(validation.processedFile!);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(validation.processedFile!);

    // Notify parent component (e.g., enable editing mode)
    if (onFileSelected) {
      onFileSelected();
    }

    toast.success('Imagem selecionada! Clique em "Salvar Alterações" para fazer upload.');
  };

  /**
   * Clears all avatar-related state
   * Use this when canceling edit or after successful upload
   */
  const clearAvatarState = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  return {
    avatarFile,
    avatarPreview,
    isUploading,
    handleAvatarChange,
    clearAvatarState,
    setIsUploading,
  };
};
