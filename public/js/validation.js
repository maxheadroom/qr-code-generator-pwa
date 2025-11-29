// Validation functions for the QR Generator app

import { isValidUrl, isValidEmail, isValidPhone } from './utils.js';

// Validate form data based on field type
export function validateField(field, value) {
    switch (field.type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                return {
                    valid: false,
                    message: `El campo "${field.label}" debe ser un email válido`
                };
            }
            break;
        case 'url':
            if (value && !isValidUrl(value)) {
                return {
                    valid: false,
                    message: `El campo "${field.label}" debe ser una URL válida`
                };
            }
            break;
        case 'tel':
            if (value && !isValidPhone(value)) {
                return {
                    valid: false,
                    message: `El campo "${field.label}" debe ser un número de teléfono válido`
                };
            }
            break;
        case 'number':
            if (value && (isNaN(value) || value < (field.min || 0))) {
                return {
                    valid: false,
                    message: `El campo "${field.label}" debe ser un número válido`
                };
            }
            break;
    }
    
    return { valid: true };
}

// Validate entire form
export function validateForm(currentQRType, getFormData) {
    try {
        if (!currentQRType) {
            return {
                valid: false,
                message: 'Selecciona un tipo de QR primero'
            };
        }

        const formData = getFormData();

        for (let field of currentQRType.fields) {
            const value = formData[field.name];

            // Check required fields
            if (field.required && (!value || value.trim() === '')) {
                return {
                    valid: false,
                    message: `El campo "${field.label}" es requerido`
                };
            }

            // Type-specific validation
            if (value) {
                const validation = validateField(field, value);
                if (!validation.valid) {
                    return validation;
                }
            }
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            message: 'Error en la validación del formulario'
        };
    }
}

// Sanitize user input
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
}