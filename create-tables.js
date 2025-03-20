import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Initialize client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// SQL for creating tables
const createTablesSQL = `
-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  date TIMESTAMPTZ,
  time TEXT,
  venue TEXT,
  rules TEXT,
  max_participants INTEGER,
  fee NUMERIC DEFAULT 0,
  team_size INTEGER,
  status TEXT DEFAULT 'active',
  image_url TEXT,
  prize_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Registrations Table
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Payments Table
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID,
  event_id UUID,
  name TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT now()
);
`;

// Write SQL to file
fs.writeFileSync('create-tables.sql', createTablesSQL);
console.log('✅ SQL file created at create-tables.sql');
console.log('Please run this SQL in the Supabase Dashboard SQL Editor');

// Print instructions
console.log('\nTo set up your database:');
console.log('1. Go to https://supabase.com/dashboard and open your project');
console.log('2. Go to the SQL Editor tab');
console.log('3. Copy and paste the contents of create-tables.sql');
console.log('4. Click "Run" to execute the SQL');
console.log('5. After tables are created, run setup-storage.js to create storage buckets');
