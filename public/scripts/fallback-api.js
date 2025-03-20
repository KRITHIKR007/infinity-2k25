/**
 * Fallback API client for browsers or environments that don't support ES modules
 */

// Constants
const SUPABASE_URL = 'https://ceickbodqhwfhcpabfdq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';

// Ensure supabase client is available
function ensureSupabaseClient() {
  if (!window.supabase && typeof supabase !== 'undefined') {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized from fallback script');
  }
  return window.supabase;
}

// API endpoints and handlers for non-module environments
const fallbackApi = {
  // Events API
  events: {
    getAll: async function(options = {}) {
      try {
        const client = ensureSupabaseClient();
        if (!client) throw new Error('Supabase client not available');
        
        let query = client.from('events').select('*');
        
        // Apply filters
        if (options.category) {
          query = query.eq('category', options.category);
        }
        
        // Execute query
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
  },
  
  // Registrations API
  registrations: {
    create: async function(registrationData) {
      try {
        const client = ensureSupabaseClient();
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
    }
  }
};

// Make available globally
window.api = fallbackApi;
