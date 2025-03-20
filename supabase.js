// Import createClient from the CDN if the module import fails
let createClient;
try {
  if (typeof window !== 'undefined') {
    if (window.supabase && window.supabase.createClient) {
      createClient = window.supabase.createClient;
    } else {
      // Dynamic import for browsers
      import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm')
        .then(module => {
          createClient = module.createClient;
        });
    }
  } else {
    // For NodeJS environments
    import('@supabase/supabase-js').then(module => {
      createClient = module.createClient;
    });
  }
} catch (e) {
  console.error('Failed to import Supabase client:', e);
}

// Supabase configuration
const SUPABASE_URL = 'https://ceickbodqhwfhcpabfdq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';

// Initialize Supabase client
let supabase;

// Use a function to ensure we have createClient before initializing
function getSupabaseClient() {
  if (!supabase && typeof createClient === 'function') {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

// For ES module environments
export { getSupabaseClient as supabase };

// For script tag environments
if (typeof window !== 'undefined') {
  window.getSupabaseClient = getSupabaseClient;
  
  // Initialize immediately if both dependencies are available
  if (typeof createClient === 'function') {
    window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}

// Export table names
export const TABLES = {
    REGISTRATIONS: 'registrations',
    EVENTS: 'events',
    PAYMENTS: 'payments',
    PARTICIPANTS: 'participants',
    STORAGE: {
        PAYMENT_PROOFS: 'payment_proofs',
        EVENT_IMAGES: 'event_images'
    }
};

// Authentication helper functions
export const auth = {
  signIn: async (email, password) => {
    return await getSupabaseClient().auth.signInWithPassword({ email, password });
  },
  
  signOut: async () => {
    return await getSupabaseClient().auth.signOut();
  },
  
  resetPassword: async (email) => {
    return await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin/reset-password.html',
    });
  },
  
  updatePassword: async (password) => {
    return await getSupabaseClient().auth.updateUser({ password });
  },
  
  getSession: async () => {
    return await getSupabaseClient().auth.getSession();
  },
  
  getCurrentUser: async () => {
    const { data: { user } } = await getSupabaseClient().auth.getUser();
    return user;
  }
};

// Event management functions
export const events = {
  getAllEvents: async () => {
    return await getSupabaseClient()
      .from(TABLES.EVENTS)
      .select('*')
      .order('created_at', { ascending: false });
  },
  
  getEventById: async (id) => {
    return await getSupabaseClient()
      .from(TABLES.EVENTS)
      .select('*')
      .eq('id', id)
      .single();
  },
  
  createEvent: async (eventData) => {
    return await getSupabaseClient()
      .from(TABLES.EVENTS)
      .insert([{ ...eventData, created_at: new Date().toISOString() }]);
  },
  
  updateEvent: async (id, eventData) => {
    return await getSupabaseClient()
      .from(TABLES.EVENTS)
      .update({ ...eventData, updated_at: new Date().toISOString() })
      .eq('id', id);
  },
  
  deleteEvent: async (id) => {
    return await getSupabaseClient()
      .from(TABLES.EVENTS)
      .delete()
      .eq('id', id);
  }
};

// Registration management functions
export const registrations = {
  getAllRegistrations: async () => {
    return await getSupabaseClient()
      .from(TABLES.REGISTRATIONS)
      .select('*')
      .order('created_at', { ascending: false });
  },
  
  getRegistrationById: async (id) => {
    return await getSupabaseClient()
      .from(TABLES.REGISTRATIONS)
      .select('*')
      .eq('id', id)
      .single();
  },
  
  createRegistration: async (registrationData) => {
    return await getSupabaseClient()
      .from(TABLES.REGISTRATIONS)
      .insert([{ ...registrationData, created_at: new Date().toISOString() }]);
  },
  
  updateRegistrationStatus: async (id, status) => {
    return await getSupabaseClient()
      .from(TABLES.REGISTRATIONS)
      .update({ 
        payment_status: status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);
  }
};