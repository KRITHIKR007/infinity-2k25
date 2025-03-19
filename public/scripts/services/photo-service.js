import { optimizeImageForUpload, blobToFile } from '../utils/photo-utils.js';
import { supabase } from '../../../supabase.js';

/**
 * Service for handling photo uploads and processing
 */
export class PhotoService {
    /**
     * Upload a photo to Supabase storage
     * @param {File} file - The file to upload
     * @param {string} bucket - The storage bucket name
     * @param {string} folderPath - The folder path within the bucket
     * @param {boolean} optimize - Whether to optimize the image before uploading
     * @returns {Promise<{success: boolean, url: string, error: string}>} - Result of the upload
     */
    static async uploadPhoto(file, bucket, folderPath = '', optimize = true) {
        try {
            // Generate a unique file path
            const timestamp = new Date().getTime();
            const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const filePath = `${folderPath ? folderPath + '/' : ''}${timestamp}-${sanitizedFilename}`;
            
            // Optimize the image if required
            let fileToUpload = file;
            if (optimize && file.type.startsWith('image/')) {
                const optimizedBlob = await optimizeImageForUpload(file, {
                    maxWidth: 1600,
                    maxHeight: 1600,
                    quality: 0.85,
                    maxSizeMB: 2
                });
                
                fileToUpload = blobToFile(optimizedBlob, sanitizedFilename);
            }
            
            // Upload to Supabase storage
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, fileToUpload, {
                    cacheControl: '3600',
                    upsert: false
                });
                
            if (error) throw error;
            
            // Get the public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
                
            return {
                success: true,
                url: urlData.publicUrl,
                path: filePath
            };
            
        } catch (error) {
            console.error('Error uploading photo:', error);
            return {
                success: false,
                error: error.message || 'Failed to upload photo'
            };
        }
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
}
