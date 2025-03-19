import { verifyDatabaseSetup } from './public/scripts/database.js';

/**
 * Initialize the application
 * This checks the database connection and configuration
 */
export async function initializeApp() {
    console.log('Initializing application...');
    
    try {
        // Verify database setup
        const dbSetup = await verifyDatabaseSetup();
        
        if (!dbSetup.success || !dbSetup.connected) {
            console.error('Database connection failed:', dbSetup.error);
            return {
                success: false,
                error: 'Database connection failed. Please check your configuration.'
            };
        }
        
        console.log('Database connection successful');
        
        // Check required tables and storage buckets
        if (!dbSetup.tables.events || !dbSetup.tables.registrations) {
            console.error('Required database tables are missing');
            return {
                success: false,
                error: 'Required database tables are missing. Please run the database setup script.'
            };
        }
        
        if (!dbSetup.storage.paymentProofs) {
            console.error('Required storage buckets are missing');
            return {
                success: false,
                error: 'Required storage buckets are missing. Please create the "payment_proofs" bucket in Supabase storage.'
            };
        }
        
        console.log('Application initialization complete');
        return {
            success: true,
            message: 'Application initialized successfully'
        };
        
    } catch (error) {
        console.error('Initialization error:', error);
        return {
            success: false,
            error: error.message || 'Failed to initialize application'
        };
    }
}

// Run initialization on page load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const result = await initializeApp();
        
        if (!result.success) {
            // Show initialization error
            const appRoot = document.querySelector('main') || document.body;
            const errorContainer = document.createElement('div');
            errorContainer.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50';
            errorContainer.innerHTML = `
                <div class="bg-gray-900 p-6 rounded-lg max-w-md text-center">
                    <h2 class="text-xl font-bold text-red-400 mb-4">Application Error</h2>
                    <p class="text-white mb-6">${result.error}</p>
                    <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" onclick="location.reload()">
                        Retry
                    </button>
                </div>
            `;
            appRoot.appendChild(errorContainer);
        }
    });
}
