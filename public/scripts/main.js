/**
 * Main JavaScript file for Infinity 2025 website
 * Contains common functionality used across the site
 */
import { supabase } from '../../supabase.js';
import { verifyDatabaseSetup } from './database.js';

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const closeMenuButton = document.getElementById('closeMenuButton');
const mobileMenu = document.getElementById('mobileMenu');

// Initialize website
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing website...');
    
    // Check database connection
    try {
        const result = await verifyDatabaseSetup();
        
        if (!result.success) {
            console.error('Database verification failed:', result.error);
            showConnectionError(result.error);
        } else {
            console.log('Database connection verified successfully');
            initializeUI();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showConnectionError('Failed to connect to the server. Please try again later.');
    } finally {
        // Hide loading overlay after a minimum display time
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('opacity-0');
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                }, 500);
            }
        }, 800);
    }
});

// Initialize UI components
function initializeUI() {
    // Set up mobile menu
    setupMobileMenu();
    
    // Set up any interactive elements
    setupInteractiveElements();
    
    // Check if user is logged in (for admin sections)
    checkAuthStatus();
}

// Setup mobile menu functionality
function setupMobileMenu() {
    if (mobileMenuButton && mobileMenu && closeMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
        });
        
        closeMenuButton.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    }
}

// Setup interactive elements
function setupInteractiveElements() {
    // Implement smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
    
    // Setup lazy loading for images
    setupLazyLoading();
    
    // Setup any tooltips
    setupTooltips();
}

// Check authentication status (for admin pages)
async function checkAuthStatus() {
    // Check if current page is in admin section
    const isAdminPage = window.location.pathname.includes('/admin/');
    
    if (isAdminPage) {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            // If not logged in and on admin page (except login), redirect to login
            if (!session && !window.location.pathname.includes('/admin/login.html')) {
                window.location.href = '/admin/login.html';
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
}

// Setup lazy loading for images
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        let lazyImages = document.querySelectorAll('img[data-src]');
        
        function lazyLoad() {
            lazyImages.forEach(img => {
                if (isInViewport(img)) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
            
            // Clean up remaining images
            lazyImages = Array.from(lazyImages).filter(img => img.hasAttribute('data-src'));
            
            if (lazyImages.length === 0) {
                document.removeEventListener('scroll', lazyLoad);
                window.removeEventListener('resize', lazyLoad);
                window.removeEventListener('orientationChange', lazyLoad);
            }
        }
        
        document.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
        window.addEventListener('orientationChange', lazyLoad);
    }
}

// Setup tooltips
function setupTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');
        
        element.addEventListener('mouseenter', () => {
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg';
            tooltip.textContent = tooltipText;
            tooltip.style.bottom = '100%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.marginBottom = '5px';
            tooltip.style.whiteSpace = 'nowrap';
            
            element.style.position = 'relative';
            element.appendChild(tooltip);
        });
        
        element.addEventListener('mouseleave', () => {
            const tooltip = element.querySelector('div');
            if (tooltip) {
                element.removeChild(tooltip);
            }
        });
    });
}

// Show connection error
function showConnectionError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80';
    errorDiv.innerHTML = `
        <div class="bg-gray-900 p-6 rounded-lg max-w-md text-center">
            <div class="text-red-500 text-5xl mb-4">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h2 class="text-xl font-bold text-white mb-4">Connection Error</h2>
            <p class="text-gray-300 mb-6">${message}</p>
            <button onclick="location.reload()" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Try Again
            </button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
}

// Check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Export functions for use in other modules
export {
    isInViewport,
    showConnectionError
};