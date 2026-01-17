import { auth } from './auth.js';
import api from './api.js';
import { paymentService } from './services/PaymentService.js';

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

    const invoiceData = await loadInvoiceDetails(invoiceId);

    // Download PDF placeholder
    document.getElementById('download-btn').addEventListener('click', () => {
        alert('Download PDF feature coming soon.');
    });

    // Pay Now button - integrates with Stripe via PaymentService
    const payBtn = document.getElementById('pay-btn');
    payBtn.addEventListener('click', async () => {
        if (!invoiceData) {
            alert('Invoice data not loaded.');
            return;
        }

        // Check if invoice is already paid
        if (invoiceData.status?.toLowerCase() === 'paid') {
            alert('This invoice has already been paid.');
            return;
        }

        // Get user info for email
        const user = auth.getUser();
        const clientEmail = invoiceData.client_email || user?.user_email;

        if (!clientEmail) {
            alert('Client email not found. Please contact support.');
            return;
        }

        // Disable button and show loading state
        payBtn.disabled = true;
        payBtn.innerHTML = '<i class="icofont-spinner-alt-4"></i> Redirecting to payment...';

        try {
            await paymentService.startPayment({
                invoiceId: invoiceData.id,
                amount: parseFloat(invoiceData.total) || parseFloat(invoiceData.amount) || 0,
                clientEmail: clientEmail,
                invoiceNumber: invoiceData.invoice_number || invoiceData.number,
                clientName: invoiceData.client_name,
                paymentType: 'full'
            });
            // User will be redirected to Stripe Checkout
        } catch (error) {
            console.error('Payment error:', error);
            payBtn.disabled = false;
            payBtn.innerHTML = '<i class="icofont-credit-card"></i> Pay Now';
            alert('Failed to start payment. Please try again or contact support.');
        }
    });
});

async function loadInvoiceDetails(id) {
    try {
        const response = await api.get(`/invoices/${id}`);
        const invoice = response.data?.data || response.data;
        renderInvoice(invoice);
        return invoice;
    } catch (error) {
        console.error('Error fetching invoice:', error);

        // Fallback Mock Data
        const mockInvoice = getMockInvoice(id);
        if (mockInvoice) {
            renderInvoice(mockInvoice);
            return mockInvoice;
        } else {
            document.getElementById('invoice-id').textContent = 'Not Found';
            document.getElementById('client-info').textContent = 'The requested invoice could not be loaded.';
            return null;
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

    // Hide Pay button if invoice is already paid
    const payBtn = document.getElementById('pay-btn');
    if (invoice.status?.toLowerCase() === 'paid') {
        payBtn.style.display = 'none';
    } else {
        payBtn.style.display = 'inline-flex';
    }
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
