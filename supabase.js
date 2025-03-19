import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ceickbodqhwfhcpabfdq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database tables
export const TABLES = {
  EVENTS: 'events',
  REGISTRATIONS: 'registrations',
  USERS: 'users',
  PAYMENTS: 'payments'
};

// Authentication helper functions
export const auth = {
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  resetPassword: async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin/reset-password.html',
    });
  },
  
  updatePassword: async (password) => {
    return await supabase.auth.updateUser({ password });
  },
  
  getSession: async () => {
    return await supabase.auth.getSession();
  },
  
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};

// Event management functions
export const events = {
  getAllEvents: async () => {
    return await supabase
      .from(TABLES.EVENTS)
      .select('*')
      .order('created_at', { ascending: false });
  },
  
  getEventById: async (id) => {
    return await supabase
      .from(TABLES.EVENTS)
      .select('*')
      .eq('id', id)
      .single();
  },
  
  createEvent: async (eventData) => {
    return await supabase
      .from(TABLES.EVENTS)
      .insert([{ ...eventData, created_at: new Date().toISOString() }]);
  },
  
  updateEvent: async (id, eventData) => {
    return await supabase
      .from(TABLES.EVENTS)
      .update({ ...eventData, updated_at: new Date().toISOString() })
      .eq('id', id);
  },
  
  deleteEvent: async (id) => {
    return await supabase
      .from(TABLES.EVENTS)
      .delete()
      .eq('id', id);
  }
};

// Registration management functions
export const registrations = {
  getAllRegistrations: async () => {
    return await supabase
      .from(TABLES.REGISTRATIONS)
      .select('*')
      .order('created_at', { ascending: false });
  },
  
  getRegistrationById: async (id) => {
    return await supabase
      .from(TABLES.REGISTRATIONS)
      .select('*')
      .eq('id', id)
      .single();
  },
  
  createRegistration: async (registrationData) => {
    return await supabase
      .from(TABLES.REGISTRATIONS)
      .insert([{ ...registrationData, created_at: new Date().toISOString() }]);
  },
  
  updateRegistrationStatus: async (id, status) => {
    return await supabase
      .from(TABLES.REGISTRATIONS)
      .update({ 
        payment_status: status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);
  }
};