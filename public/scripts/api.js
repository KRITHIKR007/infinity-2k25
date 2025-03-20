/**
 * API Client for Infinity 2025 website
 * Handles all API calls to the Supabase backend
 */
import { supabase } from '../../supabase.js';

// Constants
const API_VERSION = 'v1';
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

// API endpoints and handlers
const api = {
    // Events API
    events: {
        /**
         * Get all events
         * @param {Object} options - Query options
         * @returns {Promise<Object>} - Response with events data
         */
        getAll: async (options = {}) => {
            try {
                let query = supabase.from('events').select('*');
                
                // Apply filters
                if (options.category) {
                    query = query.eq('category', options.category);
                }
                
                if (options.status) {
                    query = query.eq('status', options.status);
                }
                
                // Apply sorting
                const orderBy = options.orderBy || 'created_at';
                const ascending = options.ascending !== undefined ? options.ascending : false;
                query = query.order(orderBy, { ascending });
                
                // Execute query
                const { data, error } = await query;
                
                if (error) throw error;
                
                return {
                    success: true,
                    data
                };
            } catch (error) {
                console.error('API Error - getEvents:', error);
                return {
                    success: false,
                    error: error.message || DEFAULT_ERROR_MESSAGE
                };
            }
        },
        
        /**
         * Get a single event by ID
         * @param {string} id - Event ID
         * @returns {Promise<Object>} - Response with event data
         */
        getById: async (id) => {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', id)
                    .single();
                    
                if (error) throw error;
                
                return {
                    success: true,
                    data
                };
            } catch (error) {
                console.error(`API Error - getEvent(${id}):`, error);
                return {
                    success: false,
                    error: error.message || DEFAULT_ERROR_MESSAGE
                };
            }
        }
    },
    
    // Registrations API
    registrations: {
        /**
         * Create a new registration
         * @param {Object} registrationData - Registration data
         * @returns {Promise<Object>} - Response with registration result
         */
        create: async (registrationData) => {
            try {
                // Handle file upload if provided
                let paymentProofUrl = null;
                let paymentId = null;
                
                if (registrationData.paymentProof && registrationData.paymentMethod === 'qr') {
                    // Upload payment proof
                    const timestamp = new Date().getTime();
                    const filePath = `payment-proofs/${timestamp}-${registrationData.paymentProof.name}`;
                    
                    const { error: uploadError, data: uploadData } = await supabase.storage
                        .from('payment_proofs')
                        .upload(filePath, registrationData.paymentProof, {
                            cacheControl: '3600',
                            upsert: false
                        });
                        
                    if (uploadError) throw uploadError;
                    
                    // Get public URL
                    const { data: urlData } = supabase.storage
                        .from('payment_proofs')
                        .getPublicUrl(filePath);
                        
                    paymentProofUrl = urlData.publicUrl;
                    
                    // Create payment record
                    const { data: paymentData, error: paymentError } = await supabase
                        .from('payments')
                        .insert([{
                            amount: registrationData.fee || 0,
                            currency: 'INR',
                            status: 'pending',
                            payment_method: registrationData.paymentMethod,
                            proof_url: paymentProofUrl,
                            proof_path: filePath,
                            created_at: new Date().toISOString()
                        }])
                        .select();
                        
                    if (paymentError) throw paymentError;
                    
                    paymentId = paymentData[0].id;
                }
                
                // Generate unique registration ID
                const registrationId = `INF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
                
                // Create registration
                const { data, error } = await supabase
                    .from('registrations')
                    .insert([{
                        registration_id: registrationId,
                        name: registrationData.name,
                        email: registrationData.email,
                        phone: registrationData.phone,
                        university: registrationData.university,
                        events: registrationData.selectedEvents || [],
                        event_name: registrationData.eventNames || '',
                        payment_status: registrationData.paymentMethod === 'qr' ? 'pending' : 'awaiting_payment',
                        payment_id: paymentId,
                        payment_proof_url: paymentProofUrl,
                        payment_method: registrationData.paymentMethod,
                        created_at: new Date().toISOString(),
                        category: registrationData.category || '',
                        team_name: registrationData.teamName || null,
                        team_members: JSON.stringify(registrationData.teamMembers || []),
                        fee: registrationData.fee || 0
                    }])
                    .select();
                    
                if (error) throw error;
                
                return {
                    success: true,
                    data: data[0]
                };
            } catch (error) {
                console.error('API Error - createRegistration:', error);
                return {
                    success: false,
                    error: error.message || DEFAULT_ERROR_MESSAGE
                };
            }
        },
        
        /**
         * Get a registration by ID
         * @param {string} id - Registration ID or UUID
         * @returns {Promise<Object>} - Response with registration data
         */
        getById: async (id) => {
            try {
                // First try to find by registration_id
                const { data: regIdData, error: regIdError } = await supabase
                    .from('registrations')
                    .select('*')
                    .eq('registration_id', id)
                    .maybeSingle();
                
                if (regIdError) throw regIdError;
                
                // If not found by registration_id, try by UUID
                if (!regIdData) {
                    const { data: uuidData, error: uuidError } = await supabase
                        .from('registrations')
                        .select('*')
                        .eq('id', id)
                        .single();
                        
                    if (uuidError) throw uuidError;
                    return { success: true, data: uuidData };
                }
                
                return { success: true, data: regIdData };
            } catch (error) {
                console.error(`API Error - getRegistration(${id}):`, error);
                return {
                    success: false,
                    error: error.message || DEFAULT_ERROR_MESSAGE
                };
            }
        }
    },
    
    // Authentication API
    auth: {
        /**
         * Log in with email and password
         * @param {string} email - User email
         * @param {string} password - User password
         * @returns {Promise<Object>} - Auth response
         */
        login: async (email, password) => {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                return {
                    success: true,
                    data
                };
            } catch (error) {
                console.error('API Error - login:', error);
                return {
                    success: false,
                    error: error.message || DEFAULT_ERROR_MESSAGE
                };
            }
        },
        
        /**
         * Log out the current user
         * @returns {Promise<Object>} - Logout response
         */
        logout: async () => {
            try {
                const { error } = await supabase.auth.signOut();
                
                if (error) throw error;
                
                return {
                    success: true
                };
            } catch (error) {
                console.error('API Error - logout:', error);
                return {
                    success: false,
                    error: error.message || DEFAULT_ERROR_MESSAGE
                };
            }
        },
        
        /**
         * Get current session
         * @returns {Promise<Object>} - Session data
         */
        getSession: async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                
                if (error) throw error;
                
                return {
                    success: true,
                    data
                };
            } catch (error) {
                console.error('API Error - getSession:', error);
                return {
                    success: false,
                    error: error.message || DEFAULT_ERROR_MESSAGE
                };
            }
        }
    }
};

export default api;
