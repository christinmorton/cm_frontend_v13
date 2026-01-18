/**
 * formHandler.js
 * Utility functions for handling form submissions with the Form Submission API
 */

import { formSubmissionService, FORM_TYPES } from '../services/FormSubmissionService.js';

/**
 * Initializes a form with automatic submission handling
 * @param {HTMLFormElement} formElement - The form element to initialize
 * @param {Object} options - Configuration options
 * @param {string} options.formType - The form type (required, see FORM_TYPES)
 * @param {Function} [options.onSuccess] - Callback on successful submission
 * @param {Function} [options.onError] - Callback on error
 * @param {boolean} [options.resetOnSuccess=true] - Whether to reset form on success
 * @param {string} [options.statusSelector] - CSS selector for status message container
 */
export function initFormSubmission(formElement, options = {}) {
    const {
        formType,
        onSuccess,
        onError,
        resetOnSuccess = true,
        statusSelector = '.form-status'
    } = options;

    if (!formType) {
        console.error('Form type is required for form submission');
        return;
    }

    if (!formElement) {
        console.error('Form element is required');
        return;
    }

    const statusElement = formElement.querySelector(statusSelector);
    const submitButton = formElement.querySelector('button[type="submit"], input[type="submit"]');

    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Disable submit button
        if (submitButton) {
            submitButton.disabled = true;

            // Check if button has a span for text (common pattern with icons)
            const buttonSpan = submitButton.querySelector('span');

            if (buttonSpan) {
                // Store original text from span
                if (!submitButton.dataset.originalText) {
                    submitButton.dataset.originalText = buttonSpan.textContent || 'Submit';
                }
                buttonSpan.textContent = 'Sending...';
            } else if (submitButton.textContent !== undefined) {
                // Store original text if not already stored
                if (!submitButton.dataset.originalText) {
                    submitButton.dataset.originalText = submitButton.textContent || submitButton.value || 'Submit';
                }
                submitButton.textContent = 'Sending...';
            } else {
                if (!submitButton.dataset.originalText) {
                    submitButton.dataset.originalText = submitButton.value || 'Submit';
                }
                submitButton.value = 'Sending...';
            }
        }

        // Clear previous status
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = statusElement.className.replace(/\b(success|error)\b/g, '').trim();
        }

        try {
            // Extract form data
            const formData = formSubmissionService.extractFormData(formElement, formType);

            // Submit form
            const response = await formSubmissionService.submit(formData);

            // Handle success
            if (statusElement) {
                statusElement.textContent = response.data?.message || 'Form submitted successfully!';
                statusElement.classList.add('success');
            }

            // Reset form if enabled
            if (resetOnSuccess) {
                formElement.reset();
            }

            // Call success callback
            if (onSuccess) {
                onSuccess(response, formData);
            }

        } catch (error) {
            // Handle error
            const errorMessage = error.message || 'Failed to submit form. Please try again.';

            // Always log error for debugging
            console.error('Form submission error:', {
                formType: formType,
                error: error,
                message: errorMessage,
                stack: error.stack
            });

            if (statusElement) {
                statusElement.textContent = errorMessage;
                statusElement.classList.add('error');
            } else {
                // If no status element, at least show an alert
                console.warn('No status element found to display error. Error:', errorMessage);
            }

            // Call error callback
            if (onError) {
                onError(error, formElement);
            }
        } finally {
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                const originalText = submitButton.dataset.originalText || 'Submit';

                // Check if button has a span for text
                const buttonSpan = submitButton.querySelector('span');

                if (buttonSpan) {
                    buttonSpan.textContent = originalText;
                } else if (submitButton.textContent !== undefined) {
                    submitButton.textContent = originalText;
                } else if (submitButton.value !== undefined) {
                    submitButton.value = originalText;
                }
            }
        }
    });
}

/**
 * Auto-initialize forms with data-wpbe-form attribute
 * Call this after DOM is loaded to automatically initialize forms
 *
 * Form attributes:
 * - data-wpbe-form="form_type" (required) - The form type
 * - data-redirect="/path/to/page.html" (optional) - Redirect URL on success
 */
export function autoInitForms() {
    const forms = document.querySelectorAll('[data-wpbe-form]');

    forms.forEach((form) => {
        const formType = form.getAttribute('data-wpbe-form');
        const redirectUrl = form.getAttribute('data-redirect');

        if (formType && Object.values(FORM_TYPES).includes(formType)) {
            initFormSubmission(form, {
                formType,
                onSuccess: redirectUrl ? () => {
                    window.location.href = redirectUrl;
                } : undefined
            });
        } else {
            console.warn(`Invalid or missing form type for form: ${formType}`);
        }
    });
}

/**
 * Initialize a contact form
 * @param {HTMLFormElement} formElement - The form element
 */
export function initContactForm(formElement) {
    return initFormSubmission(formElement, {
        formType: FORM_TYPES.CONTACT_FORM
    });
}

/**
 * Initialize a quote request form
 * @param {HTMLFormElement} formElement - The form element
 */
export function initQuoteForm(formElement) {
    return initFormSubmission(formElement, {
        formType: FORM_TYPES.QUOTE_REQUEST
    });
}

/**
 * Initialize a quick message form
 * @param {HTMLFormElement} formElement - The form element
 */
export function initQuickMessageForm(formElement) {
    return initFormSubmission(formElement, {
        formType: FORM_TYPES.QUICK_MESSAGE
    });
}
