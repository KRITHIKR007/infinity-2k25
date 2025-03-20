/**
 * Utility functions for handling photos and file uploads
 */

/**
 * Resizes an image to the specified maximum width/height while maintaining aspect ratio
 * @param {File} file - The image file to resize
 * @param {number} maxWidth - The maximum width of the resized image
 * @param {number} maxHeight - The maximum height of the resized image
 * @param {number} quality - The quality of the resized image (0-1)
 * @returns {Promise<Blob>} - A promise that resolves to a Blob containing the resized image
 */
export function resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (readerEvent) => {
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                // Create canvas for resizing
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // Draw image on canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get blob from canvas
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, file.type, quality);
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            
            img.src = readerEvent.target.result;
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Optimizes an image file for upload by resizing and compressing it
 * @param {File} file - The image file to optimize
 * @param {Object} options - Options for optimization
 * @returns {Promise<Blob>} - A promise that resolves to a Blob containing the optimized image
 */
export async function optimizeImageForUpload(file, options = {}) {
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
 * Converts a data URL to a Blob
 * @param {string} dataURL - The data URL to convert
 * @returns {Blob} - The resulting Blob
 */
export function dataURLtoBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
}

/**
 * Creates a File object from a Blob
 * @param {Blob} blob - The Blob to convert
 * @param {string} fileName - The name for the resulting File
 * @returns {File} - The resulting File object
 */
export function blobToFile(blob, fileName) {
    return new File([blob], fileName, {
        type: blob.type,
        lastModified: new Date().getTime()
    });
}

/**
 * Get image dimensions from a File or Blob
 * @param {File|Blob} file - The image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height
            });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Check if a file is an image
 * @param {File} file - The file to check
 * @returns {boolean} - True if file is an image
 */
export function isImageFile(file) {
    return file && file.type && file.type.startsWith('image/');
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get a data URL from a file
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Data URL
 */
export function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Convert image from one format to another
 * @param {File} file - Original image file
 * @param {string} format - Target format (e.g., 'image/jpeg')
 * @param {number} quality - Output quality (0-1)
 * @returns {Promise<Blob>} - Converted image as Blob
 */
export async function convertImageFormat(file, format, quality = 0.8) {
    const dataUrl = await fileToDataUrl(file);
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(
                blob => resolve(blob),
                format,
                quality
            );
        };
        
        img.onerror = () => reject(new Error('Failed to load image for conversion'));
        img.src = dataUrl;
    });
}
