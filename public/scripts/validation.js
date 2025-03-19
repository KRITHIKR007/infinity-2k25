/**
 * Validation utility for forms
 */

// Validation rules
export const validators = {
    required: (value) => {
        return value && value.toString().trim() !== '' 
            ? { valid: true } 
            : { valid: false, message: 'This field is required' };
    },
    
    email: (value) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(value) 
            ? { valid: true } 
            : { valid: false, message: 'Please enter a valid email address' };
    },
    
    phone: (value) => {
        // Basic validation for international phone numbers
        const regex = /^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
        return regex.test(value) 
            ? { valid: true } 
            : { valid: false, message: 'Please enter a valid phone number' };
    },
    
    minLength: (length) => (value) => {
        return value && value.length >= length 
            ? { valid: true } 
            : { valid: false, message: `Must be at least ${length} characters` };
    },
    
    maxLength: (length) => (value) => {
        return value && value.length <= length 
            ? { valid: true } 
            : { valid: false, message: `Must be no more than ${length} characters` };
    },
    
    match: (field, fieldName) => (value, formData) => {
        return value === formData[field] 
            ? { valid: true } 
            : { valid: false, message: `Must match ${fieldName}` };
    },
    
    number: (value) => {
        return !isNaN(parseFloat(value)) && isFinite(value) 
            ? { valid: true } 
            : { valid: false, message: 'Please enter a valid number' };
    },
    
    minimum: (min) => (value) => {
        return parseFloat(value) >= min 
            ? { valid: true } 
            : { valid: false, message: `Must be at least ${min}` };
    },
    
    maximum: (max) => (value) => {
        return parseFloat(value) <= max 
            ? { valid: true } 
            : { valid: false, message: `Must be no more than ${max}` };
    }
};

/**
 * Validate a form against a set of rules
 * @param {Object} formData - Object containing form data
 * @param {Object} rules - Object with field names and array of validation rules
 * @returns {Object} - Object with isValid flag and errors object
 */
export function validateForm(formData, rules) {
    const errors = {};
    let isValid = true;
    
    for (const field in rules) {
        const fieldRules = rules[field];
        const value = formData[field];
        
        for (const rule of fieldRules) {
            const result = rule(value, formData);
            
            if (!result.valid) {
                errors[field] = result.message;
                isValid = false;
                break;
            }
        }
    }
    
    return { isValid, errors };
}

/**
 * Validate a single field against a set of rules
 * @param {*} value - Field value
 * @param {Array} rules - Array of validation rules
 * @param {Object} formData - Optional form data for cross-field validation
 * @returns {Object} - Validation result with valid flag and error message
 */
export function validateField(value, rules, formData = {}) {
    for (const rule of rules) {
        const result = rule(value, formData);
        
        if (!result.valid) {
            return result;
        }
    }
    
    return { valid: true };
}
