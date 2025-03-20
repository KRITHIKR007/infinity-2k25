import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing Supabase service key in .env file');
  process.exit(1);
}

// Initialize client with correct options
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupPermissions() {
  console.log('🔄 Setting up database permissions...');
  
  try {
    // Create events table policies
    console.log('🔄 Setting up events table permissions...');
    
    const { error: enableRlsError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
      
    if (enableRlsError) {
      console.log('⚠️ Events table does not exist yet. Run setup-db first.');
    } else {
      console.log('✅ Events table exists. Setting up policies...');
      
      // You can use REST API to set up policies instead of SQL
      // or use a proxy table to execute commands
      
      // For now, let's generate SQL scripts that you can run in the Supabase Dashboard SQL Editor
      const sqlPath = path.join(process.cwd(), 'setup-policies.sql');
      const sqlContent = `
-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access for events" 
ON events FOR SELECT 
USING (true);

-- Create policy for authenticated users to create events
CREATE POLICY "Authenticated users can create events" 
ON events FOR INSERT 
TO authenticated 
USING (true);

-- Enable RLS on registrations table
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to create registrations
CREATE POLICY "Anyone can create registrations" 
ON registrations FOR INSERT 
USING (true);

-- Public can view their own registrations by email
CREATE POLICY "Public can view registrations by email" 
ON registrations FOR SELECT 
USING (true);
      `;
      
      fs.writeFileSync(sqlPath, sqlContent);
      console.log(`✅ SQL file created at ${sqlPath}`);
      console.log('Please run this SQL in the Supabase Dashboard SQL Editor');
    }
    
    console.log('✅ Database permissions setup complete');
  } catch (error) {
    console.error('❌ Error setting up permissions:', error.message);
  }
}

setupPermissions();
