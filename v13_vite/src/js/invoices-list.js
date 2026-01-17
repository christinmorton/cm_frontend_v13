/**
 * invoices-list.js
 * Invoices listing with status filtering
 */

import { auth } from './auth.js';
import api from './api.js';
import { testMode } from './utils/testMode.js';

// Guard: Require authentication (skip in test mode)
if (!testMode.isEnabled()) {
    auth.requireAuth();
}

// Reveal app after auth check
document.getElementById('invoices-app').style.display = 'block';

// State
let allInvoices = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Setup filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.status;
            renderInvoices();
        });
    });

    // Load invoices
    await loadInvoices();
});

async function loadInvoices() {
    const container = document.getElementById('invoices-container');
    container.innerHTML = '<div class="loader-container">Loading invoices...</div>';

    // Test mode: use mock data
    if (testMode.isEnabled()) {
        console.log('[TestMode] Loading test invoices');
        allInvoices = await testMode.getInvoices(20);
        renderInvoices();
        updateTotals();
        return;
    }

    try {
        const response = await api.get('/invoices/my');
        allInvoices = response.data?.data || response.data || [];
        renderInvoices();
        updateTotals();
    } catch (error) {
        console.error('Failed to load invoices:', error);
        container.innerHTML = '<p class="error-message">Failed to load invoices. Please try again.</p>';
    }
}

function renderInvoices() {
    const container = document.getElementById('invoices-container');

    // Filter invoices
    let filtered = allInvoices;
    if (currentFilter === 'unpaid') {
        filtered = allInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');
    } else if (currentFilter !== 'all') {
        filtered = allInvoices.filter(i => i.status === currentFilter);
    }

    // Update count
    document.getElementById('invoice-count').textContent = `${filtered.length} invoice${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-message">No invoices found.</p>';
        return;
    }

    container.innerHTML = filtered.map(invoice => `
        <a href="invoice-details.html?id=${invoice.id}" class="invoice-card">
            <div class="invoice-info">
                <h3>${invoice.invoice_number || `INV-${invoice.id}`}</h3>
                <div class="invoice-meta">
                    ${invoice.issue_date ? `Issued: ${new Date(invoice.issue_date).toLocaleDateString()}` : ''}
                    ${invoice.due_date ? ` • Due: ${new Date(invoice.due_date).toLocaleDateString()}` : ''}
                </div>
            </div>
            <div class="invoice-right">
                <div class="invoice-amount">${formatCurrency(invoice.total || invoice.amount || 0)}</div>
                <div class="invoice-status status-${(invoice.status || 'pending').toLowerCase()}">
                    ${invoice.status || 'pending'}
                </div>
            </div>
        </a>
    `).join('');
}

function updateTotals() {
    const unpaid = allInvoices.filter(i => i.status === 'pending' || i.status === 'overdue');
    const totalDue = unpaid.reduce((sum, i) => sum + (parseFloat(i.total) || parseFloat(i.amount) || 0), 0);

    document.getElementById('total-due').textContent = formatCurrency(totalDue);
    document.getElementById('unpaid-count').textContent = unpaid.length;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
