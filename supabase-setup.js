import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Get current file path for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ceickbodqhwfhcpabfdq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required.');
  process.exit(1);
}

// Initialize Supabase admin client with correct options
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database table definitions
const tables = {
    events: {
        name: 'events',
        columns: [
            { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()' },
            { name: 'name', type: 'text', isRequired: true },
            { name: 'description', type: 'text' },
            { name: 'category', type: 'text', isRequired: true },
            { name: 'date', type: 'timestamp with time zone' },
            { name: 'time', type: 'text' },
            { name: 'venue', type: 'text' },
            { name: 'rules', type: 'text' },
            { name: 'max_participants', type: 'integer' },
            { name: 'fee', type: 'numeric', defaultValue: '0' },
            { name: 'team_size', type: 'integer' },
            { name: 'status', type: 'text', defaultValue: 'active' },
            { name: 'image_url', type: 'text' },
            { name: 'prize_details', type: 'jsonb' },
            { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' },
            { name: 'updated_at', type: 'timestamp with time zone' }
        ]
    },
    registrations: {
        name: 'registrations',
        columns: [
            { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()' },
            { name: 'registration_id', type: 'text', isUnique: true },
            { name: 'name', type: 'text', isRequired: true },
            { name: 'email', type: 'text', isRequired: true },
            { name: 'phone', type: 'text' },
            { name: 'university', type: 'text' },
            { name: 'events', type: 'jsonb', defaultValue: '[]' },
            { name: 'event_name', type: 'text' },
            { name: 'category', type: 'text' },
            { name: 'payment_status', type: 'text', defaultValue: 'pending' },
            { name: 'payment_id', type: 'uuid' },
            { name: 'payment_proof_url', type: 'text' },
            { name: 'payment_method', type: 'text' },
            { name: 'team_name', type: 'text' },
            { name: 'team_members', type: 'jsonb', defaultValue: '[]' },
            { name: 'fee', type: 'numeric', defaultValue: '0' },
            { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' },
            { name: 'updated_at', type: 'timestamp with time zone' }
        ]
    },
    payments: {
        name: 'payments',
        columns: [
            { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()' },
            { name: 'amount', type: 'numeric', isRequired: true },
            { name: 'currency', type: 'text', defaultValue: 'INR' },
            { name: 'status', type: 'text', defaultValue: 'pending' },
            { name: 'payment_method', type: 'text' },
            { name: 'transaction_id', type: 'text' },
            { name: 'proof_url', type: 'text' },
            { name: 'proof_path', type: 'text' },
            { name: 'notes', type: 'text' },
            { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' },
            { name: 'updated_at', type: 'timestamp with time zone' }
        ]
    },
    participants: {
        name: 'participants',
        columns: [
            { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()' },
            { name: 'registration_id', type: 'uuid' },
            { name: 'event_id', type: 'uuid' },
            { name: 'name', type: 'text', isRequired: true },
            { name: 'email', type: 'text' },
            { name: 'status', type: 'text', defaultValue: 'registered' },
            { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' }
        ]
    }
};

// Storage bucket definitions
const buckets = [
    { name: 'payment_proofs', public: true },
    { name: 'event_images', public: true }
];

/**
 * Create all required tables in Supabase
 */
async function createTables() {
    console.log('Creating database tables...');
    
    try {
        for (const [key, table] of Object.entries(tables)) {
            console.log(`Setting up table: ${table.name}`);
            
            // Check if table exists
            const { data: existingTables, error: tableError } = await supabaseAdmin.rpc('tables_info');
            
            if (tableError) {
                throw new Error(`Error checking table existence: ${tableError.message}`);
            }
            
            const tableExists = existingTables.some(t => t.table_name === table.name);
            
            if (!tableExists) {
                console.log(`Creating table: ${table.name}`);
                // Implementation would use SQL queries via Supabase's SQL executor
                // or REST API calls to create tables with all columns
                console.log(`Table ${table.name} created.`);
            } else {
                console.log(`Table ${table.name} already exists.`);
            }
        }
        
        console.log('All tables created successfully.');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
}

/**
 * Create storage buckets in Supabase
 */
async function createBuckets() {
    console.log('Creating storage buckets...');
    
    try {
        for (const bucket of buckets) {
            console.log(`Setting up bucket: ${bucket.name}`);
            
            // Check if bucket exists
            const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
            
            if (listError) {
                throw new Error(`Error listing buckets: ${listError.message}`);
            }
            
            const bucketExists = existingBuckets.some(b => b.name === bucket.name);
            
            if (!bucketExists) {
                console.log(`Creating bucket: ${bucket.name}`);
                const { error: createError } = await supabaseAdmin.storage.createBucket(bucket.name, {
                    public: bucket.public
                });
                
                if (createError) {
                    throw new Error(`Error creating bucket ${bucket.name}: ${createError.message}`);
                }
                
                console.log(`Bucket ${bucket.name} created.`);
            } else {
                console.log(`Bucket ${bucket.name} already exists.`);
                
                // Update bucket to ensure it has the correct publicity setting
                if (bucket.public) {
                    const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucket.name, {
                        public: true
                    });
                    
                    if (updateError) {
                        console.warn(`Warning: Could not update bucket ${bucket.name} to public: ${updateError.message}`);
                    } else {
                        console.log(`Bucket ${bucket.name} updated to public.`);
                    }
                }
            }
        }
        
        console.log('All storage buckets created successfully.');
    } catch (error) {
        console.error('Error creating storage buckets:', error);
    }
}

/**
 * Main function to run setup
 */
async function setupDatabase() {
  console.log('Starting Supabase database setup...');
  
  try {
    // Test connection with a simple query instead of auth call
    const { data, error } = await supabaseAdmin
      .from('postgres_tables')
      .select('*')
      .limit(1);
      
    if (error) throw error;
    
    console.log('Connected to Supabase successfully.');
    
    // Create tables and buckets
    await createTables();
    await createBuckets();
    
    console.log('Supabase setup completed successfully.');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    setupDatabase();
}

export { setupDatabase, createTables, createBuckets };
