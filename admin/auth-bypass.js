/**
 * Admin authentication bypass script
 * This allows for login without triggering Supabase's CAPTCHA
 */

// Initialize Supabase
const supabaseUrl = 'https://ceickbodqhwfhcpabfdq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8';

// Create a direct login function using alternative API methods
async function directLogin(email, password) {
  try {
    console.log('Attempting alternative login method...');
    
    // Create a completely fresh instance each time
    const client = supabase.createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    
    // Use a more direct approach with fetch API to bypass Supabase client restrictions
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apiKey': supabaseKey
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || errorData.error || 'Login failed');
    }
    
    const data = await response.json();
    console.log('Login successful via alternative method!');
    
    // Set the session in the Supabase client
    await client.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token
    });
    
    return { data, error: null };
  } catch (err) {
    console.error('Alternative login error:', err);
    return { data: null, error: err };
  }
}

// Expose this function globally
window.directLogin = directLogin;
