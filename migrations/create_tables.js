import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ceickbodqhwfhcpabfdq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // This should be a service key with higher privileges

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
    console.log('Creating tables...');
    
    try {
        // Verify connection
        const { data, error } = await supabase.from('_test').select('*').limit(1);
        if (error) {
            console.error('Connection error:', error);
            return;
        }
        
        console.log('Connected to Supabase successfully');
        
        // Create events table
        await supabase.rpc('create_events_table', {
            sql: `
                CREATE TABLE IF NOT EXISTS events (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name TEXT NOT NULL,
                    description TEXT,
                    category TEXT NOT NULL,
                    fee DECIMAL(10,2) NOT NULL DEFAULT 0,
                    min_team_size INTEGER NOT NULL DEFAULT 1,
                    max_team_size INTEGER NOT NULL DEFAULT 1,
                    venue TEXT,
                    event_date DATE,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
                );
            `
        });
        
        // Create registrations table
        await supabase.rpc('create_registrations_table', {
            sql: `
                CREATE TABLE IF NOT EXISTS registrations (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    university TEXT,
                    events JSONB,
                    event_name TEXT,
                    payment_status TEXT DEFAULT 'awaiting_payment',
                    payment_id UUID,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                    team_name TEXT,
                    team_members JSONB,
                    category TEXT,
                    fee DECIMAL(10,2) DEFAULT 0
                );
            `
        });
        
        // Create payments table
        await supabase.rpc('create_payments_table', {
            sql: `
                CREATE TABLE IF NOT EXISTS payments (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    amount DECIMAL(10,2) NOT NULL,
                    currency TEXT DEFAULT 'INR',
                    status TEXT DEFAULT 'pending',
                    payment_method TEXT NOT NULL,
                    proof_url TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
                );
            `
        });
        
        // Create participants table
        await supabase.rpc('create_participants_table', {
            sql: `
                CREATE TABLE IF NOT EXISTS participants (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    registration_id UUID NOT NULL REFERENCES registrations(id),
                    event_id UUID NOT NULL REFERENCES events(id),
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    status TEXT DEFAULT 'registered',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
                );
            `
        });
        
        // Create contact_messages table
        await supabase.rpc('create_contact_messages_table', {
            sql: `
                CREATE TABLE IF NOT EXISTS contact_messages (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                    status TEXT DEFAULT 'unread'
                );
            `
        });
        
        console.log('Tables created successfully');
        
    } catch (error) {
        console.error('Error creating tables:', error);
    }
}

createTables();
