import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Check if we have all the required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or anonymous key in .env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test Supabase connection
async function testConnection() {
  console.log('🔄 Testing Supabase connection with anonymous key...');
  
  try {
    const { data, error } = await supabase.from('events').select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log('✅ Connection successful using anonymous key!');
    
    // Test if tables exist
    const { data: tablesData, error: tablesError } = await supabase.from('events').select('id').limit(1);
    if (tablesError) {
      console.log('❌ The events table does not exist or is not accessible. You may need to run the setup script.');
    } else {
      console.log('✅ Events table is accessible with anonymous key.');
    }
    
  } catch (error) {
    console.error('❌ Connection failed with anonymous key:', error.message);
  }
  
  // Test service key if available
  if (supabaseServiceKey) {
    console.log('\n🔄 Testing Supabase connection with service key...');
    
    try {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await adminClient.from('events').select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      
      console.log('✅ Connection successful using service key!');
      console.log('✅ Your setup is complete and ready for development.');
    } catch (error) {
      console.error('❌ Connection failed with service key:', error.message);
      console.log('⚠️  You need a valid service key for admin operations and running migrations.');
    }
  } else {
    console.log('\n⚠️  No service key found in .env file. You will not be able to run migrations or perform admin operations.');
  }
}

testConnection();
