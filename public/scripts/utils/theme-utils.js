/**
 * Theme utilities for handling light/dark mode
 */

// Theme names
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Local storage key
const THEME_STORAGE_KEY = 'infinity-theme';

/**
 * Initialize theme system
 * @param {Object} options - Configuration options
 */
export function initTheme(options = {}) {
    const defaultOptions = {
        defaultTheme: THEMES.DARK,
        toggleSelector: '[data-theme-toggle]',
        saveToStorage: true
    };
    
    const config = { ...defaultOptions, ...options };
    
    // Get initial theme preference
    let currentTheme = config.defaultTheme;
    
    // Check local storage
    if (config.saveToStorage) {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) {
            currentTheme = storedTheme;
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            currentTheme = prefersDark ? THEMES.DARK : THEMES.LIGHT;
        }
    }
    
    // Apply theme
    setTheme(currentTheme);
    
    // Set up toggle
    const toggleElements = document.querySelectorAll(config.toggleSelector);
    toggleElements.forEach(element => {
        // Update toggle state
        updateToggleState(element, currentTheme);
        
        // Add click event listener
        element.addEventListener('click', () => {
            const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
            setTheme(newTheme);
            currentTheme = newTheme;
            
            // Update all toggle elements
            toggleElements.forEach(el => updateToggleState(el, currentTheme));
            
            // Save preference
            if (config.saveToStorage) {
                localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
            }
        });
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!config.saveToStorage || !localStorage.getItem(THEME_STORAGE_KEY)) {
            const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
            setTheme(newTheme);
            currentTheme = newTheme;
            
            // Update all toggle elements
            toggleElements.forEach(el => updateToggleState(el, currentTheme));
        }
    });
}

/**
 * Set the current theme
 * @param {string} theme - Theme name (light or dark)
 */
export function setTheme(theme) {
    if (theme === THEMES.DARK) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

/**
 * Get the current theme
 * @returns {string} - Current theme name
 */
export function getTheme() {
    return document.documentElement.classList.contains('dark') ? THEMES.DARK : THEMES.LIGHT;
}

/**
 * Update theme toggle element state
 * @param {HTMLElement} element - Toggle element
 * @param {string} theme - Current theme
 */
function updateToggleState(element, theme) {
    const lightIcon = element.querySelector('[data-theme-light]');
    const darkIcon = element.querySelector('[data-theme-dark]');
    
    if (lightIcon) {
        lightIcon.classList.toggle('hidden', theme === THEMES.DARK);
    }
    
    if (darkIcon) {
        darkIcon.classList.toggle('hidden', theme === THEMES.LIGHT);
    }
    
    // Update aria-pressed for accessibility
    element.setAttribute('aria-pressed', theme === THEMES.DARK ? 'true' : 'false');
}

// Export constants
export { THEMES };
