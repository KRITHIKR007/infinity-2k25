import { optimizeImageForUpload, blobToFile } from '../utils/photo-utils.js';
import { supabase } from '../../../supabase.js';

/**
 * Service for handling photo uploads and optimization
 */
export class PhotoService {
    /**
     * Upload a photo to Supabase storage
     * @param {File} file - The file to upload
     * @param {string} bucket - The storage bucket name
     * @param {string} folder - The folder path within the bucket
     * @param {boolean} optimize - Whether to optimize the image before upload
     * @returns {Promise<Object>} - Result of the upload operation
     */
    static async uploadPhoto(file, bucket, folder, optimize = false) {
        try {
            if (!file) {
                throw new Error('No file selected');
            }

            let fileToUpload = file;
            
            // Optimize image if requested
            if (optimize && file.type.startsWith('image/')) {
                fileToUpload = await this.optimizeImage(file);
            }
            
            // Create a unique file path
            const timestamp = new Date().getTime();
            const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const filePath = `${folder}/${timestamp}-${sanitizedFilename}`;
            
            // Upload file to Supabase
            const supabase = window.supabaseConfig.initSupabase();
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, fileToUpload, {
                    cacheControl: '3600',
                    upsert: false
                });
                
            if (error) throw error;
            
            // Get public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
                
            return {
                success: true,
                path: filePath,
                url: urlData.publicUrl
            };
        } catch (error) {
            console.error('Error in photo upload:', error);
            return {
                success: false,
                error: error.message || 'Failed to upload photo'
            };
        }
    }
    
    /**
     * Optimize an image file before upload
     * @param {File} file - The image file to optimize
     * @returns {Promise<Blob>} - Optimized image blob
     */
    static async optimizeImage(file) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                img.onload = () => {
                    // Calculate new dimensions (max 1200px width/height)
                    let width = img.width;
                    let height = img.height;
                    const maxDimension = 1200;
                    
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round(height * (maxDimension / width));
                            width = maxDimension;
                        } else {
                            width = Math.round(width * (maxDimension / height));
                            height = maxDimension;
                        }
                    }
                    
                    // Set canvas dimensions
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw image on canvas
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            resolve(blob);
                        }, 
                        file.type, 
                        0.85 // quality
                    );
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load image for optimization'));
                };
                
                // Load image from file
                img.src = URL.createObjectURL(file);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Delete a photo from Supabase storage
     * @param {string} path - The file path to delete
     * @param {string} bucket - The storage bucket name
     * @returns {Promise<{success: boolean, error: string}>} - Result of the deletion
     */
    static async deletePhoto(path, bucket) {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .remove([path]);
                
            if (error) throw error;
            
            return { success: true };
            
        } catch (error) {
            console.error('Error deleting photo:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete photo'
            };
        }
    }
    
    /**
     * Get the public URL for a file in Supabase storage
     * @param {string} path - The file path
     * @param {string} bucket - The storage bucket name
     * @returns {string} - The public URL
     */
    static getPhotoUrl(path, bucket) {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);
            
        return data?.publicUrl || null;
    }

    /**
     * List files in a storage bucket folder
     * @param {string} bucket - The storage bucket name
     * @param {string} folderPath - The folder path to list
     * @returns {Promise<Array>} - Array of file objects
     */
    static async listFiles(bucket, folderPath = '') {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .list(folderPath);
                
            if (error) throw error;
            
            return {
                success: true,
                files: data
            };
        } catch (error) {
            console.error('Error listing files:', error);
            return {
                success: false,
                error: error.message || 'Failed to list files'
            };
        }
    }
}

/**
 * Optimize an image before uploading
 * @param {File} file - Original image file
 * @param {Object} options - Optimization options
 * @returns {Promise<Blob>} - Optimized image as Blob
 */
async function optimizeImageForUpload(file, options = {}) {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.8, maxSizeMB = 1 } = options;
    
    return new Promise((resolve, reject) => {
        // Create an image element to load the file
        const img = new Image();
        img.onload = () => {
            // Calculate new dimensions maintaining aspect ratio
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = Math.round(height * (maxWidth / width));
                width = maxWidth;
            }
            
            if (height > maxHeight) {
                width = Math.round(width * (maxHeight / height));
                height = maxHeight;
            }
            
            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // Draw image on canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with quality setting
            canvas.toBlob(
                blob => resolve(blob),
                file.type,
                quality
            );
        };
        
        img.onerror = () => reject(new Error('Failed to load image for optimization'));
        
        // Load image from file
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Convert a Blob to a File object
 * @param {Blob} blob - The blob to convert
 * @param {string} filename - The filename to use
 * @returns {File} - A File object
 */
function blobToFile(blob, filename) {
    return new File([blob], filename, {
        type: blob.type,
        lastModified: new Date().getTime()
    });
}

// Export helper functions
export { optimizeImageForUpload, blobToFile };
