/**
 * Universal Supabase client that works in all environments
 * This provides reliable access to Supabase without ES module dependencies
 */

// Constants for Supabase connection
const SUPABASE_URL = 'https://ceickbodqhwfhcpabfdq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';

// Create a reliable global supabase client
function initSupabaseClient() {
    // If window.supabase already exists, use that
    if (window.supabase) {
        console.log('Using existing Supabase client');
        return window.supabase;
    }
    
    // If the supabase global object exists (from CDN), create a new client
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        console.log('Creating new Supabase client from global object');
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return window.supabase;
    }
    
    console.error('Supabase library not loaded. Please make sure @supabase/supabase-js is included in your page.');
    return null;
}

// Expose initialization function
window.initSupabaseClient = initSupabaseClient;

// Initialize automatically when the script loads
document.addEventListener('DOMContentLoaded', function() {
    initSupabaseClient();
});

// Provide basic API for non-module scripts
window.supabaseApi = {
    createRegistration: async function(registrationData) {
        try {
            const client = initSupabaseClient();
            if (!client) throw new Error('Supabase client not available');
            
            // Generate unique registration ID
            const registrationId = `INF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
            
            // Create registration
            const { data, error } = await client
                .from('registrations')
                .insert([{
                    registration_id: registrationId,
                    name: registrationData.name,
                    email: registrationData.email,
                    phone: registrationData.phone,
                    university: registrationData.university,
                    events: registrationData.selectedEvents || [],
                    event_name: registrationData.eventNames || '',
                    payment_status: 'awaiting_payment',
                    created_at: new Date().toISOString()
                }])
                .select();
                
            if (error) throw error;
            
            return {
                success: true,
                data: data[0]
            };
        } catch (error) {
            console.error('API Error - createRegistration:', error);
            return {
                success: false,
                error: error.message || 'Failed to create registration'
            };
        }
    },
    
    getEvents: async function(category = null) {
        try {
            const client = initSupabaseClient();
            if (!client) throw new Error('Supabase client not available');
            
            let query = client.from('events').select('*');
            
            if (category) {
                query = query.eq('category', category);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('API Error - getEvents:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch events'
            };
        }
    }
};
