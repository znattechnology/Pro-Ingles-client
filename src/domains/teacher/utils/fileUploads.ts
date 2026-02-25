/**
 * File upload utilities for Teacher Practice Management
 *
 * These utilities handle file uploads with:
 * - Client-side validation (type, size)
 * - Progress tracking
 * - Presigned S3 URL upload
 * - Error handling with user-friendly messages
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Allowed audio MIME types
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/x-m4a',
  'audio/mp4',
  'audio/aac',
];

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

// File size limits
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadProgress {
  percent: number;
  loaded: number;
  total: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

// Get auth token from localStorage
// NOTE: Authentication is handled via HttpOnly cookies (credentials: 'include')
// No need to manually get/set tokens

/**
 * Validate audio file before upload
 */
export const validateAudioFile = (file: File): ValidationResult => {
  // Check file type
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Use: MP3, WAV, OGG, WebM, M4A ou AAC`,
    };
  }

  // Check file size
  if (file.size > MAX_AUDIO_SIZE) {
    const maxMB = Math.round(MAX_AUDIO_SIZE / (1024 * 1024));
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxMB}MB`,
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac', 'mp4'];
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extensão de arquivo não permitida. Use: ${allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): ValidationResult => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Use: JPG, PNG, WebP, GIF ou SVG`,
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    const maxMB = Math.round(MAX_IMAGE_SIZE / (1024 * 1024));
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxMB}MB`,
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extensão de arquivo não permitida. Use: ${allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload audio file to S3 using presigned URL
 * Now with validation and progress tracking
 */
export const uploadAudioToS3 = async (
  audioFile: File,
  lessonId: string,
  challengeId: string,
  options?: UploadOptions
): Promise<string> => {
  try {
    console.log('🎵 Starting audio upload...', {
      name: audioFile.name,
      type: audioFile.type,
      size: formatFileSize(audioFile.size),
    });

    // Client-side validation
    const validation = validateAudioFile(audioFile);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Get presigned URL from Django backend (using HttpOnly cookies for auth)
    const uploadResponse = await fetch(
      `${API_BASE_URL}/practice/challenges/${challengeId}/get-audio-upload-url/`,
      {
        method: 'POST',
        credentials: 'include', // Use HttpOnly cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          fileName: audioFile.name,
          fileType: audioFile.type,
          fileSize: audioFile.size,
        }),
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      const errorMessage = errorData.error || `Falha ao obter URL de upload: ${uploadResponse.status}`;
      throw new Error(errorMessage);
    }

    const { data } = await uploadResponse.json();
    const { uploadUrl, audioUrl } = data;

    // Upload file to S3 using presigned URL with progress tracking
    if (options?.onProgress) {
      // Use XMLHttpRequest for progress events
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && options.onProgress) {
            options.onProgress({
              percent: Math.round((e.loaded / e.total) * 100),
              loaded: e.loaded,
              total: e.total,
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('✅ Audio uploaded to S3 successfully');
            resolve(audioUrl);
          } else {
            reject(new Error(`Upload para S3 falhou com status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Erro de rede durante o upload. Verifique sua conexão.'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelado.'));
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', audioFile.type);
        xhr.send(audioFile);
      });
    } else {
      // Standard fetch upload (no progress)
      const uploadToS3Response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': audioFile.type,
        },
        body: audioFile,
      });

      if (!uploadToS3Response.ok) {
        throw new Error(`Upload para S3 falhou com status: ${uploadToS3Response.status}`);
      }

      console.log('✅ Audio uploaded to S3 successfully');
      return audioUrl;
    }
  } catch (error: any) {
    console.error('❌ Audio upload failed:', error);
    throw error;
  }
};

/**
 * Upload image file to S3 using presigned URL
 * Now with validation and progress tracking
 */
export const uploadImageToS3 = async (
  imageFile: File,
  lessonId: string,
  challengeId: string,
  options?: UploadOptions
): Promise<string> => {
  try {
    console.log('🖼️ Starting image upload...', {
      name: imageFile.name,
      type: imageFile.type,
      size: formatFileSize(imageFile.size),
    });

    // Client-side validation
    const validation = validateImageFile(imageFile);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Get presigned URL from Django backend (using HttpOnly cookies for auth)
    const uploadResponse = await fetch(
      `${API_BASE_URL}/practice/challenges/${challengeId}/get-image-upload-url/`,
      {
        method: 'POST',
        credentials: 'include', // Use HttpOnly cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          fileName: imageFile.name,
          fileType: imageFile.type,
          fileSize: imageFile.size,
        }),
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      const errorMessage = errorData.error || `Falha ao obter URL de upload: ${uploadResponse.status}`;
      throw new Error(errorMessage);
    }

    const { data } = await uploadResponse.json();
    const { uploadUrl, imageUrl } = data;

    // Upload file to S3 using presigned URL with progress tracking
    if (options?.onProgress) {
      // Use XMLHttpRequest for progress events
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && options.onProgress) {
            options.onProgress({
              percent: Math.round((e.loaded / e.total) * 100),
              loaded: e.loaded,
              total: e.total,
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('✅ Image uploaded to S3 successfully');
            resolve(imageUrl);
          } else {
            reject(new Error(`Upload para S3 falhou com status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Erro de rede durante o upload. Verifique sua conexão.'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelado.'));
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', imageFile.type);
        xhr.send(imageFile);
      });
    } else {
      // Standard fetch upload (no progress)
      const uploadToS3Response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': imageFile.type,
        },
        body: imageFile,
      });

      if (!uploadToS3Response.ok) {
        throw new Error(`Upload para S3 falhou com status: ${uploadToS3Response.status}`);
      }

      console.log('✅ Image uploaded to S3 successfully');
      return imageUrl;
    }
  } catch (error: any) {
    console.error('❌ Image upload failed:', error);
    throw error;
  }
};

