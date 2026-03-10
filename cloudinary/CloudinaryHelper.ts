/**
 * Cloudinary Helper for React Native
 * Handles image/file uploads to Cloudinary using unsigned upload preset
 */

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_API_KEY = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;

/**
 * Detect MIME type from file URI and filename
 */
const getMimeType = (fileUri: string, fileName?: string): string => {
  const uri = fileUri.toLowerCase();
  const name = (fileName || '').toLowerCase();

  // Check for video types
  if (uri.includes('.mp4') || name.includes('.mp4')) return 'video/mp4';
  if (uri.includes('.mov') || name.includes('.mov')) return 'video/quicktime';
  if (uri.includes('.avi') || name.includes('.avi')) return 'video/x-msvideo';
  if (uri.includes('.mkv') || name.includes('.mkv')) return 'video/x-matroska';
  if (uri.includes('.webm') || name.includes('.webm')) return 'video/webm';

  // Check for image types
  if (uri.includes('.jpg') || uri.includes('.jpeg') || name.includes('.jpg') || name.includes('.jpeg')) return 'image/jpeg';
  if (uri.includes('.png') || name.includes('.png')) return 'image/png';
  if (uri.includes('.gif') || name.includes('.gif')) return 'image/gif';
  if (uri.includes('.webp') || name.includes('.webp')) return 'image/webp';

  // Check for document types
  if (uri.includes('.pdf') || name.includes('.pdf')) return 'application/pdf';
  if (uri.includes('.doc') || name.includes('.doc')) return 'application/msword';
  if (uri.includes('.docx') || name.includes('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (uri.includes('.xls') || name.includes('.xls')) return 'application/vnd.ms-excel';
  if (uri.includes('.xlsx') || name.includes('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  // Default to generic binary
  return 'application/octet-stream';
};

/**
 * Determine resource type for Cloudinary based on MIME type
 */
const getResourceType = (mimeType: string): 'image' | 'video' | 'raw' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'raw'; // For PDFs, documents, etc.
};

/**
 * Upload a file to Cloudinary
 * @param file - The file blob or URI to upload
 * @param folder - Optional folder path in Cloudinary (e.g., "products/companyId")
 * @param filename - Optional custom filename
 * @returns Promise with the secure URL of the uploaded file
 */
export const uploadFileToCloudinary = async (
  fileUri: string,
  folder?: string,
  filename?: string
): Promise<string> => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary configuration is missing. Check your .env file.");
    }

    console.log("📤 Starting Cloudinary upload...");
    console.log("Cloud Name:", CLOUDINARY_CLOUD_NAME);
    console.log("Upload Preset:", CLOUDINARY_UPLOAD_PRESET);
    console.log("File URI:", fileUri);

    const formData = new FormData();

    // For React Native, we need to use the proper file format
    const fileExtension = fileUri.split('.').pop() || 'jpg';
    const fileName = filename || `upload_${Date.now()}.${fileExtension}`;

    // Detect MIME type
    const mimeType = getMimeType(fileUri, fileName);
    const resourceType = getResourceType(mimeType);

    console.log("📄 File type:", mimeType, "| Resource type:", resourceType);

    // React Native FormData requires this specific format
    formData.append("file", {
      uri: fileUri,
      type: mimeType,
      name: fileName,
    } as any);

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    if (folder) {
      formData.append("folder", folder);
    }

    // Use the appropriate endpoint based on resource type
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    console.log("📡 Uploading to:", uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Upload failed:", errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }
      throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Upload successful:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("❌ Error uploading file to Cloudinary:", error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * Note: Requires signed requests with API secret, typically done on backend
 * For now, this is a placeholder - consider implementing server-side deletion
 *
 * @param publicId - The public_id of the file to delete
 */
export const deleteFileFromCloudinary = async (publicId: string): Promise<void> => {
  console.warn(
    "Delete operation should be handled server-side with API secret for security"
  );
  // For client-side deletion, you would need to implement a backend endpoint
  // that uses the Cloudinary Admin API with your API secret
  throw new Error("Delete operation must be implemented server-side");
};

/**
 * Get optimized image URL with transformations
 * @param url - Original Cloudinary URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Transformed URL
 */
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  if (!url.includes("cloudinary.com")) {
    return url;
  }

  // Extract the base URL and public_id
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const baseUrl = url.substring(0, uploadIndex + 8);
  const publicPath = url.substring(uploadIndex + 8);

  // Build transformation string
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push("f_auto"); // Auto format selection

  const transformString = transformations.join(",");

  return `${baseUrl}${transformString}/${publicPath}`;
};

/**
 * Extract public_id from Cloudinary URL
 * Useful for deletion or further transformations
 * @param url - Cloudinary URL
 * @returns public_id or null if invalid URL
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let publicPath = url.substring(uploadIndex + 8);

    // Remove transformations if present
    const versionIndex = publicPath.indexOf("/v");
    if (versionIndex !== -1) {
      publicPath = publicPath.substring(versionIndex);
    }

    // Remove file extension
    const publicId = publicPath.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};
