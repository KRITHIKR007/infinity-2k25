/**
 * Setup script for Infinity 2025 website
 * Run this script once when setting up the project
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.error('❌ No .env file found. Please create one based on .env.example');
  process.exit(1);
}

// Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Initialize Supabase client with service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSetup() {
  console.log('🚀 Starting Infinity 2025 setup...');
  
  try {
    // Check Supabase connection
    console.log('🔄 Testing Supabase connection...');
    const { data, error } = await supabase.from('events').select('count', { count: 'exact', head: true });
    
    if (error) throw new Error(`Supabase connection failed: ${error.message}`);
    
    console.log('✅ Supabase connection successful');
    
    // Check essential directories
    const directories = ['public', 'pages', 'admin', 'api'];
    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        console.log(`🔄 Creating ${dir} directory...`);
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    await import('./migrations/create_tables.js');
    await import('./migrations/create_storage.js');
    
    console.log('✅ Setup completed successfully!');
    console.log('');
    console.log('🌐 You can now start the development server with:');
    console.log('   npm run dev');
    
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

runSetup();
