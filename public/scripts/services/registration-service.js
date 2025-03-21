import { PhotoService } from './photo-service.js';
import { ValidationService } from './validation-service.js';

/**
 * Service for handling event registrations
 */
export class RegistrationService {
    /**
     * Submit a new registration
     * @param {Object} formData - Registration form data
     * @returns {Promise<Object>} - Result of registration operation
     */
    static async submitRegistration(formData) {
        try {
            const supabase = window.supabaseConfig.initSupabase();
            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }
            
            // Validate inputs
            const personalValidation = ValidationService.validatePersonalInfo({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                university: formData.university
            });
            
            if (!personalValidation.valid) {
                return {
                    success: false,
                    error: personalValidation.errors[0]
                };
            }
            
            const eventValidation = ValidationService.validateEventSelection(
                new Set(formData.selectedEvents)
            );
            
            if (!eventValidation.valid) {
                return {
                    success: false,
                    error: eventValidation.errors[0]
                };
            }
            
            if (formData.hasTeamEvents) {
                const teamValidation = ValidationService.validateTeamDetails({
                    hasTeamEvents: formData.hasTeamEvents,
                    teamName: formData.teamName,
                    teamMembers: formData.teamMembers
                });
                
                if (!teamValidation.valid) {
                    return {
                        success: false,
                        error: teamValidation.errors[0]
                    };
                }
            }
            
            const paymentValidation = ValidationService.validatePayment({
                paymentMethod: formData.paymentMethod,
                paymentProof: formData.paymentProof,
                paymentReference: formData.paymentReference
            });
            
            if (!paymentValidation.valid) {
                return {
                    success: false,
                    error: paymentValidation.errors[0]
                };
            }
            
            // Generate registration ID
            const registrationId = `INF-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
            
            // Step 1: Upload payment proof if provided
            let paymentProofUrl = null;
            if (formData.paymentMethod === 'qr' && formData.paymentProof) {                
                const uploadResult = await PhotoService.uploadPhoto(
                    formData.paymentProof,
                    window.supabaseConfig.TABLES.STORAGE.PAYMENT_PROOFS,
                    'payment-proofs',
                    true // optimize image
                );
                
                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || 'Failed to upload payment proof');
                }
                
                paymentProofUrl = uploadResult.url;
            }
            
            // Step 2: Create the registration record
            const { data: registration, error: registrationError } = await supabase
                .from(window.supabaseConfig.TABLES.REGISTRATIONS)
                .insert({
                    registration_id: registrationId,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    university: formData.university,
                    category: formData.category,
                    team_name: formData.teamName || null,
                    payment_method: formData.paymentMethod,
                    payment_status: formData.paymentMethod === 'venue' ? 'pending' : 'completed',
                    total_amount: formData.totalAmount,
                    payment_proof_url: paymentProofUrl,
                    payment_reference: formData.paymentReference || null,
                    created_at: new Date().toISOString()
                })
                .select();
                
            if (registrationError) throw registrationError;
            
            // Step 3: Add selected events
            if (formData.selectedEvents && formData.selectedEvents.length > 0) {
                const eventInserts = formData.selectedEvents.map(eventId => ({
                    registration_id: registrationId,
                    event_id: eventId,
                    created_at: new Date().toISOString()
                }));
                
                const { error: eventsError } = await supabase
                    .from(window.supabaseConfig.TABLES.SELECTED_EVENTS)
                    .insert(eventInserts);
                
                if (eventsError) throw eventsError;
            }
            
            // Step 4: Add team members
            if (formData.teamMembers && formData.teamMembers.length > 0) {
                const teamMembers = formData.teamMembers.map((name, index) => ({
                    registration_id: registrationId,
                    name: name,
                    member_number: index + 1,
                    created_at: new Date().toISOString()
                }));
                
                const { error: teamError } = await supabase
                    .from(window.supabaseConfig.TABLES.TEAM_MEMBERS)
                    .insert(teamMembers);
                
                if (teamError) throw teamError;
            }
            
            return {
                success: true,
                registrationId,
                data: registration
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message || 'Failed to complete registration'
            };
        }
    }
}
