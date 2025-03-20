import { supabase, TABLES } from '../../supabase.js';
import { PhotoService } from './services/photo-service.js';

/**
 * Registrations module for handling registration-related operations
 */
export const registrations = {
    /**
     * Get all registrations with optional filtering
     * @param {Object} options - Filter options
     * @returns {Promise<Object>} - Query result
     */
    getAll: async (options = {}) => {
        try {
            let query = supabase
                .from(TABLES.REGISTRATIONS)
                .select('*');
                
            // Apply filters if provided
            if (options.category) {
                query = query.eq('category', options.category);
            }
            
            if (options.paymentStatus) {
                query = query.eq('payment_status', options.paymentStatus);
            }
            
            if (options.search) {
                query = query.or(
                    `name.ilike.%${options.search}%,email.ilike.%${options.search}%,university.ilike.%${options.search}%,registration_id.ilike.%${options.search}%`
                );
            }
            
            if (options.orderBy) {
                query = query.order(options.orderBy.column, { 
                    ascending: options.orderBy.ascending 
                });
            } else {
                // Default ordering by created_at (newest first)
                query = query.order('created_at', { ascending: false });
            }
            
            // Apply pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }
            
            const { data, error, count } = await query;
            
            if (error) throw error;
            return { data, count, error: null };
        } catch (error) {
            console.error('Error fetching registrations:', error);
            return { data: null, count: 0, error };
        }
    },
    
    /**
     * Get a registration by ID
     * @param {string} id - Registration ID
     * @returns {Promise<Object>} - Query result
     */
    getById: async (id) => {
        try {
            // First try to find by registration_id
            const { data: regIdData, error: regIdError } = await supabase
                .from(TABLES.REGISTRATIONS)
                .select('*')
                .eq('registration_id', id)
                .maybeSingle();
            
            if (regIdError) throw regIdError;
            
            // If not found by registration_id, try by UUID
            if (!regIdData) {
                const { data: uuidData, error: uuidError } = await supabase
                    .from(TABLES.REGISTRATIONS)
                    .select('*')
                    .eq('id', id)
                    .single();
                    
                if (uuidError) throw uuidError;
                return { data: uuidData, error: null };
            }
            
            return { data: regIdData, error: null };
        } catch (error) {
            console.error('Error fetching registration:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Create a new registration
     * @param {Object} registrationData - Registration data
     * @returns {Promise<Object>} - Query result
     */
    create: async (registrationData) => {
        try {
            // Validate required fields
            if (!registrationData.name || !registrationData.email) {
                throw new Error('Name and email are required');
            }
            
            // Generate a user-friendly registration ID
            const registrationId = `INF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
            
            // Handle payment proof upload if provided
            let paymentProofUrl = null;
            let paymentId = null;
            
            if (registrationData.paymentProof && registrationData.paymentMethod === 'qr') {
                const uploadResult = await PhotoService.uploadPhoto(
                    registrationData.paymentProof,
                    'payment_proofs',
                    'payment-proofs',
                    true // Optimize the image
                );
                
                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || 'Failed to upload payment proof');
                }
                
                paymentProofUrl = uploadResult.url;
                
                // Create payment record
                const { data: paymentData, error: paymentError } = await supabase
                    .from(TABLES.PAYMENTS)
                    .insert([{
                        amount: registrationData.fee || 0,
                        currency: 'INR',
                        status: 'pending',
                        payment_method: registrationData.paymentMethod,
                        proof_url: paymentProofUrl,
                        proof_path: uploadResult.path,
                        created_at: new Date().toISOString()
                    }])
                    .select();
                    
                if (paymentError) throw paymentError;
                
                paymentId = paymentData[0].id;
            }
            
            // Create registration record
            const { data, error } = await supabase
                .from(TABLES.REGISTRATIONS)
                .insert([{
                    registration_id: registrationId,
                    name: registrationData.name,
                    email: registrationData.email,
                    phone: registrationData.phone,
                    university: registrationData.university,
                    events: registrationData.events || [],
                    event_name: registrationData.eventName || '',
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
            
            return { data, error: null };
        } catch (error) {
            console.error('Error creating registration:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Update payment status of a registration
     * @param {string} id - Registration ID
     * @param {string} status - New payment status
     * @returns {Promise<Object>} - Query result
     */
    updatePaymentStatus: async (id, status) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.REGISTRATIONS)
                .update({
                    payment_status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();
                
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating payment status:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Get registrations for an event
     * @param {string} eventId - Event ID
     * @returns {Promise<Object>} - Query result
     */
    getByEvent: async (eventId) => {
        try {
            const { data, error } = await supabase
                .from(TABLES.REGISTRATIONS)
                .select('*')
                .filter('events', 'cs', `{"${eventId}"}`)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching event registrations:', error);
            return { data: null, error };
        }
    },
    
    /**
     * Get pending payment registrations
     * @returns {Promise<Object>} - Query result
     */
    getPendingPayments: async () => {
        return await registrations.getAll({ paymentStatus: 'pending' });
    },
    
    /**
     * Get confirmed payment registrations
     * @returns {Promise<Object>} - Query result
     */
    getConfirmedPayments: async () => {
        return await registrations.getAll({ paymentStatus: 'paid' });
    },
    
    /**
     * Count registrations by category
     * @returns {Promise<Object>} - Registration counts by category
     */
    countByCategory: async () => {
        try {
            const { data: techData, error: techError } = await supabase
                .from(TABLES.REGISTRATIONS)
                .select('id', { count: 'exact', head: true })
                .eq('category', 'tech');
                
            if (techError) throw techError;
            
            const { data: culturalData, error: culturalError } = await supabase
                .from(TABLES.REGISTRATIONS)
                .select('id', { count: 'exact', head: true })
                .eq('category', 'cultural');
                
            if (culturalError) throw culturalError;
            
            return { 
                tech: techData.count || 0,
                cultural: culturalData.count || 0,
                error: null
            };
        } catch (error) {
            console.error('Error counting registrations by category:', error);
            return { 
                tech: 0,
                cultural: 0,
                error
            };
        }
    }
};
