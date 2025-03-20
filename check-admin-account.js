import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Missing Supabase service key in .env file');
  process.exit(1);
}

// Initialize Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function checkAdminAccount() {
  try {
    console.log('🔍 Checking Supabase users...');
    
    // List all users (requires service key)
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error listing users:', error.message);
      return;
    }
    
    console.log(`✅ Found ${users.users.length} users in your Supabase project.`);
    
    // Check if there are any users
    if (users.users.length === 0) {
      console.log('❗ No users found. Let\'s create an admin account.');
      await createAdminUser();
      return;
    }
    
    // List users
    console.log('\n📋 User accounts:');
    users.users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email} | Confirmed: ${user.email_confirmed_at ? '✅' : '❌'} | Last sign in: ${user.last_sign_in_at || 'Never'}`);
    });
    
    // Ask if user wants to create a new admin
    rl.question('\nDo you want to create a new admin account? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        await createAdminUser();
      } else {
        console.log('👋 Exiting without creating new admin account.');
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking admin accounts:', error);
    rl.close();
  }
}

async function createAdminUser() {
  try {
    rl.question('Enter email for new admin: ', (email) => {
      rl.question('Enter password (min 6 characters): ', async (password) => {
        console.log('🔄 Creating admin user...');
        
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: 'admin' }
        });
        
        if (error) {
          console.error('❌ Error creating admin:', error.message);
        } else {
          console.log('✅ Admin user created successfully!');
          console.log(`📧 Email: ${email}`);
          console.log('🔑 Password: [hidden]');
        }
        
        rl.close();
      });
    });
  } catch (error) {
    console.error('❌ Error in admin creation:', error);
    rl.close();
  }
}

// Run the check
checkAdminAccount();
