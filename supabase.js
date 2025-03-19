// Initialize Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://ceickbodqhwfhcpabfdq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWNrYm9kcWh3ZmhjcGFiZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2MTgsImV4cCI6MjA1NzkxMTYxOH0.ZyTG1FkQzjQ0CySlyvkQEYPHWBbZJd--vsB_IqILuo8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define database tables and constants
export const TABLES = {
    USERS: 'users',
    EVENTS: 'events',
    REGISTRATIONS: 'registrations',
    TEAMS: 'teams',
    PARTICIPANTS: 'participants',
    PAYMENTS: 'payments',
    NOTIFICATIONS: 'notifications',
    CONTACTS: 'contacts'
}

// Define storage buckets
export const STORAGE = {
    AVATARS: 'avatars',
    PAYMENTS: 'payment_proofs',
    EVENTS: 'event_images'
}

// Define authentication constants
export const AUTH = {
    ROLES: {
        ADMIN: 'admin',
        USER: 'user',
        ORGANIZER: 'organizer'
    }
}

// Define common validations
export const VALIDATIONS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[0-9]{10}$/,
    PASSWORD: {
        MIN_LENGTH: 8,
        REQUIRES_UPPERCASE: true,
        REQUIRES_NUMBER: true,
        REQUIRES_SPECIAL: true
    }
}

// Define event categories
export const EVENT_CATEGORIES = {
    TECH: 'tech',
    CULTURAL: 'cultural'
}

// Define payment statuses
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    REJECTED: 'rejected'
}

// Define payment methods
export const PAYMENT_METHODS = {
    UPI: 'upi',
    CARD: 'card',
    NETBANKING: 'netbanking',
    CASH: 'cash'
}

// Define registration statuses
export const REGISTRATION_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
    WAITLISTED: 'waitlisted',
    CANCELLED: 'cancelled'
}

// Define notification types
export const NOTIFICATION_TYPES = {
    REGISTRATION: 'registration',
    PAYMENT: 'payment',
    ANNOUNCEMENT: 'announcement',
    REMINDER: 'reminder'
}

// Define API responses
export const API_RESPONSES = {
    SUCCESS: { status: 200, message: 'Success' },
    CREATED: { status: 201, message: 'Created successfully' },
    BAD_REQUEST: { status: 400, message: 'Bad request' },
    UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
    FORBIDDEN: { status: 403, message: 'Forbidden' },
    NOT_FOUND: { status: 404, message: 'Not found' },
    SERVER_ERROR: { status: 500, message: 'Server error' }
}

/**
 * Helper functions to interact with Supabase
 */

// Authentication functions
export const auth = {
    // Register a new user
    async signUp(email, password, userData = {}) {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
    },

    // Sign in a user
    async signIn(email, password) {
        return await supabase.auth.signInWithPassword({
            email,
            password
        });
    },

    // Sign out the current user
    async signOut() {
        return await supabase.auth.signOut();
    },

    // Get the current user
    async getCurrentUser() {
        return await supabase.auth.getUser();
    },

    // Reset password
    async resetPassword(email) {
        return await supabase.auth.resetPasswordForEmail(email);
    }
}

// Database functions
export const db = {
    // Insert a new record
    async insert(table, data) {
        return await supabase.from(table).insert(data);
    },

    // Get records with optional filters
    async get(table, columns = '*', filters = {}) {
        let query = supabase.from(table).select(columns);

        // Apply filters if any
        for (const [key, value] of Object.entries(filters)) {
            if (typeof value === 'object' && value !== null) {
                query = query[value.operator || 'eq'](key, value.value);
            } else {
                query = query.eq(key, value);
            }
        }

        return await query;
    },

    // Update records with filters
    async update(table, data, filters = {}) {
        let query = supabase.from(table).update(data);

        // Apply filters if any
        for (const [key, value] of Object.entries(filters)) {
            if (typeof value === 'object' && value !== null) {
                query = query[value.operator || 'eq'](key, value.value);
            } else {
                query = query.eq(key, value);
            }
        }

        return await query;
    },

    // Delete records with filters
    async delete(table, filters = {}) {
        let query = supabase.from(table).delete();

        // Apply filters if any
        for (const [key, value] of Object.entries(filters)) {
            if (typeof value === 'object' && value !== null) {
                query = query[value.operator || 'eq'](key, value.value);
            } else {
                query = query.eq(key, value);
            }
        }

        return await query;
    }
}

// Storage functions
export const storage = {
    // Upload a file
    async upload(bucket, filePath, file) {
        return await supabase.storage.from(bucket).upload(filePath, file);
    },

    // Get public URL for a file
    getPublicUrl(bucket, filePath) {
        return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
    },

    // Remove a file
    async remove(bucket, filePath) {
        return await supabase.storage.from(bucket).remove([filePath]);
    }
} 