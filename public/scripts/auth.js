import { supabase } from '../../supabase.js';

// Authentication utility functions
export const auth = {
  // Check if user is authenticated
  isAuthenticated: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  },
  
  // Sign in with email and password
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  // Sign out current user
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  // Request password reset
  resetPassword: async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin/reset-password.html',
    });
  },
  
  // Update user password
  updatePassword: async (password) => {
    return await supabase.auth.updateUser({ password });
  },
  
  // Create admin user (should be restricted)
  createAdminUser: async (email, password, metadata = {}) => {
    // This would typically be a server-side function with proper authorization
    // For demo purposes, we're using client-side, but in production, use Supabase Edge Functions
    return await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        ...metadata,
        role: 'admin'
      }
    });
  }
};
