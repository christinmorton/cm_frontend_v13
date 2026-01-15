/**
 * appointments-list.js
 * Appointments listing page
 */

import { auth } from './auth.js';
import { appointmentService } from './services/AppointmentService.js';

// Guard: Require authentication
auth.requireAuth();

// Reveal app after auth check
document.getElementById('appointments-app').style.display = 'block';

document.addEventListener('DOMContentLoaded', async () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    await loadAppointments();
});

async function loadAppointments() {
    const container = document.getElementById('appointments-container');
    container.innerHTML = '<div class="loader-container">Loading appointments...</div>';

    try {
        const response = await appointmentService.getMyAppointments();
        const appointments = response.data || response || [];
        renderAppointments(appointments);
    } catch (error) {
        console.error('Failed to load appointments:', error);
        container.innerHTML = '<p class="error-message">Failed to load appointments. Please try again.</p>';
    }
}

function renderAppointments(appointments) {
    const container = document.getElementById('appointments-container');

    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="icofont-calendar"></i>
                <h3>No Appointments</h3>
                <p>You don't have any scheduled appointments.</p>
                <a href="book-appointment.html" class="action-button">Book an Appointment</a>
            </div>
        `;
        return;
    }

    // Group by upcoming vs past
    const now = new Date();
    const upcoming = appointments.filter(a => new Date(a.appointment_date) >= now);
    const past = appointments.filter(a => new Date(a.appointment_date) < now);

    let html = '';

    if (upcoming.length > 0) {
        html += `<h2 class="section-label">Upcoming</h2>`;
        html += upcoming.map(apt => renderAppointmentCard(apt, false)).join('');
    }

    if (past.length > 0) {
        html += `<h2 class="section-label" style="margin-top: 40px;">Past</h2>`;
        html += past.map(apt => renderAppointmentCard(apt, true)).join('');
    }

    container.innerHTML = html;
}

function renderAppointmentCard(apt, isPast) {
    const date = new Date(apt.appointment_date);
    return `
        <div class="appointment-card ${isPast ? 'past' : ''}">
            <div class="apt-date-block">
                <span class="apt-day">${date.getDate()}</span>
                <span class="apt-month">${date.toLocaleString('default', { month: 'short' })}</span>
                <span class="apt-year">${date.getFullYear()}</span>
            </div>
            <div class="apt-details">
                <h3>${apt.appointment_type || 'Appointment'}</h3>
                <div class="apt-meta">
                    <span><i class="icofont-clock-time"></i> ${apt.start_time || 'TBD'}</span>
                    ${apt.duration ? `<span><i class="icofont-ui-timer"></i> ${apt.duration} min</span>` : ''}
                </div>
                ${apt.notes ? `<p class="apt-notes">${apt.notes}</p>` : ''}
            </div>
            <div class="apt-status status-${(apt.status || 'confirmed').toLowerCase()}">
                ${apt.status || 'Confirmed'}
            </div>
        </div>
    `;
}
