import { supabase } from '../../supabase.js';
import { showNotification, showButtonLoading, hideButtonLoading } from './utils/ui-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Add notification styles
    addNotificationStyles();
    
    // Check if already logged in
    checkAuthStatus();
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', showForgotPasswordForm);
    }
    
    // Forgot password form
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Back to login link
    const backToLoginLink = document.getElementById('backToLoginLink');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', showLoginForm);
    }
    
    // Password visibility toggle
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', togglePasswordVisibility);
    });
});

/**
 * Check if user is already authenticated
 */
async function checkAuthStatus() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            // Get redirect URL from query parameter or default to dashboard
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect') || 'dashboard.html';
            
            // Redirect to dashboard or specified page
            window.location.href = redirectUrl;
        } else {
            // Show login form if not logged in
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
            
            const loginSection = document.getElementById('loginSection');
            if (loginSection) {
                loginSection.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showNotification('Authentication check failed', 'error');
        
        // Show login form on error
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
        const loginSection = document.getElementById('loginSection');
        if (loginSection) {
            loginSection.classList.remove('hidden');
        }
    }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }
    
    const loginButton = document.getElementById('loginButton');
    showButtonLoading(loginButton, 'Signing in...');
    
    try {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                // Set session duration based on "Remember me"
                expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 1 * 24 * 60 * 60 // 30 days or 1 day
            }
        });
        
        if (error) throw error;
        
        // Successful login
        showNotification('Login successful', 'success');
        
        // Get redirect URL from query parameter or default to dashboard
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || 'dashboard.html';
        
        // Redirect to dashboard or specified page
        window.location.href = redirectUrl;
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Show friendly error message
        if (error.message?.includes('Invalid login')) {
            showNotification('Invalid email or password', 'error');
        } else {
            showNotification('Login failed: ' + error.message, 'error');
        }
        
        // Reset login button
        hideButtonLoading(loginButton);
    }
}

/**
 * Handle forgot password form submission
 * @param {Event} e - Form submit event
 */
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    
    // Validate email
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    const resetButton = document.getElementById('resetButton');
    showButtonLoading(resetButton, 'Sending...');
    
    try {
        // Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html',
        });
        
        if (error) throw error;
        
        // Show success message
        showNotification('Password reset email sent! Check your inbox.', 'success');
        
        // Switch back to login form after short delay
        setTimeout(() => {
            showLoginForm();
        }, 3000);
        
    } catch (error) {
        console.error('Password reset error:', error);
        showNotification('Failed to send reset email: ' + error.message, 'error');
    } finally {
        hideButtonLoading(resetButton);
    }
}

/**
 * Show the forgot password form
 * @param {Event} e - Click event
 */
function showForgotPasswordForm(e) {
    if (e) e.preventDefault();
    
    const loginFormSection = document.getElementById('loginFormSection');
    const forgotPasswordFormSection = document.getElementById('forgotPasswordFormSection');
    
    if (loginFormSection && forgotPasswordFormSection) {
        loginFormSection.classList.add('hidden');
        forgotPasswordFormSection.classList.remove('hidden');
    }
}

/**
 * Show the login form
 * @param {Event} e - Click event
 */
function showLoginForm(e) {
    if (e) e.preventDefault();
    
    const loginFormSection = document.getElementById('loginFormSection');
    const forgotPasswordFormSection = document.getElementById('forgotPasswordFormSection');
    
    if (loginFormSection && forgotPasswordFormSection) {
        forgotPasswordFormSection.classList.add('hidden');
        loginFormSection.classList.remove('hidden');
    }
}

/**
 * Toggle password visibility
 * @param {Event} e - Click event
 */
function togglePasswordVisibility(e) {
    const button = e.currentTarget;
    const inputId = button.dataset.target;
    const input = document.getElementById(inputId);
    
    if (!input) return;
    
    // Toggle input type
    input.type = input.type === 'password' ? 'text' : 'password';
    
    // Update icon
    const icon = button.querySelector('i');
    if (icon) {
        icon.className = input.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
}

/**
 * Add notification styles to document
 */
function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
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
            background: rgba(26, 32, 44, 0.9);
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
            color: white;
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
    `;
    
    document.head.appendChild(style);
}

// Export functions for testing
export {
    handleLogin,
    handleForgotPassword,
    showForgotPasswordForm,
    showLoginForm,
    togglePasswordVisibility
};
