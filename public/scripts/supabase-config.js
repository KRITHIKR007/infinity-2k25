// Supabase configuration
const SUPABASE_URL = 'https://your-supabase-project-url.supabase.co';
const SUPABASE_KEY = 'your-supabase-anon-key'; // Public anon key only

// Initialize Supabase client
function initSupabase() {
  return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Export for use in other files
window.supabaseConfig = {
  initSupabase
};
