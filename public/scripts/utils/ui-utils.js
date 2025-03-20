/**
 * UI and form utility functions
 */

/**
 * Create a debounced version of a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} - Formatted currency
 */
export function formatCurrency(amount, currency = 'INR') {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    return formatter.format(amount);
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date
 */
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new Date(date).toLocaleDateString('en-IN', mergedOptions);
}

/**
 * Format time for display
 * @param {string|Date} time - Time to format
 * @returns {string} - Formatted time
 */
export function formatTime(time) {
    return new Date(time).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @param {number} limit - Maximum number of characters
 * @returns {string} - Initials
 */
export function getInitials(name, limit = 2) {
    if (!name) return '';
    
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, limit);
}

/**
 * Add notification to the page
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
export function showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set different icons based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Find or create notifications container
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    
    // Add notification to container
    container.appendChild(notification);
    
    // Handle close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, duration);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);
}

/**
 * Show loading spinner on a button
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Text to show while loading
 */
export function showButtonLoading(button, loadingText = 'Loading...') {
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${loadingText}`;
    button.dataset.originalContent = originalContent;
}

/**
 * Hide loading spinner on a button
 * @param {HTMLElement} button - Button element
 */
export function hideButtonLoading(button) {
    if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        button.disabled = false;
        delete button.dataset.originalContent;
    }
}

/**
 * Create CSS styles for notifications
 */
export function addNotificationStyles() {
    // Only add if not already added
    if (document.getElementById('notification-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notifications-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        }
        
        .notification {
            background: rgba(41, 41, 41, 0.9);
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateX(120%);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .notification-visible {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification-hiding {
            transform: translateX(120%);
            opacity: 0;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            color: white;
        }
        
        .notification-content i {
            font-size: 1.25rem;
        }
        
        .notification-content p {
            margin: 0;
            font-size: 0.875rem;
        }
        
        .notification-close {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 0;
            font-size: 0.875rem;
            transition: color 0.2s;
        }
        
        .notification-close:hover {
            color: white;
        }
        
        .notification-success {
            border-color: #10b981;
        }
        
        .notification-success i {
            color: #10b981;
        }
        
        .notification-error {
            border-color: #ef4444;
        }
        
        .notification-error i {
            color: #ef4444;
        }
        
        .notification-warning {
            border-color: #f59e0b;
        }
        
        .notification-warning i {
            color: #f59e0b;
        }
        
        .notification-info {
            border-color: #3b82f6;
        }
        
        .notification-info i {
            color: #3b82f6;
        }
    `;
    
    document.head.appendChild(style);
}
