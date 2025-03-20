/**
 * UI utility functions for handling common UI operations
 */
export const ui = {
    /**
     * Show a loading state
     * @param {string} buttonId - ID of the button element
     * @param {string} loadingId - ID of the loading element (spinner)
     * @param {string} textId - ID of the text element to hide
     */
    showLoading: function(buttonId, loadingId, textId) {
        const button = document.getElementById(buttonId);
        const loading = document.getElementById(loadingId);
        const text = document.getElementById(textId);
        
        if (button) button.disabled = true;
        if (loading) loading.classList.remove('hidden');
        if (text) text.classList.add('hidden');
    },
    
    /**
     * Hide a loading state
     * @param {string} buttonId - ID of the button element
     * @param {string} loadingId - ID of the loading element (spinner)
     * @param {string} textId - ID of the text element to show
     */
    hideLoading: function(buttonId, loadingId, textId) {
        const button = document.getElementById(buttonId);
        const loading = document.getElementById(loadingId);
        const text = document.getElementById(textId);
        
        if (button) button.disabled = false;
        if (loading) loading.classList.add('hidden');
        if (text) text.classList.remove('hidden');
    },
    
    /**
     * Show an error message
     * @param {string} elementId - ID of the error element
     * @param {string} message - Error message to display
     */
    showError: function(elementId, message) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = message;
        element.classList.remove('hidden');
        
        // Scroll to error message
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    
    /**
     * Show a success message
     * @param {string} elementId - ID of the success element
     * @param {string} message - Success message to display
     */
    showSuccess: function(elementId, message) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = message;
        element.classList.remove('hidden');
        
        // Scroll to success message
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    
    /**
     * Handle form validation errors
     * @param {Object} errors - Object with field names as keys and error messages as values
     */
    handleValidationErrors: function(errors) {
        for (const field in errors) {
            const element = document.getElementById(field);
            const errorElement = document.getElementById(`${field}Error`);
            
            if (element) {
                element.classList.add('border-red-500');
                element.focus();
            }
            
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.remove('hidden');
            }
        }
    },
    
    /**
     * Reset form validation errors
     * @param {Array} fieldNames - Array of field names to reset
     */
    resetValidationErrors: function(fieldNames) {
        fieldNames.forEach(field => {
            const element = document.getElementById(field);
            const errorElement = document.getElementById(`${field}Error`);
            
            if (element) {
                element.classList.remove('border-red-500');
            }
            
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.add('hidden');
            }
        });
    },
    
    /**
     * Create a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of notification ('success', 'error', 'info', 'warning')
     * @param {number} duration - Duration in milliseconds
     */
    toast: function(message, type = 'info', duration = 3000) {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        
        // Set appropriate styling based on type
        let bgColor, textColor, iconClass;
        switch (type) {
            case 'success':
                bgColor = 'bg-green-900 bg-opacity-80';
                textColor = 'text-green-100';
                iconClass = 'fas fa-check-circle';
                break;
            case 'error':
                bgColor = 'bg-red-900 bg-opacity-80';
                textColor = 'text-red-100';
                iconClass = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                bgColor = 'bg-yellow-900 bg-opacity-80';
                textColor = 'text-yellow-100';
                iconClass = 'fas fa-exclamation-triangle';
                break;
            default: // info
                bgColor = 'bg-blue-900 bg-opacity-80';
                textColor = 'text-blue-100';
                iconClass = 'fas fa-info-circle';
        }
        
        toast.className = `${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg flex items-center w-64 transform translate-x-full opacity-0 transition-all duration-300`;
        toast.innerHTML = `
            <i class="${iconClass} mr-2"></i>
            <span>${message}</span>
        `;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, duration);
    }
};
