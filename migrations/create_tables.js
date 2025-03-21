/**
   * Database Migration - Create Tables
   * 
   * This script creates all the necessary tables in Supabase for the Infinity 2025 registration system.
   */

  import { createClient } from '@supabase/supabase-js';
  import dotenv from 'dotenv';
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';
  import fs from 'fs';

  // Load environment variables
  dotenv.config();

  // Get current file path for ES Modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Supabase credentials
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase credentials. Please check your .env file.');
    process.exit(1);
  }

  // Initialize Supabase client with service key for admin access
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Define table schemas
  const tables = [
    {
      name: 'events',
      query: `
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          date TIMESTAMP WITH TIME ZONE,
          time TEXT,
          venue TEXT,
          rules TEXT,
          max_participants INTEGER,
          fee NUMERIC DEFAULT 0,
          team_size INTEGER DEFAULT 1,
          status TEXT DEFAULT 'active',
          image_url TEXT,
          prize_details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
        CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
      `
    },
    {
      name: 'registrations',
      query: `
        CREATE TABLE IF NOT EXISTS registrations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          registration_id TEXT UNIQUE,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          university TEXT,
          events JSONB DEFAULT '[]',
          event_name TEXT,
          category TEXT,
          payment_status TEXT DEFAULT 'pending',
          payment_id UUID,
          payment_proof_url TEXT,
          payment_method TEXT,
          team_name TEXT,
          team_members JSONB DEFAULT '[]',
          fee NUMERIC DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_registrations_registration_id ON registrations(registration_id);
        CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
        CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
        CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
      `
    },
    {
      name: 'payments',
      query: `
        CREATE TABLE IF NOT EXISTS payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          amount NUMERIC NOT NULL,
          currency TEXT DEFAULT 'INR',
          status TEXT DEFAULT 'pending',
          payment_method TEXT,
          transaction_id TEXT,
          proof_url TEXT,
          proof_path TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
        CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
      `
    },
    {
      name: 'participants',
      query: `
        CREATE TABLE IF NOT EXISTS participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          registration_id UUID,
          event_id UUID,
          name TEXT NOT NULL,
          email TEXT,
          status TEXT DEFAULT 'registered',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_participants_registration_id ON participants(registration_id);
        CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
      `
    }
  ];

  // Function to create all tables
  async function createTables() {
    console.log('Starting database migration: Creating tables...');
    
    try {
      // Verify connection with a simple query instead of auth.getUser()
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);
      
      if (error) {
        throw new Error(`Failed to connect to Supabase: ${error.message}`);
      }
      
      console.log('Connected to Supabase successfully');
      
      // Since 'exec_sql' RPC might not be available, generate a SQL file to run in the Dashboard
      const sqlFilePath = 'create-tables-all.sql';
      let allSql = '';
      
      for (const table of tables) {
        console.log(`Preparing table: ${table.name}...`);
        allSql += `-- Table: ${table.name}\n${table.query}\n\n`;
      }
      
      fs.writeFileSync(sqlFilePath, allSql);
      console.log(`✅ SQL file created at ${sqlFilePath}`);
      
      // Try to execute the SQL directly if possible
      try {
        for (const table of tables) {
          console.log(`Creating table: ${table.name}...`);
          
          // Try to execute SQL directly
          const res = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'X-Client-Info': 'supabase-js/2.x',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              query: table.query
            })
          });
          
          if (!res.ok) {
            console.warn(`Warning: Could not create table ${table.name} automatically.`);
          } else {
            console.log(`✅ Table ${table.name} created or updated successfully`);
          }
        }
    } catch (execError) {
      console.warn(`Warning: Could not execute SQL directly. Please run the SQL in the Supabase Dashboard instead.`);
      console.warn(`Error details: ${execError.message}`);
    }
    
    console.log('✅ Migration completed. If you see warnings above, please run the SQL in the Supabase Dashboard SQL Editor.');
    console.log(`Instructions:
1. Go to https://supabase.com/dashboard and open your project
2. Go to the SQL Editor tab
3. Copy and paste the contents of ${sqlFilePath}
4. Click "Run" to execute the SQL
5. After tables are created, run setup-storage.js to create storage buckets`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createTables();
}

export default createTables;

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('Starting database migrations...');

    // Create registrations table
    const { error: registrationsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'registrations',
      table_definition: `
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        university TEXT NOT NULL,
        category TEXT NOT NULL,
        team_name TEXT,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        total_amount INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      `
    });

    if (registrationsError) {
      throw registrationsError;
    }

    // Create selected_events table
    const { error: eventsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'selected_events',
      table_definition: `
        id SERIAL PRIMARY KEY,
        registration_id TEXT NOT NULL REFERENCES registrations(id),
        event_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(registration_id, event_id)
      `
    });

    if (eventsError) {
      throw eventsError;
    }

    // Create team_members table
    const { error: teamError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'team_members',
      table_definition: `
        id SERIAL PRIMARY KEY,
        registration_id TEXT NOT NULL REFERENCES registrations(id),
        name TEXT NOT NULL,
        member_number INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(registration_id, member_number)
      `
    });

    if (teamError) {
      throw teamError;
    }

    // Create storage bucket for payment proofs if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket('payment_proofs', {
      public: false,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
    });

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError;
    }

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

// Run migrations
createTables();
