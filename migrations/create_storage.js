/**
 * Storage Migration - Create Storage Buckets
 * 
 * This script creates the necessary storage buckets in Supabase for the Infinity 2025 registration system.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current file path for ES Modules
const __filename = fileURLToPath(import.meta.url);

// Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

// Initialize Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define storage buckets to create
const buckets = [
  {
    name: 'payment_proofs',
    options: {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
    }
  },
  {
    name: 'event_images',
    options: {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
    }
  }
];

// Function to create all storage buckets
async function createStorageBuckets() {
  console.log('Starting storage migration: Creating buckets...');
  
  try {
    // Verify connection with a simple query
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(`Failed to connect to Supabase: ${error.message}`);
    }
    
    console.log('Connected to Supabase successfully');
    
    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list existing buckets: ${listError.message}`);
    }
    
    // Create each bucket if it doesn't exist
    for (const bucket of buckets) {
      console.log(`Processing bucket: ${bucket.name}...`);
      
      // Check if bucket already exists
      const bucketExists = existingBuckets.some(b => b.name === bucket.name);
      
      if (bucketExists) {
        console.log(`Bucket ${bucket.name} already exists, updating settings...`);
        
        // Update bucket settings
        const { error: updateError } = await supabase.storage.updateBucket(bucket.name, {
          public: bucket.options.public
        });
        
        if (updateError) {
          console.warn(`Warning: Could not update bucket ${bucket.name} - ${updateError.message}`);
        } else {
          console.log(`✅ Bucket ${bucket.name} updated successfully`);
        }
        
      } else {
        // Create new bucket
        console.log(`Creating new bucket: ${bucket.name}...`);
        
        const { error: createError } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.options.public
        });
        
        if (createError) {
          throw new Error(`Failed to create bucket ${bucket.name}: ${createError.message}`);
        }
        
        console.log(`✅ Bucket ${bucket.name} created successfully`);
      }
    }
    
    console.log('✅ All storage buckets created successfully');
    
  } catch (error) {
    console.error('❌ Storage migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createStorageBuckets();
}

export default createStorageBuckets;
