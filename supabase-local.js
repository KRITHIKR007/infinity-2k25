/**
 * Local Supabase client initialization
 * This provides access to Supabase without requiring ES modules
 */

// Constants for Supabase connection
const SUPABASE_URL = 'https://ceickbodqhwfhcpabfdq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';

// Initialize the Supabase client if the library is available
function initSupabase() {
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized locally');
        return window.supabaseClient;
    } else {
        console.error('Supabase library not loaded');
        return null;
    }
}

// Export the client and initialization function
window.initSupabase = initSupabase;

// Auto-initialize on script load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client if not already initialized
    if (!window.supabase && typeof supabase !== 'undefined') {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
});
