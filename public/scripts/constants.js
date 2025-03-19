/**
 * Application constants
 */

// Database tables
export const TABLES = {
    EVENTS: 'events',
    REGISTRATIONS: 'registrations',
    PAYMENTS: 'payments',
    PARTICIPANTS: 'participants',
    CONTACT_MESSAGES: 'contact_messages',
    USERS: 'users'
};

// Storage buckets
export const STORAGE = {
    PAYMENT_PROOFS: 'payment_proofs',
    EVENT_IMAGES: 'event_images',
    PROFILE_PHOTOS: 'profile_photos'
};

// Payment status values
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    REJECTED: 'rejected',
    AWAITING_PAYMENT: 'awaiting_payment'
};

// Event categories
export const EVENT_CATEGORIES = {
    TECH: 'tech',
    CULTURAL: 'cultural'
};

// Event status values
export const EVENT_STATUS = {
    ACTIVE: 'active',
    UPCOMING: 'upcoming',
    COMPLETED: 'completed',
    INACTIVE: 'inactive'
};

// API endpoints for future use
export const API = {
    BASE_URL: '/api',
    EVENTS: '/api/events',
    REGISTRATIONS: '/api/registrations',
    PAYMENTS: '/api/payments',
    AUTH: '/api/auth'
};

// Environment variables
export const ENV = {
    PRODUCTION: process.env.NODE_ENV === 'production',
    DEVELOPMENT: process.env.NODE_ENV === 'development',
    EVENT_DATE: process.env.EVENT_DATE || 'Mar 27, 2025 09:00:00',
    REGISTRATION_DEADLINE: process.env.REGISTRATION_DEADLINE || 'Mar 26, 2025 23:59:59'
};

// Form validation patterns
export const VALIDATION = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Application routes
export const ROUTES = {
    HOME: '/',
    TECH_EVENTS: '/pages/tech.html',
    CULTURAL_EVENTS: '/pages/cultural.html',
    REGISTER: '/pages/register.html',
    CONTACT: '/pages/contact.html',
    CONFIRMATION: '/pages/confirmation.html',
    ADMIN: {
        LOGIN: '/admin/login.html',
        DASHBOARD: '/admin/dashboard.html',
        EVENTS: '/admin/events/index.html',
        REGISTRATIONS: '/admin/registrations/index.html',
        PAYMENTS: '/admin/payments/index.html',
        SETTINGS: '/admin/settings/index.html'
    }
};
