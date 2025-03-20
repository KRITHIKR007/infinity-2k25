import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

// Define storage buckets to create
const buckets = [
  { name: 'payment_proofs', isPublic: true },
  { name: 'event_images', isPublic: true }
];

async function setupStorage() {
  console.log('🔄 Setting up storage buckets...');
  
  try {
    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }
    
    // Create buckets that don't exist
    for (const bucket of buckets) {
      const exists = existingBuckets.some(b => b.name === bucket.name);
      
      if (exists) {
        console.log(`✅ Bucket "${bucket.name}" already exists`);
        
        // Update public setting
        const { error: updateError } = await supabase.storage.updateBucket(
          bucket.name, 
          { public: bucket.isPublic }
        );
        
        if (updateError) {
          console.warn(`⚠️ Failed to update bucket "${bucket.name}": ${updateError.message}`);
        } else {
          console.log(`✅ Updated bucket "${bucket.name}" public setting to ${bucket.isPublic}`);
        }
      } else {
        // Create bucket
        const { error: createError } = await supabase.storage.createBucket(
          bucket.name, 
          { public: bucket.isPublic }
        );
        
        if (createError) {
          console.error(`❌ Failed to create bucket "${bucket.name}": ${createError.message}`);
        } else {
          console.log(`✅ Created bucket "${bucket.name}"`);
        }
      }
    }
    
    console.log('✅ Storage setup complete');
  } catch (error) {
    console.error('❌ Storage setup failed:', error.message);
  }
}

setupStorage();
