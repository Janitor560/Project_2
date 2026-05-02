import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export interface UploadResult {
  publicId: string;
  url:      string;
  width:    number;
  height:   number;
  format:   string;
}

export async function uploadImage(
  base64DataOrUrl: string,
  folder = 'awards-platform'
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(base64DataOrUrl, {
    folder,
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

  return {
    publicId: result.public_id,
    url:      result.secure_url,
    width:    result.width,
    height:   result.height,
    format:   result.format,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  return cloudinary.url(publicId, {
    ...options,
    quality: 'auto',
    fetch_format: 'auto',
    secure: true,
  });
}

export default cloudinary;
