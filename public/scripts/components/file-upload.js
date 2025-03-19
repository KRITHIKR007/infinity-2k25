/**
 * File Upload Preview Component
 * Creates a nice file upload experience with preview capability
 */
export class FileUpload {
    constructor(inputElement, previewContainer, options = {}) {
        // Store references to DOM elements
        this.input = typeof inputElement === 'string' ? document.getElementById(inputElement) : inputElement;
        this.previewContainer = typeof previewContainer === 'string' ? document.getElementById(previewContainer) : previewContainer;
        
        // Set default options
        this.options = {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
            previewWidth: 200,
            previewHeight: 200,
            showFileName: true,
            showFileSize: true,
            ...options
        };
        
        // Initialize the component
        this.initialize();
    }
    
    initialize() {
        if (!this.input || !this.previewContainer) {
            console.error('Input element or preview container not found');
            return;
        }
        
        // Set accept attribute on input if not already set
        if (!this.input.hasAttribute('accept')) {
            this.input.setAttribute('accept', this.options.acceptedTypes.join(','));
        }
        
        // Add change event listener
        this.input.addEventListener('change', (e) => this.handleFileChange(e));
        
        // Add drag and drop functionality
        this.setupDragAndDrop();
        
        // Clear existing content
        this.previewContainer.innerHTML = '';
        
        // Add base styling
        this.previewContainer.classList.add('file-upload-preview');
        
        // Initial state - placeholder
        this.renderPlaceholder();
    }
    
