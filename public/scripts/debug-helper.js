/**
 * Debug helper utility for troubleshooting loading issues
 */

// Check if scripts are loading properly
console.log('Debug helper loaded');

// Function to check Supabase connection
export async function checkSupabaseConnection() {
    try {
        const { createClient } = await import('@supabase/supabase-js');
        
        // Get Supabase credentials from the page (for testing only)
        const urlMeta = document.querySelector('meta[name="supabase-url"]');
        const keyMeta = document.querySelector('meta[name="supabase-anon-key"]');
        
        const url = urlMeta ? urlMeta.getAttribute('content') : 'https://ceickbodqhwfhcpabfdq.supabase.co';
        const key = keyMeta ? keyMeta.getAttribute('content') : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';
        
        // Initialize test Supabase client
        const supabase = createClient(url, key);
        
        // Test a simple query
        const { data, error } = await supabase
            .from('events')
            .select('id')
            .limit(1);
            
        if (error) throw error;
        
        console.log('Supabase connection test successful');
        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Supabase connection test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Add debug panel to the page
export function addDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.className = 'fixed bottom-4 right-4 bg-gray-900 p-4 rounded-lg shadow-lg z-50 text-white text-sm';
    debugPanel.innerHTML = `
        <h3 class="font-bold mb-2">Debug Panel</h3>
        <div id="debugInfo" class="space-y-2">
            <p>Loading debug information...</p>
        </div>
        <div class="mt-2 border-t border-gray-700 pt-2">
            <button id="testConnectionBtn" class="bg-purple-600 text-white px-2 py-1 rounded text-xs">Test Connection</button>
            <button id="forceReloadBtn" class="bg-red-600 text-white px-2 py-1 rounded text-xs ml-2">Force Reload</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(debugPanel);
    
    // Add event listeners to buttons
    document.getElementById('testConnectionBtn').addEventListener('click', async () => {
        const result = await checkSupabaseConnection();
        const debugInfo = document.getElementById('debugInfo');
        
        if (result.success) {
            debugInfo.innerHTML = `<p class="text-green-400">Connection successful!</p>`;
        } else {
            debugInfo.innerHTML = `<p class="text-red-400">Connection failed: ${result.error}</p>`;
        }
    });
    
    document.getElementById('forceReloadBtn').addEventListener('click', () => {
        window.location.reload(true); // Force reload from server
    });
    
    // Show some basic debug info
    collectDebugInfo();
}

// Collect debug information
async function collectDebugInfo() {
    const debugInfo = document.getElementById('debugInfo');
    if (!debugInfo) return;
    
    debugInfo.innerHTML = '';
    
    // Check if Supabase client is loaded
    try {
        const supabaseLoaded = typeof window.supabase !== 'undefined';
        addDebugLine(debugInfo, 'Supabase client', supabaseLoaded ? 'Loaded' : 'Not loaded', supabaseLoaded);
    } catch (e) {
        addDebugLine(debugInfo, 'Supabase client', 'Error checking: ' + e.message, false);
    }
    
    // Add browser info
    addDebugLine(debugInfo, 'Browser', navigator.userAgent);
    
    // Add network status
    addDebugLine(debugInfo, 'Network', navigator.onLine ? 'Online' : 'Offline', navigator.onLine);
    
    // Add script load status
    const scripts = Array.from(document.getElementsByTagName('script'));
    const mainScriptLoaded = scripts.some(s => s.src && s.src.includes('main.js'));
    addDebugLine(debugInfo, 'Main script', mainScriptLoaded ? 'Loaded' : 'Not loaded', mainScriptLoaded);
}

// Add a line to the debug info panel
function addDebugLine(container, label, value, isSuccess = null) {
    const line = document.createElement('div');
    line.className = 'flex justify-between';
    
    const labelEl = document.createElement('span');
    labelEl.className = 'font-medium';
    labelEl.textContent = label + ':';
    
    const valueEl = document.createElement('span');
    if (isSuccess !== null) {
        valueEl.className = isSuccess ? 'text-green-400' : 'text-red-400';
    }
    valueEl.textContent = value;
    
    line.appendChild(labelEl);
    line.appendChild(valueEl);
    container.appendChild(line);
}

// Add a debug mode query param handler
window.enableDebugMode = function() {
    localStorage.setItem('debugMode', 'true');
    addDebugPanel();
}

// Initialize debug mode if enabled
if (window.location.search.includes('debug=true') || localStorage.getItem('debugMode') === 'true') {
    window.addEventListener('DOMContentLoaded', function() {
        addDebugPanel();
    });
}
