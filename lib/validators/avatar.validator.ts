/**
 * Avatar File Validator
 * Centralized validation logic for avatar uploads
 */

export interface AvatarValidationResult {
  valid: boolean;
  error?: string;
  processedFile?: File;
}

/**
 * Validates and processes avatar file before upload
 *
 * Validation rules:
 * - Type: Must be an image (jpeg, jpg, png, webp)
 * - Size: Maximum 5MB
 * - Filename: Maximum 100 characters (auto-truncates if longer)
 *
 * @param file - File to validate
 * @returns Validation result with processed file or error message
 *
 * @example
 * ```typescript
 * const result = validateAvatarFile(selectedFile);
 * if (!result.valid) {
 *   toast.error(result.error);
 *   return;
 * }
 * // Use result.processedFile for upload
 * await uploadAvatar(result.processedFile);
 * ```
 */
export const validateAvatarFile = (file: File): AvatarValidationResult => {
  // Validate file type (basic check)
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Por favor, selecione uma imagem válida',
    };
  }

  // Validate specific image formats
  const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato não suportado. Use JPG, PNG ou WebP',
    };
  }

  // Validate file size (5MB maximum)
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `A imagem é muito grande (${sizeMB}MB). O tamanho máximo é 5MB`,
    };
  }

  // Validate and truncate filename if necessary
  const MAX_FILENAME_LENGTH = 100;
  let processedFile = file;

  if (file.name.length > MAX_FILENAME_LENGTH) {
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
    const maxNameLength = 95 - extension.length; // Safety margin
    const truncatedName = nameWithoutExt.substring(0, maxNameLength);
    const newFileName = `${truncatedName}${extension}`;

    // Create new File object with truncated name
    processedFile = new File([file], newFileName, { type: file.type });

    console.log(
      `📝 Filename truncated: "${file.name}" (${file.name.length} chars) → "${newFileName}" (${newFileName.length} chars)`
    );
  }

  // Validation passed
  return {
    valid: true,
    processedFile,
  };
};

/**
 * Validates image dimensions (optional - for future use)
 * @param file - Image file to validate
 * @param minWidth - Minimum width in pixels
 * @param minHeight - Minimum height in pixels
 * @returns Promise with validation result
 */
export const validateImageDimensions = (
  file: File,
  minWidth: number = 100,
  minHeight: number = 100
): Promise<AvatarValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `A imagem deve ter pelo menos ${minWidth}x${minHeight} pixels`,
        });
      } else {
        resolve({
          valid: true,
          processedFile: file,
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'Não foi possível carregar a imagem',
      });
    };

    img.src = url;
  });
};
