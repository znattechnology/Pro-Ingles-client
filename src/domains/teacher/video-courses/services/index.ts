/**
 * Teacher Video Courses Services
 * Service layer for teacher video course operations
 */

// Resource upload services
export {
  getResourceUploadUrl,
  uploadFileToS3,
  uploadResource,
  type ResourceUploadRequest,
  type ResourceUploadResponse
} from './resourceUploadService';