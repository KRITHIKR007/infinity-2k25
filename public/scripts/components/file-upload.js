/**
 * FileUpload - A reusable component for handling file uploads
 * with validation, drag and drop support, and preview capabilities
 */
export class FileUpload {
    constructor(inputElement, containerElement, options = {}) {
        this.input = inputElement;
        this.container = containerElement;
        this.options = {
            maxFileSize: options.maxFileSize || 2 * 1024 * 1024, // Default 2MB
            acceptedTypes: options.acceptedTypes || ['image/jpeg', 'image/png'],
            showFileName: options.showFileName !== undefined ? options.showFileName : true,
            showFileSize: options.showFileSize !== undefined ? options.showFileSize : true,
            showPreview: options.showPreview !== undefined ? options.showPreview : false,
            previewClass: options.previewClass || ''
        };
        
        this.file = null;
        this.fileInfo = null;
        this.preview = null;
        
        this.setupListeners();
        this.createUI();
    }
    
    setupListeners() {
        this.input.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Setup drag and drop
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        
        // Setup click to select
        this.container.addEventListener('click', () => {
            if (!this.file) {
                this.input.click();
            }
        });
    }
    
    createUI() {
        // Clear container
        this.container.innerHTML = '';
        
        // Add classes to container
        this.container.classList.add('border-2', 'border-dashed', 'border-gray-700', 'rounded-lg', 'p-4', 'text-center', 'cursor-pointer', 'transition-all');
        
        // Create instruction text
        const instructions = document.createElement('div');
        instructions.innerHTML = `
            <div class="text-gray-400 mb-2">
                <i class="fas fa-cloud-upload-alt text-2xl"></i>
            </div>
            <p class="text-gray-300">Drag & drop your payment proof here or <span class="text-purple-400">browse</span></p>
            <p class="text-gray-400 text-sm mt-1">Supported formats: ${this.options.acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} (Max ${this.formatFileSize(this.options.maxFileSize)})</p>
        `;
        this.container.appendChild(instructions);
        
        // Create file info element (initially hidden)
        this.fileInfo = document.createElement('div');
        this.fileInfo.className = 'mt-2 hidden';
        this.container.appendChild(this.fileInfo);
        
        // Create preview element if enabled
        if (this.options.showPreview) {
            this.preview = document.createElement('img');
            this.preview.className = this.options.previewClass + ' hidden';
            this.container.appendChild(this.preview);
        }
    }
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.validateAndProcessFile(file);
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.container.classList.add('border-purple-500', 'bg-purple-900/20');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.container.classList.remove('border-purple-500', 'bg-purple-900/20');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.container.classList.remove('border-purple-500', 'bg-purple-900/20');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            this.validateAndProcessFile(file);
        }
    }
    
    validateAndProcessFile(file) {
        // Check file type
        if (!this.options.acceptedTypes.includes(file.type)) {
            this.showError(`Invalid file type. Please upload ${this.options.acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`);
            return;
        }
        
        // Check file size
        if (file.size > this.options.maxFileSize) {
            const maxSizeMB = this.options.maxFileSize / (1024 * 1024);
            this.showError(`File is too large. Maximum size is ${maxSizeMB}MB`);
            return;
        }
        
        // File is valid
        this.file = file;
        this.updateUI();
        
        // Clear any previous error
        const errorMsg = document.getElementById('paymentProofError');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
    
    updateUI() {
        // Update container styling
        this.container.classList.add('border-purple-500');
        this.container.classList.remove('border-dashed');
        
        // Update file info
        if (this.options.showFileName || this.options.showFileSize) {
            this.fileInfo.classList.remove('hidden');
            this.fileInfo.innerHTML = '';
            
            const fileDetails = document.createElement('div');
            fileDetails.className = 'flex items-center justify-between bg-gray-800 p-2 rounded';
            
            const leftSide = document.createElement('div');
            leftSide.className = 'flex items-center';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-file-image text-purple-400 mr-2';
            leftSide.appendChild(icon);
            
            const textInfo = document.createElement('div');
            if (this.options.showFileName) {
                const fileName = document.createElement('p');
                fileName.className = 'text-gray-200 text-sm font-medium';
                fileName.textContent = this.file.name;
                textInfo.appendChild(fileName);
            }
            
            if (this.options.showFileSize) {
                const fileSize = document.createElement('p');
                fileSize.className = 'text-gray-400 text-xs';
                fileSize.textContent = this.formatFileSize(this.file.size);
                textInfo.appendChild(fileSize);
            }
            
            leftSide.appendChild(textInfo);
            fileDetails.appendChild(leftSide);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'text-gray-400 hover:text-red-400';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile();
            });
            
            fileDetails.appendChild(removeBtn);
            this.fileInfo.appendChild(fileDetails);
        }
        
        // Update preview if enabled
        if (this.options.showPreview && this.preview) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.preview.src = e.target.result;
                this.preview.classList.remove('hidden');
            };
            reader.readAsDataURL(this.file);
        }
        
        // Add success animation
        this.container.classList.add('upload-success');
        setTimeout(() => {
            this.container.classList.remove('upload-success');
        }, 500);
    }
    
    removeFile() {
        this.file = null;
        this.input.value = '';
        
        // Reset UI
        this.createUI();
        this.container.classList.add('border-dashed');
        this.container.classList.remove('border-purple-500');
    }
    
    showError(message) {
        // Remove file
        this.removeFile();
        
        // Create or update error message
        let errorMsg = document.getElementById('paymentProofError');
        if (!errorMsg) {
            errorMsg = document.createElement('p');
            errorMsg.id = 'paymentProofError';
            errorMsg.className = 'text-red-400 text-sm mt-1';
            this.container.parentNode.appendChild(errorMsg);
        }
        
        errorMsg.textContent = message;
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
    }
    
    hasFile() {
        return !!this.file;
    }
    
    getFile() {
        return this.file;
    }
    
    clearPreview() {
        this.removeFile();
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
