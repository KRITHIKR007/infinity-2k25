import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ceickbodqhwfhcpabfdq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // This should be a service key with higher privileges

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
    console.log('Setting up storage buckets...');
    
    try {
        // Create payment_proofs bucket
        const { data: bucketData, error: bucketError } = await supabase
            .storage
            .createBucket('payment_proofs', {
                public: true,  // Make the bucket publicly accessible
                fileSizeLimit: 5242880, // 5MB in bytes
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
            });
        
        if (bucketError) {
            // If error is because bucket already exists, it's fine
            if (bucketError.message.includes('already exists')) {
                console.log('payment_proofs bucket already exists');
            } else {
                throw bucketError;
            }
        } else {
            console.log('Created payment_proofs bucket successfully');
        }
        
        // Set up storage permissions via policies
        await setupStoragePolicies();
        
        console.log('Storage setup completed successfully');
    } catch (error) {
        console.error('Error setting up storage:', error);
    }
}

async function setupStoragePolicies() {
    try {
        // Allow anyone to read from payment_proofs bucket
        const { error: readPolicyError } = await supabase.rpc('create_storage_policy', {
            bucket_id: 'payment_proofs',
            name: 'Public Read Access',
            definition: `bucket_id = 'payment_proofs'`,
            operation: 'SELECT',
            role_name: 'anon'
        });
        
        if (readPolicyError && !readPolicyError.message.includes('already exists')) {
            throw readPolicyError;
        }
        
        // Allow authenticated users to upload to payment_proofs bucket
        const { error: insertPolicyError } = await supabase.rpc('create_storage_policy', {
            bucket_id: 'payment_proofs',
            name: 'Authenticated Upload Access',
            definition: `bucket_id = 'payment_proofs' AND auth.role() = 'authenticated'`,
            operation: 'INSERT',
            role_name: 'authenticated'
        });
        
        if (insertPolicyError && !insertPolicyError.message.includes('already exists')) {
            throw insertPolicyError;
        }
        
        console.log('Storage policies set up successfully');
    } catch (error) {
        console.error('Error setting up storage policies:', error);
    }
}

setupStorage();
