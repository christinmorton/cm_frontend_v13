/**
 * FormSubmissionService.js
 * Handles form submissions to the WPBE Pro Form Submission API
 */

import { guestManager } from '../tracking/GuestManager.js';
import { analytics } from '../tracking/Analytics.js';

// Get API base URL from environment variable, with fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://general-wp.local/wp-json/wpbe/v1';

/**
 * Valid form types as defined in the API
 */
export const FORM_TYPES = {
    CONTACT_FORM: 'contact_form',
    QUICK_MESSAGE: 'quick_message',
    BOOK_A_CALL: 'book_a_call',
    REQUEST_A_QUOTE: 'request_a_quote',
    QUOTE_REQUEST: 'quote_request',
    DISCOVERY_INTAKE: 'discovery_intake',
    NEWSLETTER_SIGNUP: 'newsletter_signup',
    SUPPORT_REQUEST: 'support_request',
    SUPPORT_FORM: 'support_form',
    FAQ_QUESTION: 'faq_question'
};

/**
 * Form Submission Service
 */
export const formSubmissionService = {
    /**
     * Submits a form to the API
     * @param {Object} formData - Form data object
     * @param {string} formData.form_type - Required: Type of form (see FORM_TYPES)
     * @param {string} formData.sender_email - Required: Submitter's email
     * @param {string} [formData.sender_name] - Optional: Full name
     * @param {string} [formData.sender_phone] - Optional: Phone number
     * @param {string} [formData.subject] - Optional: Subject line
     * @param {string} [formData.message] - Optional: Message body
     * @param {Object} [formData.form_data] - Optional: Additional form fields
     * @returns {Promise<Object>} API response with success status and data
     * @throws {Error} If submission fails
     */
    async submit(formData) {
        // Validate required fields
        if (!formData.form_type) {
            throw new Error('Form type is required');
        }
        if (!formData.sender_email) {
            throw new Error('Email is required. Please provide an email address.');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.sender_email.trim())) {
            throw new Error('Please provide a valid email address.');
        }

        // Ensure guest exists BEFORE submission
        // - If no guest exists, creates a new one automatically
        // - If guest exists, validates the token and reuses it
        // - This ensures we always have a guest token to associate with the submission
        const guestId = await guestManager.ensureGuest();
        const guestToken = guestManager.getToken();
        
        // Note: guestId and guestToken may be null if user has opted out of tracking
        // The form will still be submitted, but without guest association

        // Build headers
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add guest token if available (should always be available after ensureGuest)
        if (guestToken) {
            headers['X-Guest-Token'] = guestToken;
        }

        try {
            const response = await fetch(`${API_BASE}/form-submissions`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });

            // Check if response is ok before parsing JSON
            if (!response.ok) {
                // Try to parse error response
                let errorMessage = `Form submission failed (${response.status})`;
                let errorData = null;
                
                try {
                    errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    // If response is not JSON, try to get text
                    try {
                        const text = await response.text();
                        if (text) {
                            errorMessage = text;
                        }
                    } catch (textError) {
                        // If we can't read response, use default message
                        console.error('Failed to parse error response:', textError);
                    }
                }
                
                throw new Error(errorMessage);
            }

            // Parse successful response
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                // If response is not JSON, create a success response
                console.warn('Response was not JSON, treating as success');
                data = {
                    success: true,
                    data: {
                        message: 'Form submitted successfully!'
                    }
                };
            }

            // Track form submission as analytics event (only on success)
            // This associates the submission with the guest for tracking purposes
            if (guestId) {
                analytics.track('form_submit', {
                    form_type: formData.form_type,
                    form_id: formData.form_type, // Use form_type as form_id for consistency
                    submission_success: true
                }, window.location.pathname);
                
                // Flush analytics immediately to ensure event is sent
                analytics.flush();
            }

            return data;
        } catch (error) {
            // Track failed submission attempt (if we have a guest)
            if (guestManager.hasGuest()) {
                analytics.track('form_submit', {
                    form_type: formData.form_type,
                    form_id: formData.form_type,
                    submission_success: false,
                    error: error.message
                }, window.location.pathname);
                analytics.flush();
            }

            // Log error for debugging
            console.error('Form submission error:', {
                formType: formData.form_type,
                error: error.message,
                stack: error.stack
            });

            // Re-throw if it's already an Error with message
            if (error instanceof Error) {
                throw error;
            }
            // Handle network errors
            throw new Error('Network error: Failed to submit form. Please check your connection and try again.');
        }
    },

    /**
     * Helper to extract form data from a FormData object or form element
     * @param {HTMLFormElement|FormData} formOrFormData - Form element or FormData object
     * @param {string} formType - The form type to use
     * @returns {Object} Formatted form data ready for submission
     */
    extractFormData(formOrFormData, formType) {
        let formData;
        
        if (formOrFormData instanceof FormData) {
            formData = formOrFormData;
        } else if (formOrFormData instanceof HTMLFormElement) {
            formData = new FormData(formOrFormData);
        } else {
            throw new Error('Invalid form or FormData provided');
        }

        // Build submission payload
        const payload = {
            form_type: formType
        };

        // Extract standard fields
        const email = formData.get('email') || formData.get('sender_email') || formData.get('e-mail');
        const name = formData.get('name') || formData.get('sender_name') || formData.get('full_name');
        const phone = formData.get('phone') || formData.get('sender_phone') || formData.get('tel');
        const subject = formData.get('subject') || formData.get('title');
        const message = formData.get('message') || formData.get('body') || formData.get('comments');

        // Set required email
        if (email) {
            payload.sender_email = email.trim();
        } else {
            // Log warning if email is missing (will cause validation error)
            console.warn('Form submission: No email field found in form. Form fields:', Array.from(formData.keys()));
        }

        // Set optional fields (only if they have values)
        if (name) payload.sender_name = name.trim();
        if (phone) payload.sender_phone = phone.trim();
        if (subject) payload.subject = subject.trim();
        if (message) payload.message = message.trim();

        // Collect any additional fields into form_data
        const formDataObj = {};
        for (const [key, value] of formData.entries()) {
            // Skip standard fields we've already processed
            const standardFields = ['email', 'sender_email', 'e-mail', 'name', 'sender_name', 'full_name', 
                                 'phone', 'sender_phone', 'tel', 'subject', 'title', 'message', 'body', 'comments'];
            if (!standardFields.includes(key.toLowerCase()) && value) {
                formDataObj[key] = value;
            }
        }

        // Add form_data if there are additional fields
        if (Object.keys(formDataObj).length > 0) {
            payload.form_data = formDataObj;
        }

        return payload;
    },

    /**
     * Submit a lead capture form (alternative to form submissions)
     * @param {Object} leadData - Lead data
     * @param {string} leadData.email - Required: Email address
     * @param {string} [leadData.first_name] - First name
     * @param {string} [leadData.last_name] - Last name
     * @param {string} [leadData.phone] - Phone number
     * @param {string} [leadData.company] - Company name
     * @param {string} [leadData.source] - Lead source (e.g., 'website_contact')
     * @param {string} [leadData.message] - Additional message
     * @returns {Promise<Object>} API response
     */
    async submitLead(leadData) {
        if (!leadData.email) {
            throw new Error('Email is required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(leadData.email.trim())) {
            throw new Error('Please provide a valid email address.');
        }

        const response = await fetch(`${API_BASE}/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to submit lead' }));
            throw new Error(error.message || 'Failed to submit lead');
        }

        return response.json();
    }
};
