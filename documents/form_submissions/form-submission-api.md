# Form Submission API Integration Guide

This document defines how to integrate the WPBE Pro Form Submission API with a vanilla JavaScript + Vite frontend.

## Quick Start - Copy & Paste Example

```javascript
// Minimal working example - copy this to test
const submitForm = async () => {
  const response = await fetch('http://general-wp.local/wp-json/wpbe/v1/form-submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      form_type: 'contact_form',
      sender_email: 'test@example.com',
      sender_name: 'Test User',
      subject: 'Test Subject',
      message: 'This is a test message from the frontend.'
    }),
  });

  const data = await response.json();
  console.log('Response:', data);
  return data;
};

// Call it
submitForm();
```

---

## API Endpoint

```
POST /wp-json/wpbe/v1/form-submissions
```

## Request Format

### Headers

```javascript
{
  'Content-Type': 'application/json',
  'X-Guest-Token': 'optional-guest-session-token'
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `form_type` | string | Type of form (see valid types below) |
| `sender_email` | string | Submitter's email address |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `sender_name` | string | Full name of submitter |
| `sender_phone` | string | Phone number |
| `subject` | string | Form subject line |
| `message` | string | Main message body |
| `form_data` | object | Additional arbitrary form fields |

### Valid Form Types

- `contact_form` - General contact inquiries
- `quick_message` - Short/quick message submissions
- `book_a_call` - Schedule a call requests
- `request_a_quote` - Detailed quote requests
- `quote_request` - Quick quote/estimate requests
- `discovery_intake` - Discovery/onboarding intake forms
- `newsletter_signup` - Email newsletter subscriptions
- `support_request` - Support ticket requests (creates ticket if logged in)
- `support_form` - General support inquiries
- `faq_question` - FAQ submissions

## Response Format

### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "message": "Form submitted successfully. Thank you!",
    "submission_id": null
  }
}
```

Note: `submission_id` is only returned for admin users.

### Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Form type is required",
  "code": "rest_missing_param"
}
```

---

## Frontend Implementation

### 1. API Client Setup

Create `src/api/wpbe-client.js`:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'https://your-site.com/wp-json/wpbe/v1';

class WPBEClient {
  constructor() {
    this.guestToken = localStorage.getItem('wpbe_guest_token');
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.guestToken) {
      headers['X-Guest-Token'] = this.guestToken;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...this.getHeaders(), ...options.headers },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  setGuestToken(token) {
    this.guestToken = token;
    localStorage.setItem('wpbe_guest_token', token);
  }
}

export const wpbeClient = new WPBEClient();
```

### 2. Form Submission Service

Create `src/api/form-service.js`:

```javascript
import { wpbeClient } from './wpbe-client.js';

export const FormService = {
  async submit(formData) {
    return wpbeClient.request('/form-submissions', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
};
```

### 3. Contact Form Component

Create `src/components/ContactForm.js`:

```javascript
import { FormService } from '../api/form-service.js';

export function ContactForm(container) {
  const form = document.createElement('form');
  form.id = 'contact-form';
  form.innerHTML = `
    <div class="form-group">
      <label for="name">Name *</label>
      <input type="text" id="name" name="sender_name" required>
    </div>
    <div class="form-group">
      <label for="email">Email *</label>
      <input type="email" id="email" name="sender_email" required>
    </div>
    <div class="form-group">
      <label for="phone">Phone</label>
      <input type="tel" id="phone" name="sender_phone">
    </div>
    <div class="form-group">
      <label for="subject">Subject *</label>
      <input type="text" id="subject" name="subject" required>
    </div>
    <div class="form-group">
      <label for="message">Message *</label>
      <textarea id="message" name="message" rows="5" required></textarea>
    </div>
    <button type="submit">Send Message</button>
    <div class="form-status" aria-live="polite"></div>
  `;

  form.addEventListener('submit', handleSubmit);
  container.appendChild(form);
}

async function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');

  // Disable button during submission
  button.disabled = true;
  button.textContent = 'Sending...';
  status.textContent = '';
  status.className = 'form-status';

  const formData = {
    form_type: 'contact_form',
    sender_name: form.sender_name.value.trim(),
    sender_email: form.sender_email.value.trim(),
    sender_phone: form.sender_phone.value.trim() || null,
    subject: form.subject.value.trim(),
    message: form.message.value.trim(),
  };

  try {
    const response = await FormService.submit(formData);
    status.textContent = response.data.message;
    status.classList.add('success');
    form.reset();
  } catch (error) {
    status.textContent = error.message || 'Failed to send. Please try again.';
    status.classList.add('error');
  } finally {
    button.disabled = false;
    button.textContent = 'Send Message';
  }
}
```

