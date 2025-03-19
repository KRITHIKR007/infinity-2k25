import { supabase } from '../../../supabase.js';

/**
 * Photo Viewer Component
 * Used to display payment proofs and other images
 */
export class PhotoViewer {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            bucketName: 'payment_proofs',
            defaultImage: '../public/images/default-placeholder.png',
            fullScreenEnabled: true,
            ...options
        };
        
        this.initialize();
    }
    
    initialize() {
        // Create main container if it doesn't exist
        if (!this.container) {
            console.error('Container not found');
            return;
        }
        
        // Add base styles
        this.container.classList.add('photo-viewer');
        
        // Create the image container
        this.imageContainer = document.createElement('div');
        this.imageContainer.className = 'photo-viewer-image-container';
        this.container.appendChild(this.imageContainer);
        
        // Create the image element
        this.imageElement = document.createElement('img');
        this.imageElement.className = 'photo-viewer-image';
        this.imageElement.alt = 'Payment Proof';
        this.imageElement.src = this.options.defaultImage;
        this.imageContainer.appendChild(this.imageElement);
        
        // Add controls if needed
        if (this.options.fullScreenEnabled) {
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'photo-viewer-controls';
            
            // Full screen button
            const fullScreenBtn = document.createElement('button');
            fullScreenBtn.className = 'photo-viewer-btn';
            fullScreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            fullScreenBtn.addEventListener('click', () => this.openFullScreen());
            controlsContainer.appendChild(fullScreenBtn);
            
            this.container.appendChild(controlsContainer);
        }
    }
    
    /**
     * Load an image from a URL
     * @param {string} url - The URL of the image to load
     */
    loadImage(url) {
        if (!url) {
            this.imageElement.src = this.options.defaultImage;
            return;
        }
        
        // Show loading state
        this.imageElement.classList.add('loading');
        
        // Create a new image to preload
        const img = new Image();
        img.onload = () => {
            this.imageElement.src = url;
            this.imageElement.classList.remove('loading');
        };
        img.onerror = () => {
            console.error('Failed to load image:', url);
            this.imageElement.src = this.options.defaultImage;
            this.imageElement.classList.remove('loading');
        };
        
        // Start loading the image
        img.src = url;
    }
    
    /**
     * Load an image from Supabase storage
     * @param {string} path - The path to the image in storage
     */
    async loadFromStorage(path) {
        try {
            if (!path) {
                this.loadImage(this.options.defaultImage);
                return;
            }
            
            const { data } = supabase.storage
                .from(this.options.bucketName)
                .getPublicUrl(path);
                
            if (data && data.publicUrl) {
                this.loadImage(data.publicUrl);
            } else {
                this.loadImage(this.options.defaultImage);
            }
        } catch (error) {
            console.error('Error loading image from storage:', error);
            this.loadImage(this.options.defaultImage);
        }
    }
    
    /**
     * Open the image in full screen mode
     */
    openFullScreen() {
        const fullScreenContainer = document.createElement('div');
        fullScreenContainer.className = 'photo-viewer-fullscreen';
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'photo-viewer-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(fullScreenContainer);
        });
        
        // Create full screen image
        const fullScreenImage = document.createElement('img');
        fullScreenImage.src = this.imageElement.src;
        fullScreenImage.alt = 'Full Screen Image';
        fullScreenImage.className = 'photo-viewer-fullscreen-image';
        
        // Add elements to container
        fullScreenContainer.appendChild(closeBtn);
        fullScreenContainer.appendChild(fullScreenImage);
        
        // Add to body
        document.body.appendChild(fullScreenContainer);
    }
}

// Add CSS styles to the document
const style = document.createElement('style');
style.textContent = `
.photo-viewer {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    background-color: rgba(31, 41, 55, 0.5);
}

.photo-viewer-image-container {
    width: 100%;
    aspect-ratio: 4/3;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.photo-viewer-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: opacity 0.3s ease;
}

.photo-viewer-image.loading {
    opacity: 0.5;
}

.photo-viewer-controls {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    gap: 8px;
}

.photo-viewer-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: rgba(31, 41, 55, 0.7);
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
}

.photo-viewer-btn:hover {
    background-color: rgba(147, 51, 234, 0.7);
}

.photo-viewer-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.photo-viewer-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(31, 41, 55, 0.7);
    color: white;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.photo-viewer-fullscreen-image {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
}
`;
document.head.appendChild(style);
