/**
 * Admin login functionality
 * Fixed to ensure proper authentication with Supabase
 */

document.addEventListener('DOMContentLoaded', function() {
    // Hide loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('opacity-0');
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 500);
    }

    // Initialize Supabase client if not already done
    if (!window.supabase) {
        window.supabase = supabase.createClient(
            'https://ceickbodqhwfhcpabfdq.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8'
        );
    }

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginBtnLoading = document.getElementById('loginBtnLoading');

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Show loading state
            if (loginBtn) loginBtn.disabled = true;
            if (loginBtnText) loginBtnText.classList.add('hidden');
            if (loginBtnLoading) loginBtnLoading.classList.remove('hidden');

            try {
                // Sign in with Supabase
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    throw error;
                }

                console.log('Login successful:', data);
                
                // Store user session for auto-login
                localStorage.setItem('adminLoggedIn', 'true');
                
                // Redirect to dashboard
                window.location.href = '/admin/dashboard.html';
            } catch (error) {
                console.error('Login error:', error);
                
                // Show error message
                showError(error.message || 'Failed to log in. Please check your credentials.');
            } finally {
                // Reset button state
                if (loginBtn) loginBtn.disabled = false;
                if (loginBtnText) loginBtnText.classList.remove('hidden');
                if (loginBtnLoading) loginBtnLoading.classList.add('hidden');
            }
        });
    }

    // Function to show error message
    function showError(message) {
        // Check if error container exists
        let errorContainer = document.getElementById('errorContainer');
        
        // Create error container if it doesn't exist
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'errorContainer';
            errorContainer.className = 'mt-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-md';
            
            // Insert before the form or append to the container
            const container = loginForm.parentNode;
            container.insertBefore(errorContainer, loginForm);
        }
        
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }

    // Add console debug info
    console.log('Admin login script loaded. If you are having issues, please check the console for errors.');
    console.log('To create an admin account, please use the Supabase Authentication dashboard directly.');
});
