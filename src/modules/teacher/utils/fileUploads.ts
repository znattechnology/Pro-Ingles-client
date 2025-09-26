/**
 * File upload utilities for Teacher Practice Management
 * 
 * These utilities handle file uploads that can't be easily done through RTK Query
 */

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1';

/**
 * Upload audio file to S3 using presigned URL
 */
export const uploadAudioToS3 = async (audioFile: File, lessonId: string, challengeId: string): Promise<string> => {
  try {
    console.log('🎵 Starting audio upload...', { audioFile: audioFile.name });
    
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    // Get presigned URL from Django backend
    const uploadResponse = await fetch(`${API_BASE_URL}/practice/challenges/${challengeId}/get-audio-upload-url/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lessonId,
        fileName: audioFile.name,
        fileType: audioFile.type
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to get audio upload URL: ${uploadResponse.status}`);
    }

    const { data } = await uploadResponse.json();
    const { uploadUrl, audioUrl } = data;

    // Upload file to S3 using presigned URL
    const uploadToS3Response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': audioFile.type,
      },
      body: audioFile,
    });

    if (!uploadToS3Response.ok) {
      throw new Error(`Upload failed with status: ${uploadToS3Response.status}`);
    }

    console.log('✅ Audio uploaded to S3 successfully');
    return audioUrl;
  } catch (error: any) {
    console.error('❌ Audio upload failed:', error);
    throw error;
  }
};

/**
 * Upload image file to S3 using presigned URL
 */
export const uploadImageToS3 = async (imageFile: File, lessonId: string, challengeId: string): Promise<string> => {
  try {
    console.log('🖼️ Starting image upload...', { imageFile: imageFile.name });
    
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    // Get presigned URL from Django backend
    const uploadResponse = await fetch(`${API_BASE_URL}/practice/challenges/${challengeId}/get-image-upload-url/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lessonId,
        fileName: imageFile.name,
        fileType: imageFile.type
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to get image upload URL: ${uploadResponse.status}`);
    }

    const { data } = await uploadResponse.json();
    const { uploadUrl, imageUrl } = data;

    // Upload file to S3 using presigned URL
    const uploadToS3Response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': imageFile.type,
      },
      body: imageFile,
    });

    if (!uploadToS3Response.ok) {
      throw new Error(`Upload failed with status: ${uploadToS3Response.status}`);
    }

    console.log('✅ Image uploaded to S3 successfully');
    return imageUrl;
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
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    console.log('🎤 Analyzing pronunciation with AI...', {
      expectedText: payload.expectedText,
      audioFile: payload.audioFile.name,
      size: payload.audioFile.size
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
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: formData,
    });

    console.log('📡 AI pronunciation analysis response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI pronunciation analysis error:', errorText);
      throw new Error(`AI pronunciation analysis failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ AI pronunciation analysis successful:', result);
    return result;
  } catch (error) {
    console.error("Error analyzing pronunciation with AI:", error);
    throw error;
  }
};

/**
 * Generate reference audio for pronunciation practice
 */
export const generateReferenceAudio = async (payload: {
  text: string;
  voice?: string;
}) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    console.log('🔊 Generating reference audio...', payload);

    const response = await fetch(`${API_BASE_URL}/practice/generate-reference-audio/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: payload.text,
        voice: payload.voice || 'alloy'
      }),
    });

    console.log('📡 Reference audio response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Reference audio generation error:', errorText);
      throw new Error(`Reference audio generation failed: ${response.status}`);
    }

    // Response is audio blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('✅ Reference audio generated successfully');
    return { audioUrl, audioBlob };
  } catch (error) {
    console.error("Error generating reference audio:", error);
    throw error;
  }
};