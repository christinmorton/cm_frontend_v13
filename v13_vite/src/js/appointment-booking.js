/**
 * appointment-booking.js
 * Book new appointments with date/time slot selection
 */

import { auth } from './auth.js';
import { appointmentService } from './services/AppointmentService.js';

// Guard: Require authentication
auth.requireAuth();

// Reveal app after auth check
document.getElementById('booking-app').style.display = 'block';

// State
let selectedDate = null;
let selectedSlot = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Setup date input
    const dateInput = document.getElementById('appointment-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.addEventListener('change', handleDateChange);

    // Setup form
    document.getElementById('booking-form').addEventListener('submit', handleSubmit);
});

async function handleDateChange(e) {
    selectedDate = e.target.value;
    selectedSlot = null;

    if (!selectedDate) {
        document.getElementById('slots-container').innerHTML = '';
        return;
    }

    await loadAvailableSlots(selectedDate);
}

async function loadAvailableSlots(date) {
    const container = document.getElementById('slots-container');
    container.innerHTML = '<p class="loading-text">Loading available times...</p>';

    try {
        const response = await appointmentService.getAvailableSlots(date);
        const slots = response.data || response || [];
        renderSlots(slots);
    } catch (error) {
        console.error('Failed to load slots:', error);
        container.innerHTML = '<p class="error-text">Failed to load available times.</p>';
    }
}

function renderSlots(slots) {
    const container = document.getElementById('slots-container');

    if (slots.length === 0) {
        container.innerHTML = '<p class="empty-text">No available times on this date. Please select another date.</p>';
        return;
    }

    container.innerHTML = `
        <p class="slots-label">Available Times</p>
        <div class="slots-grid">
            ${slots.map(slot => `
                <button type="button" class="slot-btn" data-time="${slot.time || slot}">
                    ${formatTime(slot.time || slot)}
                </button>
            `).join('')}
        </div>
    `;

    // Add click handlers
    container.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSlot = btn.dataset.time;
        });
    });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
}

async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedDate) {
        showMessage('Please select a date.', 'error');
        return;
    }

    if (!selectedSlot) {
        showMessage('Please select a time slot.', 'error');
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking...';
    hideMessage();

    const data = {
        appointment_type: document.getElementById('appointment-type').value,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        notes: document.getElementById('notes').value.trim()
    };

    try {
        await appointmentService.book(data);
        showMessage('Appointment booked successfully! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = 'appointments.html';
        }, 1500);
    } catch (error) {
        console.error('Failed to book appointment:', error);
        showMessage(error.response?.data?.message || 'Failed to book appointment. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Appointment';
    }
}

function showMessage(text, type) {
    const el = document.getElementById('form-message');
    el.textContent = text;
    el.className = `form-message ${type}`;
    el.style.display = 'block';
}

function hideMessage() {
    document.getElementById('form-message').style.display = 'none';
}
