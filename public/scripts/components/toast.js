/**
 * Toast Notification Component
 * A reusable component for showing toast notifications
 */
export class Toast {
    /**
     * Create a new Toast instance
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Default options
        this.options = {
            position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
            duration: 5000,        // Duration in ms
            maxVisible: 5,         // Maximum visible toasts
            closable: true,        // Show close button
            container: null,       // Custom container element
            // Animation
            animationIn: 'fade-in slide-in-right',
            animationOut: 'fade-out slide-out-right',
            ...options
        };
        
        // Create container if not exists
        this.container = this.options.container || this._createContainer();
        
        // Active toasts
        this.activeToasts = [];
        
        // Add CSS styles
        this._addStyles();
    }
    
    /**
     * Show a success toast notification
     * @param {string} message - The notification message
     * @param {Object} options - Additional options for this specific toast
     * @returns {HTMLElement} - The toast element
     */
    success(message, options = {}) {
        return this._showToast(message, {
            icon: 'check-circle',
            className: 'success',
            ...options
        });
    }
    
    /**
     * Show an error toast notification
     * @param {string} message - The notification message
     * @param {Object} options - Additional options for this specific toast
     * @returns {HTMLElement} - The toast element
     */
    error(message, options = {}) {
        return this._showToast(message, {
            icon: 'exclamation-circle',
            className: 'error',
            ...options
        });
    }
    
    /**
     * Show a warning toast notification
     * @param {string} message - The notification message
     * @param {Object} options - Additional options for this specific toast
     * @returns {HTMLElement} - The toast element
     */
    warning(message, options = {}) {
        return this._showToast(message, {
            icon: 'exclamation-triangle',
            className: 'warning',
            ...options
        });
    }
    
    /**
     * Show an info toast notification
     * @param {string} message - The notification message
     * @param {Object} options - Additional options for this specific toast
     * @returns {HTMLElement} - The toast element
     */
    info(message, options = {}) {
        return this._showToast(message, {
            icon: 'info-circle',
            className: 'info',
            ...options
        });
    }
    
    /**
     * Create the toast container
     * @private
     * @returns {HTMLElement} - The container element
     */
    _createContainer() {
        const container = document.createElement('div');
        container.className = `toast-container toast-${this.options.position}`;
        document.body.appendChild(container);
        return container;
    }
    
    /**
     * Show a toast notification
     * @private
     * @param {string} message - The notification message
     * @param {Object} options - Configuration options
     * @returns {HTMLElement} - The toast element
     */
    _showToast(message, options = {}) {
        // Merge options
        const toastOptions = {
            ...this.options,
            ...options
        };
        
        // Check if we need to remove oldest toast
        if (this.activeToasts.length >= toastOptions.maxVisible) {
            this._removeToast(this.activeToasts[0]);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${toastOptions.className || 'default'}`;
        toast.setAttribute('role', 'alert');
        
        // Create inner content
        toast.innerHTML = `
            <div class="toast-content">
                ${toastOptions.icon ? `<i class="toast-icon fas fa-${toastOptions.icon}"></i>` : ''}
                <p class="toast-message">${message}</p>
            </div>
            ${toastOptions.closable ? '<button class="toast-close" aria-label="Close"><i class="fas fa-times"></i></button>' : ''}
        `;
        
        // Add to container
        this.container.appendChild(toast);
        this.activeToasts.push(toast);
        
        // Add close handler
        if (toastOptions.closable) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                this._removeToast(toast);
            });
        }
        
        // Show toast with animation
        setTimeout(() => {
            toast.classList.add('toast-visible');
        }, 10);
        
        // Auto-remove after duration
        if (toastOptions.duration) {
            toast.timeoutId = setTimeout(() => {
                this._removeToast(toast);
            }, toastOptions.duration);
        }
        
        // Return the toast element
        return toast;
    }
    
    /**
     * Remove a toast notification
     * @private
     * @param {HTMLElement} toast - The toast element to remove
     */
    _removeToast(toast) {
        // Clear timeout if exists
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        
        // Add hiding class for animation
        toast.classList.add('toast-hiding');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
                this.activeToasts = this.activeToasts.filter(t => t !== toast);
            }
        }, 300); // Match animation duration
    }
    
    /**
     * Add CSS styles to document
     * @private
     */
    _addStyles() {
        if (document.getElementById('toast-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-container {
                position: fixed;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 350px;
            }
            
            .toast-top-right {
                top: 20px;
                right: 20px;
            }
            
            .toast-top-left {
                top: 20px;
                left: 20px;
            }
            
            .toast-bottom-right {
                bottom: 20px;
                right: 20px;
            }
            
            .toast-bottom-left {
                bottom: 20px;
                left: 20px;
            }
            
            .toast-top-center {
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .toast-bottom-center {
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .toast {
                background: rgba(31, 41, 55, 0.9);
                border-left: 4px solid #9333ea;
                border-radius: 4px;
                padding: 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transform: translateX(120%);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                backdrop-filter: blur(4px);
            }
            
            .toast-visible {
                transform: translateX(0);
                opacity: 1;
            }
            
            .toast-hiding {
                transform: translateX(120%);
                opacity: 0;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
                color: white;
            }
            
            .toast-icon {
                font-size: 1.25rem;
            }
            
            .toast-message {
                margin: 0;
                font-size: 0.875rem;
            }
            
            .toast-close {
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                padding: 0;
                font-size: 0.875rem;
                transition: color 0.2s;
            }
            
            .toast-close:hover {
                color: white;
            }
            
            .toast-success {
                border-color: #10b981;
            }
            
            .toast-success .toast-icon {
                color: #10b981;
            }
            
            .toast-error {
                border-color: #ef4444;
            }
            
            .toast-error .toast-icon {
                color: #ef4444;
            }
            
            .toast-warning {
                border-color: #f59e0b;
            }
            
            .toast-warning .toast-icon {
                color: #f59e0b;
            }
            
            .toast-info {
                border-color: #3b82f6;
            }
            
            .toast-info .toast-icon {
                color: #3b82f6;
            }
            
            @media (max-width: 576px) {
                .toast-container {
                    width: calc(100% - 40px);
                    max-width: none;
                }
                
                .toast-top-center,
                .toast-bottom-center {
                    left: 20px;
                    right: 20px;
                    transform: none;
                    width: calc(100% - 40px);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Clear all active toasts
     */
    clear() {
        this.activeToasts.forEach(toast => {
            this._removeToast(toast);
        });
        this.activeToasts = [];
    }
}

// Create a default instance for easy import
export const toast = new Toast();

// Helper functions for direct usage
export function showSuccessToast(message, options = {}) {
    return toast.success(message, options);
}

export function showErrorToast(message, options = {}) {
    return toast.error(message, options);
}

export function showWarningToast(message, options = {}) {
    return toast.warning(message, options);
}

export function showInfoToast(message, options = {}) {
    return toast.info(message, options);
}
