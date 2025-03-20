/**
 * Form validation utility functions
 */

// Email validation
export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        valid: regex.test(email),
        message: 'Please enter a valid email address'
    };
}

// Required field validation
export function validateRequired(value, fieldName = 'This field') {
    return {
        valid: value !== null && value !== undefined && value.toString().trim() !== '',
        message: `${fieldName} is required`
    };
}

// Phone number validation (accepts international formats)
export function validatePhone(phone) {
    // Basic international phone number validation
    const regex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return {
        valid: regex.test(phone.replace(/\s/g, '')),
        message: 'Please enter a valid phone number'
    };
}

// Number validation
export function validateNumber(value, min = null, max = null) {
    const num = parseFloat(value);
    const isNumber = !isNaN(num);
    
    if (!isNumber) {
        return {
            valid: false,
            message: 'Please enter a valid number'
        };
    }
    
    if (min !== null && num < min) {
        return {
            valid: false,
            message: `Value must be at least ${min}`
        };
    }
    
    if (max !== null && num > max) {
        return {
            valid: false,
            message: `Value must be no more than ${max}`
        };
    }
    
    return {
        valid: true,
        message: ''
    };
}

// Length validation
export function validateLength(value, minLength = null, maxLength = null) {
    if (minLength !== null && value.length < minLength) {
        return {
            valid: false,
            message: `Must be at least ${minLength} characters`
        };
    }
    
    if (maxLength !== null && value.length > maxLength) {
        return {
            valid: false,
            message: `Cannot exceed ${maxLength} characters`
        };
    }
    
    return {
        valid: true,
        message: ''
    };
}

// Form validation (validates multiple fields)
export function validateForm(formData, validationRules) {
    const errors = {};
    let isValid = true;
    
    // For each field with validation rules
    Object.keys(validationRules).forEach(field => {
        // Get the field value
        const value = formData[field];
        
        // Get the validation functions for this field
        const validations = validationRules[field];
        
        // Apply each validation function
        for (const { validate, params = [], message } of validations) {
            // Run the validation function with value and optional params
            const result = validate(value, ...params);
            
            // If validation fails
            if (!result.valid) {
                errors[field] = message || result.message;
                isValid = false;
                break; // Stop checking this field after first error
            }
        }
    });
    
    return { isValid, errors };
}

// Helper to show validation errors in the UI
export function displayValidationErrors(errors, errorElementPrefix = '') {
    // Hide all error messages first
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show relevant error messages
    Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${errorElementPrefix}${field}Error`);
        if (errorElement) {
            errorElement.textContent = errors[field];
            errorElement.classList.remove('hidden');
        }
    });
}
