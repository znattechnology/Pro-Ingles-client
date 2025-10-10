/**
 * Resource Upload Service
 * Handles file uploads for teacher video course resources
 */

export interface ResourceUploadRequest {
  courseId: string;
  sectionId: string;
  chapterId: string;
  fileName: string;
  fileType: string;
  resourceType: string;
}

export interface ResourceUploadResponse {
  message: string;
  data: {
    uploadUrl: string;
    resourceUrl: string;
    resourceType: string;
  };
}

/**
 * Get upload URL for course resource
 */
export const getResourceUploadUrl = async (request: ResourceUploadRequest): Promise<ResourceUploadResponse> => {
  try {
    const { courseId, sectionId, chapterId, fileName, fileType, resourceType } = request;
    
    const response = await fetch(`/api/teacher/video-courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/get-resource-upload-url/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'credentials': 'include'
      },
      body: JSON.stringify({
        fileName,
        fileType,
        resourceType
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting resource upload URL:', error);
    throw error;
  }
};

/**
 * Upload file to S3 using presigned URL
 */
export const uploadFileToS3 = async (file: File, uploadUrl: string): Promise<void> => {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

/**
 * Complete resource upload process
 */
export const uploadResource = async (
  file: File, 
  request: ResourceUploadRequest
): Promise<string> => {
  try {
    // Get upload URL
    const uploadResponse = await getResourceUploadUrl(request);
    
    // Upload file to S3
    await uploadFileToS3(file, uploadResponse.data.uploadUrl);
    
    // Return the final resource URL
    return uploadResponse.data.resourceUrl;
  } catch (error) {
    console.error('Error in complete resource upload:', error);
    throw error;
  }
};