    setupDragAndDrop() {
        // Add event listeners for drag and drop
        this.previewContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.previewContainer.classList.add('drag-over');
        });
        
        this.previewContainer.addEventListener('dragleave', () => {
            this.previewContainer.classList.remove('drag-over');
        });
        
        this.previewContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            this.previewContainer.classList.remove('drag-over');
            
            // Check if files were dropped
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                // Update the file input value
                this.input.files = e.dataTransfer.files;
                this.handleFileChange({ target: this.input });
            }
        });
        
        // Make the preview container clickable to open file dialog
        this.previewContainer.addEventListener('click', () => {
            if (!this.input.disabled) {
                this.input.click();
            }
        });
    }
    
    renderPlaceholder() {
        this.previewContainer.innerHTML = `
            <div class="file-upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop your payment proof here<br>or click to browse</p>
                <p class="file-upload-hint">Maximum file size: ${this.formatFileSize(this.options.maxFileSize)}</p>
            </div>
        `;
    }
    
    handleFileChange(event) {
        const file = event.target.files[0];
        
        if (!file) {
            this.renderPlaceholder();
            return;
        }
        
        // Validate file type
        if (!this.options.acceptedTypes.includes(file.type)) {
            this.showError(`Invalid file type. Please upload ${this.options.acceptedTypes.map(t => t.replace('image/', '')).join(', ')}`);
            this.input.value = '';
            return;
        }
        
        // Validate file size
        if (file.size > this.options.maxFileSize) {
            this.showError(`File is too large. Maximum size is ${this.formatFileSize(this.options.maxFileSize)}`);
            this.input.value = '';
            return;
        }
        
        // File is valid, create preview
        this.createPreview(file);
    }
    
    createPreview(file) {
        // Clear container
        this.previewContainer.innerHTML = '';
        
        // Create preview wrapper
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'file-upload-preview-wrapper';
        
        // Create image preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const previewImage = document.createElement('img');
                previewImage.className = 'file-upload-image';
                previewImage.src = e.target.result;
                previewImage.alt = file.name;
                previewWrapper.appendChild(previewImage);
                
                // Add file info if needed
                if (this.options.showFileName || this.options.showFileSize) {
                    const fileInfo = document.createElement('div');
                    fileInfo.className = 'file-upload-info';
                    
                    if (this.options.showFileName) {
                        const fileName = document.createElement('div');
                        fileName.className = 'file-upload-name';
                        fileName.textContent = file.name;
                        fileInfo.appendChild(fileName);
                    }
                    
                    if (this.options.showFileSize) {
                        const fileSize = document.createElement('div');
                        fileSize.className = 'file-upload-size';
                        fileSize.textContent = this.formatFileSize(file.size);
                        fileInfo.appendChild(fileSize);
                    }
                    
                    previewWrapper.appendChild(fileInfo);
                }
                
                // Add remove button
                const removeButton = document.createElement('button');
                removeButton.className = 'file-upload-remove';
                removeButton.innerHTML = '<i class="fas fa-times"></i>';
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent opening file dialog
                    this.clearPreview();
                });
                previewWrapper.appendChild(removeButton);
            };
            
            reader.readAsDataURL(file);
        } else {
            // For non-image files (shouldn't happen with our validation, but just in case)
            const fileIcon = document.createElement('div');
            fileIcon.className = 'file-upload-icon';
            fileIcon.innerHTML = '<i class="fas fa-file"></i>';
            previewWrapper.appendChild(fileIcon);
            
            const fileName = document.createElement('div');
            fileName.className = 'file-upload-name';
            fileName.textContent = file.name;
            previewWrapper.appendChild(fileName);
            
            const fileSize = document.createElement('div');
            fileSize.className = 'file-upload-size';
            fileSize.textContent = this.formatFileSize(file.size);
            previewWrapper.appendChild(fileSize);
        }
        
        // Add preview wrapper to container
        this.previewContainer.appendChild(previewWrapper);
    }
    
    clearPreview() {
        // Clear the file input
        this.input.value = '';
        
        // Render placeholder again
        this.renderPlaceholder();
    }
    
    showError(message) {
        // Clear container first
        this.previewContainer.innerHTML = '';
        
        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'file-upload-error';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button class="file-upload-try-again">Try Again</button>
        `;
        
        // Add click handler for try again button
        errorElement.querySelector('.file-upload-try-again').addEventListener('click', () => {
            this.renderPlaceholder();
        });
        
        this.previewContainer.appendChild(errorElement);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Get the selected file
    getFile() {
        return this.input.files[0] || null;
    }
}

// Add CSS styles to the document
const style = document.createElement('style');
style.textContent = `
    .file-upload-preview {
        width: 100%;
        min-height: 200px;
        border: 2px dashed rgba(147, 51, 234, 0.4);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        background-color: rgba(31, 41, 55, 0.4);
    }
    
    .file-upload-preview:hover {
        border-color: rgba(147, 51, 234, 0.8);
        background-color: rgba(31, 41, 55, 0.6);
    }
    
    .file-upload-preview.drag-over {
        border-color: rgba(147, 51, 234, 1);
        background-color: rgba(147, 51, 234, 0.1);
    }
    
    .file-upload-placeholder {
        text-align: center;
        padding: 20px;
        color: #9ca3af;
    }
    
    .file-upload-placeholder i {
        font-size: 3rem;
        margin-bottom: 10px;
        color: rgba(147, 51, 234, 0.6);
    }
    
    .file-upload-placeholder p {
        margin: 5px 0;
    }
    
    .file-upload-hint {
        font-size: 0.75rem;
        opacity: 0.7;
    }
    
    .file-upload-preview-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    
    .file-upload-image {
        max-width: 100%;
        max-height: 160px;
        object-fit: contain;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .file-upload-info {
        margin-top: 10px;
        text-align: center;
        color: #d1d5db;
    }
    
    .file-upload-name {
        font-weight: 500;
        margin-bottom: 2px;
        word-break: break-all;
        max-width: 100%;
    }
    
    .file-upload-size {
        font-size: 0.75rem;
        color: #9ca3af;
    }
    
    .file-upload-remove {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: rgba(239, 68, 68, 0.8);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        font-size: 12px;
    }
    
    .file-upload-remove:hover {
        background-color: rgba(239, 68, 68, 1);
    }
    
    .file-upload-error {
        text-align: center;
        color: #ef4444;
        padding: 20px;
    }
    
    .file-upload-error i {
        font-size: 2rem;
        margin-bottom: 10px;
    }
    
    .file-upload-error p {
        margin-bottom: 15px;
    }
    
    .file-upload-try-again {
        background-color: #ef4444;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 15px;
        cursor: pointer;
        font-size: 0.875rem;
    }
    
    .file-upload-try-again:hover {
        background-color: #dc2626;
    }
`;
document.head.appendChild(style);
