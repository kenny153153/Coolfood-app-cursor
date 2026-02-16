import { supabase } from './supabaseClient';

const BUCKET = 'media';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

/**
 * Compress an image file using canvas. Returns a WebP Blob (or PNG for
 * transparency) capped at `maxWidth` pixels on the longest side.
 */
export async function compressImage(file: File, maxWidth = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/webp',
        0.85
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/** Validate file type and size. Throws on failure. */
function validateFile(file: File): void {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (!isImage && !isVideo) {
    throw new Error(`不支援的檔案類型: ${file.type}。支援 JPEG, PNG, WebP, GIF, MP4, WebM`);
  }
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    throw new Error(`圖片檔案過大 (${(file.size / 1024 / 1024).toFixed(1)} MB)，上限 5 MB`);
  }
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new Error(`影片檔案過大 (${(file.size / 1024 / 1024).toFixed(1)} MB)，上限 50 MB`);
  }
}

/** True if the string looks like an image/video URL (http, data, blob). */
export function isMediaUrl(s?: string | null): boolean {
  if (!s) return false;
  return s.startsWith('http') || s.startsWith('data') || s.startsWith('blob');
}

/**
 * Extract the Supabase Storage path from a public URL so it can be deleted.
 * Returns null if the URL is not from our bucket.
 */
export function getStoragePath(url: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

/**
 * Upload a single file to Supabase Storage. Images are compressed first.
 * @param file   The file to upload.
 * @param path   Target path inside the bucket, e.g. `products/P-001/main.webp`.
 * @returns      The public URL of the uploaded file.
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  validateFile(file);

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  let uploadData: Blob | File = file;
  let finalPath = path;

  if (isImage) {
    uploadData = await compressImage(file);
    if (!finalPath.endsWith('.webp')) {
      finalPath = finalPath.replace(/\.[^.]+$/, '.webp');
    }
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(finalPath, uploadData, {
      cacheControl: '3600',
      upsert: true,
      contentType: isImage ? 'image/webp' : file.type,
    });

  if (error) throw new Error(`上傳失敗: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(finalPath);

  return urlData.publicUrl;
}

/**
 * Upload multiple files in parallel.
 * @param files     Array of files.
 * @param basePath  Base directory, e.g. `products/P-001/gallery`.
 * @returns         Array of public URLs in the same order.
 */
export async function uploadImages(files: File[], basePath: string): Promise<string[]> {
  const promises = files.map((file, i) => {
    const ext = ALLOWED_IMAGE_TYPES.includes(file.type) ? 'webp' : file.name.split('.').pop() || 'bin';
    const path = `${basePath}/${Date.now()}-${i}.${ext}`;
    return uploadImage(file, path);
  });
  return Promise.all(promises);
}

/**
 * Delete a file from Supabase Storage by its public URL.
 */
export async function deleteImage(url: string): Promise<void> {
  const path = getStoragePath(url);
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn('刪除圖片失敗:', error.message);
}

/**
 * Delete multiple files by their public URLs.
 */
export async function deleteImages(urls: string[]): Promise<void> {
  const paths = urls.map(getStoragePath).filter(Boolean) as string[];
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.warn('批量刪除圖片失敗:', error.message);
}
