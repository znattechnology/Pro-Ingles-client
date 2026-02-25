/**
 * Profile Utility Functions
 * Shared utilities for profile pages (teacher and student)
 */

import { uploadAvatarToS3 } from '@/lib/utils';

/**
 * Generates user initials from full name for avatar fallback
 * @param name - User's full name
 * @returns First 2 initials in uppercase (e.g., "John Doe" -> "JD")
 *
 * @example
 * ```typescript
 * getInitials("João Silva") // "JS"
 * getInitials("Maria") // "M"
 * ```
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Formats join date in Portuguese locale
 * @returns Formatted date string (e.g., "janeiro de 2024")
 *
 * @example
 * ```typescript
 * formatJoinDate() // "janeiro de 2026"
 * ```
 */
export const formatJoinDate = (): string => {
  return new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long'
  });
};

/**
 * Uploads avatar to S3 and updates user profile in database
 *
 * This function:
 * 1. Uploads avatar file to S3 via presigned URL
 * 2. Updates user profile with new avatar URL via PATCH request
 * 3. Uses Bearer token authentication from localStorage
 *
 * @param file - Avatar image file to upload
 * @returns Updated user object from API response
 * @throws Error if upload or API update fails
 *
 * @example
 * ```typescript
 * try {
 *   const updatedUser = await uploadProfileWithAvatar(avatarFile);
 *   console.log('Avatar uploaded:', updatedUser.avatar);
 * } catch (error) {
 *   toast.error('Erro ao fazer upload do avatar');
 * }
 * ```
 */
export const uploadProfileWithAvatar = async (file: File) => {
  try {
    // Step 1: Upload file to S3 and get the avatar URL
    const avatarUrl = await uploadAvatarToS3(file);

    // Step 2: Update user profile in database with the new avatar URL
    const token = localStorage.getItem('access_token');
    const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';
    const endpoint = `${apiUrl}/users/profile/`;

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar: avatarUrl
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao atualizar perfil' }));
      throw new Error(error.message || error.detail || 'Erro ao atualizar perfil');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    throw error;
  }
};
