/**
 * Service for validating form inputs
 */
export class ValidationService {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - Whether email is valid
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Validate phone number format (10 digits)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} - Whether phone is valid
     */
    static isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    }
    
    /**
     * Validate personal information
     * @param {Object} data - Personal information data
     * @returns {Object} - Validation result with errors if any
     */
    static validatePersonalInfo(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length === 0) {
            errors.push('Please enter your full name');
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!data.phone || !this.isValidPhone(data.phone)) {
            errors.push('Please enter a valid 10-digit phone number');
        }
        
        if (!data.university || data.university.trim().length === 0) {
            errors.push('Please enter your university/college name');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validate event selection
     * @param {Set} selectedEvents - Set of selected event IDs
     * @returns {Object} - Validation result with errors if any
     */
    static validateEventSelection(selectedEvents) {
        const errors = [];
        
        if (!selectedEvents || selectedEvents.size === 0) {
            errors.push('Please select at least one event');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validate team details
     * @param {Object} data - Team details data
     * @returns {Object} - Validation result with errors if any
     */
    static validateTeamDetails(data) {
        const errors = [];
        
        if (data.hasTeamEvents) {
            if (!data.teamName || data.teamName.trim().length === 0) {
                errors.push('Please enter a team name');
            }
            
            if (data.teamMembers) {
                data.teamMembers.forEach((member, index) => {
                    if (!member || member.trim().length === 0) {
                        errors.push(`Please enter a name for team member ${index + 1}`);
                    }
                });
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validate payment details
     * @param {Object} data - Payment details data
     * @returns {Object} - Validation result with errors if any
     */
    static validatePayment(data) {
        const errors = [];
        
        if (!data.paymentMethod) {
            errors.push('Please select a payment method');
        }
        
        if (data.paymentMethod === 'qr' && !data.paymentProof) {
            errors.push('Please upload payment proof (screenshot)');
        }
        
        if (data.paymentMethod === 'qr' && !data.paymentReference) {
            errors.push('Please enter the payment reference or transaction ID');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validate file upload
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     * @returns {Object} - Validation result with errors if any
     */
    static validateFileUpload(file, options = {}) {
        const errors = [];
        const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
        const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/jpg'];
        
        if (!file) {
            errors.push('Please select a file to upload');
            return {
                valid: false,
                errors
            };
        }
        
        if (file.size > maxSize) {
            errors.push(`File size exceeds the maximum allowed size (${maxSize / (1024 * 1024)}MB)`);
        }
        
        if (!allowedTypes.includes(file.type)) {
            errors.push(`File type not allowed. Accepted types: ${allowedTypes.join(', ')}`);
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
