import { supabase } from '../supabase.js';

/**
 * Storage API functions for Supabase Storage
 */

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export async function uploadFile(file, bucket, path) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      console.error('Error uploading file:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in uploadFile:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Get public URL for a file
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {string} Public URL
 */
export function getPublicUrl(bucket, path) {
  if (!supabase) {
    return null;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Upload creator avatar
 * @param {File} file - Avatar image file
 * @param {string} creatorId - Creator UUID
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export async function uploadCreatorAvatar(file, creatorId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'File must be an image' };
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'File size must be less than 5MB' };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${creatorId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase.storage
      .from('creator-avatars')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading avatar:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const publicUrl = getPublicUrl('creator-avatars', filePath);
    return { url: publicUrl, error: null };
  } catch (err) {
    console.error('Error in uploadCreatorAvatar:', err);
    return { url: null, error: err.message };
  }
}

/**
 * Upload post images
 * @param {File[]} files - Array of image files
 * @param {string} postId - Post UUID
 * @returns {Promise<{urls: string[], error: string|null}>}
 */
export async function uploadPostImages(files, postId) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const urls = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`File ${i + 1} must be an image`);
        continue;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`File ${i + 1} size must be less than 10MB`);
        continue;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${postId}-${i}-${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (error) {
        console.error(`Error uploading image ${i + 1}:`, error);
        errors.push(`Error uploading image ${i + 1}: ${error.message}`);
        continue;
      }

      // Get public URL
      const publicUrl = getPublicUrl('post-images', filePath);
      urls.push(publicUrl);
    }

    if (errors.length > 0) {
      return { urls, error: errors.join('; ') };
    }

    return { urls, error: null };
  } catch (err) {
    console.error('Error in uploadPostImages:', err);
    return { urls: [], error: err.message };
  }
}

/**
 * Delete file from storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteFile(bucket, path) {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error in deleteFile:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get file list from bucket
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder path (optional)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function listFiles(bucket, folder = '') {
  try {
    if (!supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      console.error('Error listing files:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error in listFiles:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Resize image using Supabase transformations
 * @param {string} url - Original image URL
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @param {string} quality - Image quality (default: 'auto')
 * @returns {string} Transformed image URL
 */
export function resizeImage(url, width, height, quality = 'auto') {
  if (!url) return null;
  
  // Supabase image transformations
  const transformUrl = new URL(url);
  transformUrl.searchParams.set('width', width.toString());
  transformUrl.searchParams.set('height', height.toString());
  transformUrl.searchParams.set('quality', quality);
  
  return transformUrl.toString();
}

/**
 * Get optimized image URL for different use cases
 * @param {string} url - Original image URL
 * @param {string} type - Image type ('avatar', 'thumbnail', 'full')
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(url, type) {
  if (!url) return null;

  const sizes = {
    avatar: { width: 150, height: 150, quality: 'auto' },
    thumbnail: { width: 400, height: 400, quality: 'auto' },
    full: { width: 1200, height: 1200, quality: 'auto' }
  };

  const config = sizes[type] || sizes.full;
  return resizeImage(url, config.width, config.height, config.quality);
}
