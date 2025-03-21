import { supabase, TABLES } from '../../supabase-setup.js';
import { PhotoService } from './services/photo-service.js';

// Database tables constants
export const TABLES = {
    REGISTRATIONS: 'registrations',
    EVENTS: 'events',
    PAYMENTS: 'payments',
    PARTICIPANTS: 'participants',
    STORAGE: {
        PAYMENT_PROOFS: 'payment_proofs'
    }
};

/**
 * Database operations for registrations and events
 */

// Get all events from database
export async function fetchEvents() {
    try {
        const { data, error } = await supabase
            .from(TABLES.EVENTS)
            .select('*');
            
        if (error) throw error;

        // Group events by category
        const groupedEvents = data.reduce((acc, event) => {
            if (!acc[event.category]) {
                acc[event.category] = [];
            }
            acc[event.category].push(event);
            return acc;
        }, {});

        return { success: true, data: groupedEvents };
    } catch (error) {
        console.error('Error fetching events:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Submit registration data to the database
 * @param {Object} registrationData - The registration data to submit
 * @returns {Promise<Object>} - Result of the operation
 */
export async function submitRegistration(registrationData) {
    try {
        // Upload payment proof if QR payment
        let paymentId = null;
        
        if (registrationData.paymentMethod === 'qr' && registrationData.paymentProof) {
            // Upload payment proof using PhotoService
            const uploadResult = await PhotoService.uploadPhoto(
                registrationData.paymentProof,
                TABLES.STORAGE.PAYMENT_PROOFS,
                'payment-proofs',
                true // optimize the image
            );
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Failed to upload payment proof');
            }
            
            // Create payment record
            const { data: paymentData, error: paymentError } = await supabase
                .from(TABLES.PAYMENTS)
                .insert([
                    {
                        amount: registrationData.totalFee,
                        currency: 'INR',
                        status: 'pending',
                        payment_method: 'qr',
                        proof_url: uploadResult.url,
                        proof_path: uploadResult.path,
                        created_at: new Date().toISOString()
                    }
                ])
                .select();
                
            if (paymentError) throw paymentError;
            
            paymentId = paymentData[0].id;
        }
        
        // Generate registration ID
        const registrationId = `INF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        
        // Create registration record
        const { data: registrationResult, error: registrationError } = await supabase
            .from(TABLES.REGISTRATIONS)
            .insert([
                {
                    registration_id: registrationId,
                    name: registrationData.name,
                    email: registrationData.email,
                    phone: registrationData.phone,
                    university: registrationData.university,
                    events: registrationData.selectedEvents,
                    event_name: registrationData.eventNames,
                    payment_status: registrationData.paymentMethod === 'qr' ? 'pending' : 'awaiting_payment',
                    payment_id: paymentId,
                    created_at: new Date().toISOString(),
                    team_name: registrationData.teamName || null,
                    team_members: JSON.stringify(registrationData.teamMembers || []),
                    category: registrationData.category,
                    fee: registrationData.totalFee
                }
            ])
            .select();
            
        if (registrationError) throw registrationError;
        
        // Insert participants for each selected event
        if (registrationResult && registrationResult.length > 0) {
            const registrationId = registrationResult[0].id;
            
            // Create participant records
            const participantPromises = registrationData.selectedEvents.map(async (eventId) => {
                return supabase
                    .from(TABLES.PARTICIPANTS)
                    .insert([
                        {
                            registration_id: registrationId,
                            event_id: eventId,
                            name: registrationData.name,
                            email: registrationData.email,
                            status: 'registered'
                        }
                    ]);
            });
            
            await Promise.all(participantPromises);
        }
        
        return {
            success: true,
            registrationId: registrationResult[0].registration_id,
            data: registrationResult[0]
        };
    } catch (error) {
        console.error('Error submitting registration:', error);
        return {
            success: false,
            error: error.message || 'Failed to submit registration'
        };
    }
}

/**
 * Get registration details by ID
 * @param {string} id - Registration ID or UUID
 * @returns {Promise<Object>} - Registration details
 */
export async function getRegistrationById(id) {
    try {
        // First try to get by registration_id
        const { data: idData, error: idError } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select('*')
            .eq('registration_id', id)
            .maybeSingle();
        
        // If not found, try UUID
        if (!idData && !idError) {
            const { data: uuidData, error: uuidError } = await supabase
                .from(TABLES.REGISTRATIONS)
                .select('*')
                .eq('id', id)
                .single();
                
            if (uuidError) throw uuidError;
            return { success: true, data: uuidData };
        }
        
        if (idError) throw idError;
        return { success: true, data: idData };
    } catch (error) {
        console.error('Error fetching registration:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch registration'
        };
    }
}

/**
 * Update registration payment status
 * @param {string} id - Registration ID
 * @param {string} status - New payment status
 * @returns {Promise<Object>} - Result of the operation
 */
export async function updatePaymentStatus(id, status) {
    try {
        const { error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .update({ 
                payment_status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
            
        if (error) throw error;
        
        return { success: true };
    } catch (error) {
        console.error('Error updating payment status:', error);
        return {
            success: false,
            error: error.message || 'Failed to update payment status'
        };
    }
}

/**
 * Upload payment proof to Supabase storage
 */
export async function uploadPaymentProof(file) {
    try {
        if (!file) {
            throw new Error('No file selected');
        }
        
        // Create a unique file path
        const timestamp = new Date().getTime();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = `payment-proofs/${timestamp}-${sanitizedFilename}`;
        
        // Upload file
        const { data, error } = await supabase.storage
            .from(TABLES.STORAGE.PAYMENT_PROOFS)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
            
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from(TABLES.STORAGE.PAYMENT_PROOFS)
            .getPublicUrl(filePath);
            
        return {
            success: true,
            path: filePath,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('Error uploading payment proof:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload payment proof'
        };
    }
}

/**
 * Get events from the database
 */
export async function getEvents(category = null) {
    try {
        let query = supabase
            .from(TABLES.EVENTS)
            .select('*')
            .eq('status', 'active');
            
        if (category) {
            query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('Error fetching events:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch events'
        };
    }
}

/**
 * Verify that the database is properly configured
 */
export async function verifyDatabaseSetup() {
    try {
        // Simple check if we can connect to Supabase
        const { data, error } = await supabase
            .from('events')
            .select('id')
            .limit(1);
            
        if (error) throw error;
        
        return {
            success: true,
            connected: true
        };
    } catch (error) {
        console.error('Database verification error:', error);
        return {
            success: false,
            connected: false,
            error: error.message || 'Failed to verify database setup'
        };
    }
}

/**
 * Verify that the Supabase client is properly initialized
 */
export async function testConnection() {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        // Even if not logged in, this should return a valid response
        return { 
            success: !error,
            error: error?.message
        };
    } catch (error) {
        console.error('Connection test error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all registrations with optional filtering and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query result
 */
export async function getRegistrations(options = {}) {
    try {
        let query = supabase
            .from(TABLES.REGISTRATIONS)
            .select('*');

        // Apply filters if provided
        if (options.category) {
            query = query.eq('category', options.category);
        }

        if (options.payment_status) {
            query = query.eq('payment_status', options.payment_status);
        }

        if (options.search) {
            query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%,university.ilike.%${options.search}%`);
        }

        // Apply sorting
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
}

/**
 * Save registration data to the database
 * @param {Object} registrationData - The registration data to submit
 * @returns {Promise<Object>} - Result of the operation
 */
export async function saveRegistration(registrationData) {
    try {
        // Upload payment proof if QR payment
        let paymentProofUrl = null;
        
        if (registrationData.paymentMethod === 'qr' && registrationData.paymentProof) {
            const file = registrationData.paymentProof;
            const fileExt = file.name.split('.').pop();
            const fileName = `${registrationData.id}.${fileExt}`;
            
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from(TABLES.STORAGE.PAYMENT_PROOFS)
                .upload(fileName, file);
                
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage
                .from(TABLES.STORAGE.PAYMENT_PROOFS)
                .getPublicUrl(fileName);
                
            paymentProofUrl = urlData.publicUrl;
        }
        
        // Insert registration record
        const { data: registrationResult, error: registrationError } = await supabase
            .from(TABLES.REGISTRATIONS)
            .insert([{
                id: registrationData.id,
                name: registrationData.name,
                email: registrationData.email,
                phone: registrationData.phone,
                university: registrationData.university,
                category: registrationData.category,
                team_name: registrationData.team_name || null,
                payment_method: registrationData.paymentMethod,
                payment_status: registrationData.paymentMethod === 'venue' ? 'pending' : 'completed',
                total_amount: registrationData.totalAmount,
                payment_proof_url: paymentProofUrl,
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (registrationError) throw registrationError;
        
        // Insert selected events
        if (registrationData.selectedEvents && registrationData.selectedEvents.length > 0) {
            const eventInserts = registrationData.selectedEvents.map(eventId => ({
                registration_id: registrationData.id,
                event_id: eventId,
                created_at: new Date().toISOString()
            }));
            
            const { error: eventsError } = await supabase
                .from(TABLES.SELECTED_EVENTS)
                .insert(eventInserts);
            
            if (eventsError) throw eventsError;
        }
        
        // Insert team members if applicable
        if (registrationData.teamMembers && registrationData.teamMembers.length > 0) {
            const teamMemberInserts = registrationData.teamMembers.map((member, index) => ({
                registration_id: registrationData.id,
                name: member,
                member_number: index + 1,
                created_at: new Date().toISOString()
            }));
            
            const { error: teamError } = await supabase
                .from(TABLES.TEAM_MEMBERS)
                .insert(teamMemberInserts);
            
            if (teamError) throw teamError;
        }
        
        return {
            success: true,
            data: registrationResult[0]
        };
    } catch (error) {
        console.error('Error saving registration:', error);
        return {
            success: false,
            error: error.message || 'Failed to save registration'
        };
    }
}
