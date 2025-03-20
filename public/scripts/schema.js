/**
 * Database Schema Overview for Infinity 2025 Registration System
 * 
 * This file documents the database schema used in the Supabase backend.
 * It doesn't execute any code but serves as reference documentation.
 */

// Events Table
const eventsTableSchema = {
  name: 'events',
  columns: [
    { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()' },
    { name: 'name', type: 'text', isRequired: true },
    { name: 'description', type: 'text' },
    { name: 'category', type: 'text', isRequired: true }, // tech, cultural, etc.
    { name: 'date', type: 'timestamp with time zone' },
    { name: 'time', type: 'text' }, // Format: "10:00 AM - 2:00 PM"
    { name: 'venue', type: 'text' },
    { name: 'rules', type: 'text' },
    { name: 'max_participants', type: 'integer' },
    { name: 'fee', type: 'numeric', defaultValue: '0' },
    { name: 'team_size', type: 'integer' }, // 1 for individual events, >1 for team events
    { name: 'status', type: 'text', defaultValue: 'active' }, // active, inactive, cancelled
    { name: 'image_url', type: 'text' },
    { name: 'prize_details', type: 'jsonb' },
    { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamp with time zone' }
  ],
  indexes: [
    { columns: ['category'] },
    { columns: ['status'] }
  ]
};

// Registrations Table
const registrationsTableSchema = {
  name: 'registrations',
  columns: [
    { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()' },
    { name: 'registration_id', type: 'text', isUnique: true }, // User-friendly ID (e.g., INF-2025-12345)
    { name: 'name', type: 'text', isRequired: true },
    { name: 'email', type: 'text', isRequired: true },
    { name: 'phone', type: 'text' },
    { name: 'university', type: 'text' },
    { name: 'events', type: 'jsonb', defaultValue: '[]' }, // Array of event IDs
    { name: 'event_name', type: 'text' }, // Comma-separated list of event names
    { name: 'category', type: 'text' }, // tech, cultural
    { name: 'payment_status', type: 'text', defaultValue: 'pending' }, // pending, paid, rejected, awaiting_payment
    { name: 'payment_id', type: 'uuid', references: 'payments.id' },
    { name: 'payment_proof_url', type: 'text' },
    { name: 'payment_method', type: 'text' }, // qr, venue
    { name: 'team_name', type: 'text' },
    { name: 'team_members', type: 'jsonb', defaultValue: '[]' }, // Array of member names
    { name: 'fee', type: 'numeric', defaultValue: '0' },
    { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamp with time zone' }
  ],
  indexes: [
    { columns: ['registration_id'] },
    { columns: ['email'] },
    { columns: ['payment_status'] },
    { columns: ['created_at'] }
  ]
};

// Payments Table
const paymentsTableSchema = {
  name: 'payments',
  columns: [
    { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()' },
    { name: 'amount', type: 'numeric', isRequired: true },
    { name: 'currency', type: 'text', defaultValue: 'INR' },
    { name: 'status', type: 'text', defaultValue: 'pending' }, // pending, completed, failed, refunded
    { name: 'payment_method', type: 'text' }, // qr, venue, online
    { name: 'transaction_id', type: 'text' },
    { name: 'proof_url', type: 'text' },
    { name: 'proof_path', type: 'text' },
    { name: 'notes', type: 'text' },
    { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamp with time zone' }
  ],
  indexes: [
    { columns: ['status'] },
    { columns: ['created_at'] }
  ]
};

// Participants Table (for tracking individual participants in team events)
const participantsTableSchema = {
  name: 'participants',
  columns: [
    { name: 'id', type: 'uuid', isPrimary: true, defaultValue: 'gen_random_uuid()' },
    { name: 'registration_id', type: 'uuid', references: 'registrations.id' },
    { name: 'event_id', type: 'uuid', references: 'events.id' },
    { name: 'name', type: 'text', isRequired: true },
    { name: 'email', type: 'text' },
    { name: 'status', type: 'text', defaultValue: 'registered' }, // registered, attended, no-show
    { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' }
  ],
  indexes: [
    { columns: ['registration_id'] },
    { columns: ['event_id'] }
  ]
};

// Users Table (for admin access)
const usersTableSchema = {
  name: 'users',
  columns: [
    { name: 'id', type: 'uuid', isPrimary: true, references: 'auth.users.id' },
    { name: 'email', type: 'text', isUnique: true },
    { name: 'full_name', type: 'text' },
    { name: 'role', type: 'text', defaultValue: 'volunteer' }, // admin, manager, volunteer
    { name: 'avatar_url', type: 'text' },
    { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' }
  ],
  indexes: [
    { columns: ['email'] },
    { columns: ['role'] }
  ]
};

// Storage Buckets
const storageBuckets = [
  {
    name: 'payment_proofs',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileSize: '5MB'
  },
  {
    name: 'event_images',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileSize: '5MB'
  }
];

/**
 * Registration Flow:
 * 
 * 1. User selects events on the registration page
 * 2. User fills out personal details and team information if applicable
 * 3. User selects payment method:
 *    - QR Payment: User uploads payment proof which is stored in 'payment_proofs' bucket
 * 4. System creates:
 *    - A payment record (if QR payment) with status 'pending'
 *    - A registration record linking to the payment
 *    - Participant records for the registrant and team members (if applicable)
 * 5. Admin reviews payment proof and updates payment status
 * 6. System notifies user about registration status
 */
