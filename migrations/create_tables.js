/**
 * Database Migration - Create Tables
 * 
 * This script creates all the necessary tables in Supabase for the Infinity 2025 registration system.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  
  // Connect to Supabase
  try {
    // Verify connection with a simple query
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(`Failed to connect to Supabase: ${error.message}`);
    }
    
    console.log('Connected to Supabase successfully');
    
    // Create each table
    for (const table of tables) {
      console.log(`Creating table: ${table.name}...`);
      
      // Check if table exists already
      const { data: existsData, error: existsError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', table.name)
        .eq('table_schema', 'public');
        
      if (existsError) {
        console.warn(`Warning: Could not check if table ${table.name} exists - ${existsError.message}`);
      }
      
      // Create table using SQL query via RPC
      const { error: tableError } = await supabase.rpc('exec_sql', { 
        sql: table.query 
      });
      
      if (tableError) {
        throw new Error(`Failed to create table ${table.name}: ${tableError.message}`);
      }
      
      console.log(`✅ Table ${table.name} created or already exists`);
    }
    
    console.log('✅ All tables created successfully');
    
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
