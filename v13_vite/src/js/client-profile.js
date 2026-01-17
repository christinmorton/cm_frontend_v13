/**
 * client-profile.js
 * Client profile view and edit
 */

import { auth } from './auth.js';
import { clientService } from './services/ClientService.js';
import { testMode } from './utils/testMode.js';

// Guard: Require authentication (skip in test mode)
if (!testMode.isEnabled()) {
    auth.requireAuth();
}

// Reveal app after auth check
document.getElementById('profile-app').style.display = 'block';

// State
let clientData = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Setup form submission
    document.getElementById('profile-form').addEventListener('submit', handleSubmit);

    // Setup cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
        populateForm(clientData);
        showMessage('Changes cancelled.', 'info');
    });

    // Load profile
    await loadProfile();
});

async function loadProfile() {
    const form = document.getElementById('profile-form');
    form.classList.add('loading');

    // Test mode: use mock data
    if (testMode.isEnabled()) {
        console.log('[TestMode] Loading test profile');
        clientData = testMode.getMockClientProfile();
        populateForm(clientData);
        form.classList.remove('loading');
        return;
    }

    try {
        const response = await clientService.getProfile();
        clientData = response.data || response;
        populateForm(clientData);
    } catch (error) {
        console.error('Failed to load profile:', error);
        showMessage('Failed to load profile. Please try again.', 'error');
    } finally {
        form.classList.remove('loading');
    }
}

function populateForm(data) {
    if (!data) return;

    document.getElementById('company-name').value = data.company_name || '';
    document.getElementById('contact-name').value = data.contact_name || data.name || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('city').value = data.city || '';
    document.getElementById('state').value = data.state || '';
    document.getElementById('zip').value = data.zip || data.postal_code || '';
}

async function handleSubmit(e) {
    e.preventDefault();

    if (!clientData?.id) {
        showMessage('Client data not loaded.', 'error');
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const formData = {
        company_name: document.getElementById('company-name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zip: document.getElementById('zip').value.trim()
    };

    try {
        await clientService.updateProfile(clientData.id, formData);
        // Update local state
        clientData = { ...clientData, ...formData };
        showMessage('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Failed to update profile:', error);
        showMessage(error.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('form-message');
    messageEl.textContent = text;
    messageEl.className = `form-message ${type}`;
    messageEl.style.display = 'block';

    if (type !== 'error') {
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 4000);
    }
}
