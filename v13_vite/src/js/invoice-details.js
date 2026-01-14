import { auth } from './auth.js';
import api from './api.js';

// 1. Guard
auth.requireAuth();

// 2. Reveal
document.getElementById('invoice-app').style.display = 'block';

document.addEventListener('DOMContentLoaded', async () => {

    // Logout Handler
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');

    if (!invoiceId) {
        alert('No invoice ID specified');
        window.location.href = 'dashboard.html';
        return;
    }

    await loadInvoiceDetails(invoiceId);

    // Placeholder actions
    document.getElementById('download-btn').addEventListener('click', () => {
        alert('Download PDF feature coming soon.');
    });

    document.getElementById('pay-btn').addEventListener('click', () => {
        alert('Payment gateway integration coming soon.');
    });
});

async function loadInvoiceDetails(id) {
    try {
        const response = await api.get(`/invoices/${id}`);
        renderInvoice(response.data);
    } catch (error) {
        console.error('Error fetching invoice:', error);

        // Fallback Mock Data
        const mockInvoice = getMockInvoice(id);
        if (mockInvoice) {
            renderInvoice(mockInvoice);
        } else {
            document.getElementById('invoice-id').textContent = 'Not Found';
            document.getElementById('client-info').textContent = 'The requested invoice could not be loaded.';
        }
    }
}

function renderInvoice(invoice) {
    document.title = `Invoice #${invoice.number} | Client Portal`;

    document.getElementById('invoice-id').textContent = `Invoice #${invoice.number}`;

    const statusEl = document.getElementById('invoice-status');
    statusEl.textContent = invoice.status;
    statusEl.className = `status-badge status-${invoice.status.toLowerCase()}`;

    document.getElementById('invoice-date').textContent = new Date(invoice.date).toLocaleDateString();
    document.getElementById('invoice-due').textContent = new Date(invoice.due_date).toLocaleDateString();
    document.getElementById('project-ref').textContent = invoice.project_name || 'General';

    // Client Info
    document.getElementById('client-info').innerHTML = `
        <strong>${invoice.client_name}</strong><br>
        ${invoice.client_company}<br>
        ${invoice.client_email}
    `;

    // Items
    const itemsContainer = document.getElementById('invoice-items');
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    if (invoice.items && invoice.items.length > 0) {
        itemsContainer.innerHTML = invoice.items.map(item => `
            <tr>
                <td>${item.description}</td>
                <td style="text-align: right;">${formatter.format(item.amount)}</td>
            </tr>
        `).join('');
    }

    document.getElementById('invoice-total').textContent = formatter.format(invoice.total);
}

// Mock Data Helper
function getMockInvoice(id) {
    const mocks = {
        'INV-2024-001': {
            id: 'INV-2024-001',
            number: 'INV-2024-001',
            status: 'Pending',
            date: '2026-01-15',
            due_date: '2026-01-30',
            project_name: 'Website Redesign',
            client_name: 'Client User',
            client_company: 'Acme Corp',
            client_email: 'client@example.com',
            items: [
                { description: 'Initial Deposit (50%)', amount: 6000.00 },
                { description: 'Domain Registration (1 Year)', amount: 25.00 }
            ],
            total: 6025.00
        },
        'INV-2023-012': {
            id: 'INV-2023-012',
            number: 'INV-2023-012',
            status: 'Paid',
            date: '2025-12-01',
            due_date: '2025-12-15',
            project_name: 'Q4 Marketing Campaign',
            client_name: 'Client User',
            client_company: 'Acme Corp',
            client_email: 'client@example.com',
            items: [
                { description: 'Marketing Consultation - Dec', amount: 1500.00 }
            ],
            total: 1500.00
        }
    };
    return mocks[id] || null;
}