/**
 * Analyze pronunciation using AI with detailed feedback
 */
export const analyzePronunciationWithAI = async (payload: {
  audioFile: File;
  expectedText: string;
  challengeId?: string;
  difficultyLevel?: string;
}) => {
  try {
    console.log('🎤 Analyzing pronunciation with AI...', {
      expectedText: payload.expectedText,
      audioFile: payload.audioFile.name,
      size: formatFileSize(payload.audioFile.size),
    });

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('audio_file', payload.audioFile);
    formData.append('expected_text', payload.expectedText);
    formData.append('difficulty_level', payload.difficultyLevel || 'intermediate');
    if (payload.challengeId) {
      formData.append('challenge_id', payload.challengeId);
    }

    const response = await fetch(`${API_BASE_URL}/practice/analyze-ai-pronunciation/`, {
      method: 'POST',
      credentials: 'include', // Use HttpOnly cookies for authentication
      // Don't set Content-Type for FormData - let browser set it with boundary
      body: formData,
    });

    console.log('📡 AI pronunciation analysis response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI pronunciation analysis error:', errorText);
      throw new Error(`Análise de pronúncia falhou: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ AI pronunciation analysis successful:', result);
    return result;
  } catch (error) {
    console.error('Error analyzing pronunciation with AI:', error);
    throw error;
  }
};

/**
 * Generate reference audio for pronunciation practice
 * If saveToS3 is true, uploads to S3 and returns permanent URL
 * Otherwise returns a temporary blob URL
 */
export const generateReferenceAudio = async (payload: {
  text: string;
  voice?: string;
  saveToS3?: boolean;
  challengeId?: string;
}) => {
  try {
    console.log('🔊 Generating reference audio...', payload);

    const response = await fetch(`${API_BASE_URL}/practice/generate-reference-audio/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: payload.text,
        voice: payload.voice || 'alloy',
        save_to_s3: payload.saveToS3 || false,
        challenge_id: payload.challengeId || '',
      }),
    });

    console.log('📡 Reference audio response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Reference audio generation error:', errorText);
      throw new Error(`Geração de áudio de referência falhou: ${response.status}`);
    }

    // If saved to S3, response is JSON with URL
    if (payload.saveToS3) {
      const result = await response.json();
      console.log('✅ Reference audio saved to S3:', result.audio_url);
      return { audioUrl: result.audio_url, s3Url: result.audio_url };
    }

    // Otherwise, response is audio blob (for preview)
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    console.log('✅ Reference audio generated successfully (blob)');
    return { audioUrl, audioBlob };
  } catch (error) {
    console.error('Error generating reference audio:', error);
    throw error;
  }
};

/**
 * Generate pronunciation exercise with AI
 */
export const generatePronunciationExercise = async (payload: {
  topic?: string;
  difficultyLevel?: string;
  exerciseType?: string;
}) => {
  try {
    console.log('🎤 Generating pronunciation exercise with AI...', payload);

    const response = await fetch(`${API_BASE_URL}/practice/generate-pronunciation-exercise/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: payload.topic || 'daily conversation',
        difficulty_level: payload.difficultyLevel || 'intermediate',
        exercise_type: payload.exerciseType || 'sentence',
      }),
    });

    console.log('📡 Pronunciation exercise response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Pronunciation exercise generation error:', errorText);
      throw new Error(`Geração de exercício de pronúncia falhou: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Pronunciation exercise generated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error generating pronunciation exercise:', error);
    throw error;
  }
};

// ============================================================================
// EXPORTS FOR CONSTANTS (useful for UI display)
// ============================================================================

export const UPLOAD_LIMITS = {
  audio: {
    maxSize: MAX_AUDIO_SIZE,
    maxSizeMB: MAX_AUDIO_SIZE / (1024 * 1024),
    allowedTypes: ALLOWED_AUDIO_TYPES,
    allowedExtensions: ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac'],
  },
  image: {
    maxSize: MAX_IMAGE_SIZE,
    maxSizeMB: MAX_IMAGE_SIZE / (1024 * 1024),
    allowedTypes: ALLOWED_IMAGE_TYPES,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
  },
};
