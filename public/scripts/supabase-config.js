// Supabase configuration and environment setup
(function() {
    // Default development configuration
    const SUPABASE_URL = 'https://your-supabase-project-url.supabase.co';
    const SUPABASE_KEY = 'your-supabase-anon-key'; // Public anon key only
    
    // Try to load from environment if available (for deployed environments)
    const envUrl = typeof process !== 'undefined' && process.env ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL : null;
        
    const envKey = typeof process !== 'undefined' && process.env ? 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY : null;
    
    // Use environment variables if available, otherwise use defaults
    const url = envUrl || SUPABASE_URL;
    const key = envKey || SUPABASE_KEY;
    
    // Initialize Supabase client
    function initSupabase() {
        try {
            if (!url || !key) {
                console.error('Supabase URL or key not configured properly');
                return null;
            }
            
            if (typeof supabase === 'undefined') {
                console.error('Supabase client library not loaded');
                return null;
            }
            
            const client = supabase.createClient(url, key);
            return client;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            return null;
        }
    }
    
    // Database constants
    const TABLES = {
        REGISTRATIONS: 'registrations',
        SELECTED_EVENTS: 'selected_events',
        TEAM_MEMBERS: 'team_members',
        EVENTS: 'events',
        PAYMENTS: 'payments',
        STORAGE: {
            PAYMENT_PROOFS: 'payment_proofs'
        }
    };
    
    // Export for use in other files
    window.supabaseConfig = {
        url,
        key,
        initSupabase,
        TABLES
    };
})();