### 4. Quote Request Form

Create `src/components/QuoteForm.js`:

```javascript
import { FormService } from '../api/form-service.js';

export function QuoteForm(container) {
  const form = document.createElement('form');
  form.id = 'quote-form';
  form.innerHTML = `
    <div class="form-group">
      <label for="name">Name *</label>
      <input type="text" id="name" name="sender_name" required>
    </div>
    <div class="form-group">
      <label for="email">Email *</label>
      <input type="email" id="email" name="sender_email" required>
    </div>
    <div class="form-group">
      <label for="service">Service Type *</label>
      <select id="service" name="service_type" required>
        <option value="">Select a service</option>
        <option value="web_design">Web Design</option>
        <option value="development">Development</option>
        <option value="consulting">Consulting</option>
      </select>
    </div>
    <div class="form-group">
      <label for="budget">Budget Range</label>
      <select id="budget" name="budget_range">
        <option value="">Select budget</option>
        <option value="under_5k">Under $5,000</option>
        <option value="5k_10k">$5,000 - $10,000</option>
        <option value="10k_plus">$10,000+</option>
      </select>
    </div>
    <div class="form-group">
      <label for="details">Project Details *</label>
      <textarea id="details" name="message" rows="5" required></textarea>
    </div>
    <button type="submit">Request Quote</button>
    <div class="form-status" aria-live="polite"></div>
  `;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');

    button.disabled = true;

    const payload = {
      form_type: 'quote_request',
      sender_name: form.sender_name.value.trim(),
      sender_email: form.sender_email.value.trim(),
      subject: 'Quote Request: ' + form.service_type.value,
      message: form.message.value.trim(),
      form_data: {
        service_type: form.service_type.value,
        budget_range: form.budget_range.value,
      },
    };

    try {
      const response = await FormService.submit(payload);
      status.textContent = response.data.message;
      status.className = 'form-status success';
      form.reset();
    } catch (error) {
      status.textContent = error.message;
      status.className = 'form-status error';
    } finally {
      button.disabled = false;
    }
  });

  container.appendChild(form);
}
```

---

## Environment Setup

### Vite Configuration

Add to your `.env` file:

```env
VITE_API_URL=https://your-wordpress-site.com/wp-json/wpbe/v1
```

### CORS

The API allows cross-origin requests. Ensure your WordPress site has CORS configured for your frontend domain.

---

## Form Behavior by Type

| Form Type | Backend Behavior |
|-----------|------------------|
| `contact_form` | Auto-creates Lead record |
| `quick_message` | Stores submission only |
| `book_a_call` | Auto-creates Lead record |
| `request_a_quote` | Auto-creates Lead record |
| `quote_request` | Auto-creates Lead record |
| `discovery_intake` | Auto-creates Lead record |
| `support_request` | Creates Ticket (if user logged in) |
| `newsletter_signup` | Stores submission only |
| `support_form` | Stores submission only |
| `faq_question` | Stores submission only |

---

## Error Handling

Common error responses:

| Status | Code | Message |
|--------|------|---------|
| 400 | `rest_missing_param` | Form type is required |
| 400 | `rest_missing_param` | Email is required |
| 400 | `rest_invalid_param` | Invalid form type |
| 500 | `rest_cannot_create` | Failed to create form submission |

---

## Submission Statuses

Submissions progress through these statuses:

- `new` - Just submitted
- `pending` - Awaiting processing
- `converted_to_lead` - Auto-converted to lead record
- `converted` - Converted to ticket or other entity
- `processed` - Manually processed by admin
- `archived` - Closed/archived
