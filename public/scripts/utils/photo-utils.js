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
    const defaultOptions = {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeMB: 2
    };
    
    const { maxWidth, maxHeight, quality, maxSizeMB } = { ...defaultOptions, ...options };
    
    // Check if file is already small enough
    if (file.size <= maxSizeMB * 1024 * 1024) {
        return file;
    }
    
    try {
        // Resize the image
        const resizedBlob = await resizeImage(file, maxWidth, maxHeight, quality);
        
        // If still too large, reduce quality further
        if (resizedBlob.size > maxSizeMB * 1024 * 1024) {
            const lowerQuality = quality * 0.8;
            return await resizeImage(file, maxWidth, maxHeight, lowerQuality);
        }
        
        return resizedBlob;
    } catch (error) {
        console.error('Error optimizing image:', error);
        return file; // Return original file if optimization fails
    }
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
