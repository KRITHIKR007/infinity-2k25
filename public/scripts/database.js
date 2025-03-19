import { supabase, TABLES } from '../../supabase.js';
import { PhotoService } from './services/photo-service.js';

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

// Submit a new registration
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
        
        // Create registration record
        const { data: registrationResult, error: registrationError } = await supabase
            .from(TABLES.REGISTRATIONS)
            .insert([
                {
                    name: registrationData.name,
                    email: registrationData.email,
                    phone: registrationData.phone,
                    university: registrationData.university,
                    events: JSON.stringify(registrationData.selectedEvents),
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
            registrationId: registrationResult[0].id
        };
    } catch (error) {
        console.error('Error submitting registration:', error);
        return {
            success: false,
            error: error.message || 'Failed to submit registration'
        };
    }
}

// Get registration details by ID
export async function getRegistrationById(registrationId) {
    try {
        const { data, error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .select('*')
            .eq('id', registrationId)
            .single();
            
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching registration:', error);
        return { success: false, error: error.message };
    }
}

// Update payment status
export async function updatePaymentStatus(registrationId, status) {
    try {
        const { data, error } = await supabase
            .from(TABLES.REGISTRATIONS)
            .update({ payment_status: status })
            .eq('id', registrationId)
            .select();
            
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        console.error('Error updating payment status:', error);
        return { success: false, error: error.message };
    }
}
