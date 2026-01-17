# WPBE Pro REST API Documentation

**Base URL:** `https://your-site.com/wp-json/wpbe/v1`
**Frontend Use:** Client portal & public website (no admin features)

---

## Authentication

### Register New User
```js
api('/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'securepass123'
  })
});
```

### Login
```js
const login = async (username, password) => {
  const res = await fetch('https://your-site.com/wp-json/jwt-auth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) localStorage.setItem('jwt_token', data.token);
  return data;
};

const logout = () => localStorage.removeItem('jwt_token');
```

### Forgot Password
```js
api('/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ email: 'john@example.com' })
});
// Sends email with link: https://yoursite.com/reset-password.html?key=RESET_KEY&login=USERNAME
```

### Reset Password
```js
// Use key and login from URL params
const params = new URLSearchParams(window.location.search);

api('/auth/reset-password', {
  method: 'POST',
  body: JSON.stringify({
    key: params.get('key'),
    login: params.get('login'),
    password: 'newSecurePass123'
  })
});
```

### API Request Helper
```js
const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('jwt_token');
  const res = await fetch(`https://your-site.com/wp-json/wpbe/v1${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  });
  return res.json();
};
```

---

## User Types

| Type | Description | Access |
|------|-------------|--------|
| **Guest** | Not logged in | Public endpoints only |
| **Member** | Logged-in WordPress user | Tickets, messages |
| **Client** | Member with client record | Full portal access |

---

## Public Endpoints (No Auth)

### Services
```js
api('/services');
api('/services/active');
api('/services/123');
```

### Testimonials
```js
api('/testimonials/approved');
api('/testimonials/featured');
```

### Case Studies & FAQs
```js
api('/case-studies');
api('/case-studies/featured');
api('/faqs/public');
api('/faqs/category/billing');
```

### Social Proof & Dynamic Sections
```js
api('/social-proof');
api('/dynamic-sections/public');
```

### Dynamic Cards
```js
api('/dynamic-cards/public');           // Public cards only (no auth)
api('/dynamic-cards/active');           // Active cards (visibility-filtered)
api('/dynamic-cards/type/hero');        // Cards by type (hero, feature, cta, etc.)
api('/dynamic-cards/123');              // Single card by ID
```

---

## Lead Capture (Public)

### Submit Lead
```js
api('/leads', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '555-1234',
    company: 'Acme Inc',
    source: 'website_contact',
    message: 'Interested in your services'
  })
});
```

### Submit Form
```js
api('/form-submissions', {
  method: 'POST',
  body: JSON.stringify({
    form_type: 'contact_form',
    form_data: { name: 'John', message: 'Hello' },
    sender_email: 'user@example.com',
    sender_name: 'John Doe',
    subject: 'General inquiry',
    message: 'I would like more information...'
  })
});
```

**Form Types & Auto-Actions:**

| Form Type | Creates Lead | Creates Appointment | Notes |
|-----------|--------------|---------------------|-------|
| `contact_form` | Yes | No | Temperature: 25 (cold) |
| `quote_request` | Yes | No | Temperature: 50 (warm) |
| `request_a_quote` | Yes | No | Temperature: 50 (warm) |
| `book_a_call` | Yes | **Yes** | Temperature: 80 (hot) |
| `discovery_intake` | Yes | **Yes** | Temperature: 80 (hot) |
| `support_request` | No | No | Creates ticket if logged in |
| `quick_message` | No | No | Temperature: 10 (cold) |
| `newsletter_signup` | No | No | Temperature: 10 (cold) |
| `testimonial_submission` | No | No | Pending admin approval |
| `faq_question` | No | No | Pending admin approval |
| `social_proof_submission` | No | No | Pending admin approval |

**Lead Temperature Bonuses:** +10 if phone provided, +10 if company name, +5 if message > 100 chars

### Book a Call Form (with Appointment)
```js
api('/form-submissions', {
  method: 'POST',
  body: JSON.stringify({
    form_type: 'book_a_call',
    sender_email: 'user@example.com',
    sender_name: 'John Doe',
    subject: 'Free consultation request',
    message: 'I want to discuss my project requirements',
    form_data: {
      // Date/Time (required for specific scheduling)
      preferred_date: '2026-01-20',        // YYYY-MM-DD format
      preferred_time: '14:00:00',          // HH:MM:SS format (optional, defaults to 09:00)
      timezone: 'America/New_York',        // Optional, defaults to site timezone

      // Meeting Details (optional)
      meeting_platform: 'zoom',            // zoom, google_meet, teams, skype, phone, in_person
      meeting_link: 'https://zoom.us/j/123456789',  // Video call URL
      location: '123 Main St, City',       // Physical address (for in_person)

      // Additional Info (optional)
      notes: 'Client prefers morning calls' // Internal notes
    }
  })
});
```

**Appointment Field Mapping:**
- `book_a_call` → `consultation` type (30 min, defaults to `zoom` platform)
- `discovery_intake` → `discovery_call` type (60 min)

**Accepted `form_data` fields:**

| Field | Aliases | Description |
|-------|---------|-------------|
| Date | `preferred_date`, `appointment_date`, `date`, `selectedDate` | YYYY-MM-DD |
| Time | `preferred_time`, `appointment_time`, `time`, `selectedTime` | HH:MM:SS |
| Full datetime | `scheduled_datetime` | YYYY-MM-DD HH:MM:SS |
| Timezone | `timezone` | e.g., America/New_York |
| Platform | `meeting_platform` | zoom, google_meet, teams, etc. |
| Meeting URL | `meeting_link`, `meetingLink` | Video call URL |
| Location | `location`, `address`, `meeting_location` | Physical address |
| Notes | `notes`, `additional_notes`, `adminNotes` | Internal notes |

If no date is provided, appointment defaults to 3 days from submission at 10:00 AM.

### Submit Testimonial (Guest/Client)
```js
api('/form-submissions', {
  method: 'POST',
  body: JSON.stringify({
    form_type: 'testimonial_submission',
    sender_email: 'client@example.com',
    sender_name: 'Jane Smith',
    message: 'Working with this team was amazing! They delivered on time and exceeded expectations.',
    form_data: {
      rating: 5,                              // 1-5 stars
      job_title: 'Marketing Director',        // Optional
      company: 'Acme Corp',                   // Optional
      service_id: 123,                        // Optional - link to service
      project_id: 456                         // Optional - link to project
    }
  })
});
// Status: pending_review - awaits admin approval
```

### Submit FAQ Question (Guest)
```js
api('/form-submissions', {
  method: 'POST',
  body: JSON.stringify({
    form_type: 'faq_question',
    sender_email: 'visitor@example.com',
    sender_name: 'Curious Visitor',
    subject: 'How long does a typical project take?',
    message: 'I want to know the timeline for a standard web development project.'
  })
});
// Status: pending_review - admin answers and approves
```

### Submit Social Proof (Guest/Contact)
```js
api('/form-submissions', {
  method: 'POST',
  body: JSON.stringify({
    form_type: 'social_proof_submission',
    sender_email: 'friend@example.com',
    sender_name: 'Alex Johnson',
    message: 'Just had an amazing experience working with @yourcompany! Highly recommend!',
    form_data: {
      platform: 'twitter',                    // twitter, instagram, facebook, tiktok, linkedin
      username: '@alexjohnson',               // Social handle
      post_link: 'https://twitter.com/...',   // Link to the actual post
      profile_link: 'https://twitter.com/alexjohnson',
      engagement_count: 45                    // Likes/reactions (optional)
    }
  })
});
// Status: pending_review - awaits admin approval
```

### Approve Submission (Admin Only)
```js
// Approve a testimonial
api('/form-submissions/123/approve', { method: 'POST' });

// Approve FAQ with answer
api('/form-submissions/456/approve', {
  method: 'POST',
  body: JSON.stringify({
    answer: 'A typical project takes 4-8 weeks depending on complexity.',
    category: 'general'  // Optional, defaults to 'general'
  })
});

// Approve social proof
api('/form-submissions/789/approve', { method: 'POST' });
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Submission approved and converted successfully",
    "converted_type": "testimonial",
    "converted_id": 234
  }
}
```

---

## Current User (Authenticated)

```js
// Get logged-in user info, client data, dashboard counts
const user = await api('/auth/me');
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "client@example.com",
    "roles": ["client"],
    "client": { "id": 12, "company_name": "Acme" },
    "counts": { "projects": 3, "invoices": 5, "tickets": 2 }
  }
}
```

---

## Client Portal (Client Role Required)

### Projects
```js
api('/projects/my');
api('/projects/123');
api('/projects/status/in_progress');
```

### Invoices
```js
api('/invoices/my');
api('/invoices/123');
api('/invoices/unpaid');
api('/invoices/status/paid');
```

### Appointments
```js
api('/appointments/my');
api('/appointments/upcoming');
api('/appointments/available-slots?date=2026-01-20'); // Public

// Book appointment
api('/appointments', {
  method: 'POST',
  body: JSON.stringify({
    appointment_type: 'consultation',
    appointment_date: '2026-01-20',
    start_time: '10:00:00',
    notes: 'Discuss project scope'
  })
});
```

### Client Profile
```js
api('/clients/me');

// Update own profile (limited fields)
api('/clients/123', {
  method: 'PUT',
  body: JSON.stringify({
    company_name: 'New Company Name',
    phone: '555-9999'
  })
});
```

---

## Tickets (Any Authenticated User)

```js
api('/tickets/my');
api('/tickets/open');
api('/tickets/status/in_progress');

// Create ticket
api('/tickets', {
  method: 'POST',
  body: JSON.stringify({
    subject: 'Need help with invoice',
    description: 'Cannot download PDF',
    priority: 'medium',  // low, medium, high, urgent
    category: 'billing'
  })
});

// Update ticket (description only)
api('/tickets/123', {
  method: 'PUT',
  body: JSON.stringify({ description: 'Updated details' })
});
```

---

## Conversations & Messages

### Conversations (Client Role)
```js
api('/conversations/my');
api('/conversations/123');
api('/conversations/entity/project/456');
```

### Messages
```js
api('/messages/conversation/123');
api('/messages/unread/count');

// Send message
api('/messages', {
  method: 'POST',
  body: JSON.stringify({
    conversation_id: 123,
    content: 'Hello, I have a question...'
  })
});

// Mark as read
api('/messages/456/read', { method: 'PUT' });
```

---

## Guest Tracking (Public)

### Create Guest Session
```js
const createGuest = async () => {
  const res = await api('/guests', { method: 'POST' });
  localStorage.setItem('guest_id', res.data.guest_id);
  localStorage.setItem('guest_token', res.data.session_token);
  return res.data;
};
```

### Track Events
```js
const trackEvent = async (eventType, eventData = {}) => {
  const guestId = localStorage.getItem('guest_id');
  const token = localStorage.getItem('guest_token');
  if (!guestId) return;

  return fetch('https://your-site.com/wp-json/wpbe/v1/analytics/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Guest-Token': token
    },
    body: JSON.stringify({
      guest_id: guestId,
      event_type: eventType,  // page_view, cta_click, form_start, form_submit
      event_data: eventData,
      page_url: window.location.href
    })
  });
};

// Usage
trackEvent('page_view', { title: document.title });
trackEvent('cta_click', { button: 'get_quote' });
```

---

## File Upload

```js
const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files[]', file));

  const guestId = localStorage.getItem('guest_id');
  if (guestId) formData.append('guest_id', guestId);

  return fetch('https://your-site.com/wp-json/wpbe/v1/media/upload', {
    method: 'POST',
    headers: { 'X-Guest-Token': localStorage.getItem('guest_token') || '' },
    body: formData
  });
};
```

---

## Payment Processing (Stripe)

Endpoints for processing payments via Stripe Checkout. Supports two modes:
1. **Invoice Payment** - Pay an existing invoice
2. **Standalone Deposit** - Collect payment without an invoice (for deposit flows)

### Check Stripe Status

Check if Stripe is configured and ready to accept payments.

```js
api('/stripe/status');
// Response:
{
  "configured": true,
  "test_mode": true,
  "currency": "usd"
}
```

### Create Checkout Session

Create a Stripe Checkout session. Public endpoint - no authentication required.

**Invoice Payment** (requires existing invoice):
```js
api('/stripe/checkout', {
  method: 'POST',
  body: JSON.stringify({
    invoice_id: 123,              // Required: Invoice post ID
    invoice_number: 'INV-2024-001',
    client_name: 'John Doe',
    client_email: 'john@example.com',
    amount: 500.00,               // Required: Amount in dollars
    payment_type: 'full',         // 'full', 'deposit', or 'partial'
    return_url: 'https://yoursite.com/payment-complete'
  })
});
```

**Standalone Deposit** (no invoice required):
```js
api('/stripe/checkout', {
  method: 'POST',
  body: JSON.stringify({
    invoice_id: 0,                // 0 or omit for standalone deposit
    invoice_number: 'DEP-1234',   // Optional reference number
    client_name: 'John Doe',
    client_email: 'john@example.com',  // Required for deposits
    amount: 500.00,               // Required: Amount in dollars
    payment_type: 'deposit',
    return_url: 'https://yoursite.com/payment-complete',
    metadata: {                   // Optional: Custom metadata
      project_type: 'website_redesign',
      source: 'deposit_flow'
    }
  })
});
```

**Success Response:**
```json
{
  "success": true,
  "session_id": "cs_test_abc123...",
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_abc123..."
}
```

**Redirect user to `checkout_url` to complete payment.**

### Get Session Status

Check the status of a checkout session (useful for return page).

```js
api('/stripe/session/cs_test_abc123');

// Response:
{
  "success": true,
  "session_id": "cs_test_abc123...",
  "payment_status": "paid",       // 'paid', 'unpaid', 'no_payment_required'
  "status": "complete",           // 'open', 'complete', 'expired'
  "invoice_id": 123
}
```

### Stripe Webhook

**Endpoint:** `POST /stripe/webhook`

Handles Stripe webhook events. Configure this URL in your Stripe Dashboard:
`https://your-site.com/wp-json/wpbe/v1/stripe/webhook`

**Handled Events:**
- `checkout.session.completed` - Records payment on invoice
- `payment_intent.succeeded` - Logs successful payment
- `payment_intent.payment_failed` - Triggers `wpbe_payment_failed` action

**No authentication required** - Stripe uses signature verification via `Stripe-Signature` header.

### Payment Webhook (Generic)

Alternative webhook for external payment processors (e.g., JetFormBuilder integrations).

```js
// Requires X-Webhook-Secret header
fetch('https://your-site.com/wp-json/wpbe/v1/payment-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': 'your_webhook_secret'
  },
  body: JSON.stringify({
    invoice_id: 123,              // Required
    amount: 250.00,
    payment_method: 'online',
    transaction_id: 'txn_abc123',
    payment_type: 'deposit',      // 'full', 'deposit', 'partial'
    gateway: 'stripe',            // Payment gateway name
    status: 'completed'
  })
});

// Response:
{
  "success": true,
  "invoice_id": 123,
  "amount_paid": 250.00,
  "total_paid": 250.00,
  "payment_status": "partial"     // 'unpaid', 'partial', 'paid'
}
```

### Frontend Payment Flow Example

```js
// 1. Create checkout session
const startPayment = async (invoiceId, amount, email) => {
  const { checkout_url, session_id } = await api('/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify({
      invoice_id: invoiceId,
      amount: amount,
      client_email: email,
      return_url: window.location.origin + '/payment-complete'
    })
  });

  // Store session_id for verification on return
  sessionStorage.setItem('stripe_session', session_id);

  // Redirect to Stripe Checkout
  window.location.href = checkout_url;
};

// 2. On payment-complete page
const verifyPayment = async () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const sessionId = params.get('session_id') || sessionStorage.getItem('stripe_session');

  if (status === 'success' && sessionId) {
    const result = await api(`/stripe/session/${sessionId}`);

    if (result.payment_status === 'paid') {
      showMessage('Payment successful! Thank you.');
    } else {
      showMessage('Payment processing. You will receive confirmation shortly.');
    }
  } else if (status === 'cancelled') {
    showMessage('Payment was cancelled.');
  }

  sessionStorage.removeItem('stripe_session');
};
```

### Stripe Configuration (WordPress Admin)

Required options in WordPress (set via admin settings page):

| Option | Description |
|--------|-------------|
| `wpbe_stripe_test_mode` | boolean - Use test keys if true |
| `wpbe_stripe_test_secret_key` | Test secret key (sk_test_...) |
| `wpbe_stripe_test_publishable_key` | Test publishable key (pk_test_...) |
| `wpbe_stripe_live_secret_key` | Live secret key (sk_live_...) |
| `wpbe_stripe_live_publishable_key` | Live publishable key (pk_live_...) |
| `wpbe_stripe_webhook_secret` | Webhook signing secret (whsec_...) |
| `wpbe_stripe_currency` | Currency code (default: 'usd') |

### Stripe Error Codes

| Code | Status | Message |
|------|--------|---------|
| `stripe_not_configured` | 500 | Stripe API keys not configured |
| `missing_invoice_id` | 400 | Invoice ID is required |
| `invalid_amount` | 400 | Valid amount is required |
| `invalid_invoice` | 404 | Invoice not found |
| `missing_session_id` | 400 | Session ID is required |
| `invalid_payload` | 400 | Invalid JSON payload |
| `invalid_signature` | 400 | Invalid signature header |
| `timestamp_expired` | 400 | Webhook timestamp too old |
| `signature_mismatch` | 400 | Signature verification failed |

---

## Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 25, "page": 1, "per_page": 10 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "You must be logged in to access this resource.",
  "code": "rest_forbidden"
}
```

---

## Pagination

```js
api('/projects/my?page=2&per_page=20');
```

---

## Quick Reference (Frontend Access)

| Endpoint | Guest | Member | Client |
|----------|-------|--------|--------|
| `/auth/register` | Yes | - | - |
| `/auth/forgot-password` | Yes | - | - |
| `/auth/reset-password` | Yes | - | - |
| `/auth/me` | - | Yes | Yes |
| Services, Testimonials, FAQs | Read | Read | Read |
| Lead/Form Submit | Yes | Yes | Yes |
| Tickets | - | Full | Full |
| Projects, Invoices | - | - | Read |
| Appointments | Book | Book | Full |
| Conversations, Messages | - | Send | Full |
| Guest Tracking | Yes | - | - |
| File Upload | Yes | Yes | Yes |
| Stripe Checkout | Yes | Yes | Yes |
| Payment Webhook | Secret | Secret | Secret |

---

## Error Handling

### Error Response Format

All API errors return this structure:

```json
{
  "code": "rest_not_found",
  "message": "Item not found",
  "data": { "status": 404 }
}
```

### Error Codes Reference

#### Authentication Errors (401)

| Code | Message | When |
|------|---------|------|
| `rest_not_logged_in` | You must be logged in | Protected endpoint without token |
| `rest_invalid_token` | Invalid session token | Guest token is invalid |
| `rest_guest_expired` | Session expired | Guest session timed out |
| `rest_expired_key` | Reset link expired | Password reset link too old |
| `rest_invalid_key` | Invalid reset link | Password reset key doesn't match |

#### Permission Errors (403)

| Code | Message | When |
|------|---------|------|
| `rest_forbidden` | Permission denied | User lacks required role |
| `rest_not_owner` | Access denied | User doesn't own the resource |

#### Validation Errors (400)

| Code | Message | When |
|------|---------|------|
| `rest_invalid_param` | Invalid parameter | Field validation failed |
| `rest_missing_param` | Required field missing | Required field is empty |
| `rest_email_exists` | Email already registered | Duplicate email on registration |
| `rest_username_exists` | Username taken | Duplicate username |
| `rest_weak_password` | Password too short | Password under 8 characters |
| `rest_invalid_email` | Invalid email format | Email fails validation |
| `rest_invalid_slot` | Time slot unavailable | Appointment slot taken |

#### Not Found Errors (404)

| Code | Message | When |
|------|---------|------|
| `rest_not_found` | Item not found | Resource doesn't exist |

#### Server Errors (500)

| Code | Message | When |
|------|---------|------|
| `rest_cannot_create` | Creation failed | Database insert failed |
| `rest_cannot_update` | Update failed | Database update failed |
| `rest_cannot_delete` | Deletion failed | Database delete failed |
| `rest_error` | Server error | Unexpected error occurred |

### Frontend Error Handling Guidelines

1. **Check `data.status`** for HTTP status code
2. **Use `code`** to display appropriate user-friendly message
3. **For 401 errors**: Clear tokens and redirect to login
4. **For 403 errors**: Show "access denied" message
5. **For 500 errors**: Show retry option (these are logged server-side)

### Error Logging

Server errors (500) and auth failures (401, 403) are automatically logged as analytics events with:
- Error code and message
- Endpoint and HTTP method
- User/guest context
- Hashed IP (for correlation, not tracking)

---

## Entity Field Reference

Complete field documentation for all entities accessible via the API.

### Appointments (CPT: `wpbe_appointment`)

Stored as WordPress Custom Post Type with post_meta fields.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `appointment_type` | string | Yes | Type of appointment |
| `client_id` | int | No* | Client ID (CPT ID) |
| `lead_id` | int | No* | Lead ID (custom table) |
| `project_id` | int | No | Related project ID |
| `scheduled_datetime` | datetime | Yes | Date/time (YYYY-MM-DD HH:MM:SS) |
| `duration` | int | No | Duration in minutes (default: 60) |
| `timezone` | string | No | Timezone (e.g., America/New_York) |
| `meeting_platform` | string | No | Platform for meeting |
| `meeting_link` | url | No | Video call URL |
| `location` | string | No | Physical address if in-person |
| `agenda` | text | No | Meeting agenda/notes |
| `status` | string | Yes | Current status |
| `notes` | text | No | Internal notes |

*Either `client_id` OR `lead_id` is required.

**Valid `appointment_type` values:**
- `consultation` - General consultation (30 min default)
- `discovery_call` - Discovery/intake call (60 min default)
- `project_review` - Project review meeting
- `follow_up` - Follow-up call
- `demo` - Product demonstration
- `training` - Training session

**Valid `status` values:**
- `scheduled` - Appointment booked
- `confirmed` - Client confirmed attendance
- `completed` - Meeting completed
- `cancelled` - Appointment cancelled
- `no_show` - Client did not attend
- `rescheduled` - Moved to new time

**Valid `meeting_platform` values:**
- `zoom` - Zoom video call
- `google_meet` - Google Meet
- `teams` - Microsoft Teams
- `skype` - Skype call
- `phone` - Phone call
- `in_person` - In-person meeting

---

### Leads (Custom Table: `wpbe_leads`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | email | Yes | Lead's email address (unique) |
| `first_name` | string | No | First name |
| `last_name` | string | No | Last name |
| `phone` | string | No | Phone number |
| `company` | string | No | Company name |
| `source` | string | No | Lead source (form type, referral, etc.) |
| `status` | string | No | Lead status |
| `temperature` | int | No | Lead score (0-100) |
| `notes` | text | No | Additional notes |
| `last_contact` | datetime | No | Last interaction date |

**Valid `status` values:**
- `cold` - New/unengaged lead
- `warm` - Showing interest
- `hot` - Ready to convert
- `converted` - Became a client
- `lost` - Did not convert

---

### Form Submissions (Custom Table: `wpbe_form_submissions`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `form_type` | string | Yes | Type of form submitted |
| `sender_email` | email | Yes | Submitter's email |
| `sender_name` | string | No | Submitter's full name |
| `sender_phone` | string | No | Submitter's phone |
| `subject` | string | No | Form subject/title |
| `message` | text | No | Main message content |
| `form_data` | json | No | Additional form fields |
| `submission_status` | string | No | Processing status |

**Valid `form_type` values:**
- `contact_form` - General contact (creates lead)
- `quote_request` - Quote request (creates lead)
- `request_a_quote` - Detailed quote (creates lead)
- `book_a_call` - Booking request (creates lead + appointment)
- `discovery_intake` - Discovery form (creates lead + appointment)
- `support_request` - Support ticket (creates ticket if logged in)
- `quick_message` - Short message only
- `newsletter_signup` - Email subscription only
- `support_form` - General support
- `faq_question` - FAQ submission

**Valid `submission_status` values:**
- `new` - Just submitted
- `pending` - Awaiting review
- `processed` - Reviewed/handled
- `converted` - Converted to another entity
- `converted_to_lead` - Lead was created
- `converted_to_appointment` - Appointment was created
- `archived` - No longer active

---

### Guest Users (Custom Table: `wpbe_guest_users`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `guest_id` | string | Auto | Unique guest identifier |
| `session_token` | string | Auto | Session authentication token |
| `first_seen` | datetime | Auto | First visit timestamp |
| `last_seen` | datetime | Auto | Last activity timestamp |
| `ip_address` | string | Auto | Visitor IP (privacy-safe) |
| `user_agent` | text | Auto | Browser user agent |
| `utm_source` | string | No | UTM source parameter |
| `utm_medium` | string | No | UTM medium parameter |
| `utm_campaign` | string | No | UTM campaign parameter |
| `utm_term` | string | No | UTM term parameter |
| `utm_content` | string | No | UTM content parameter |
| `converted_to_user_id` | int | No | WP user ID if converted |
| `converted_to_lead_id` | int | No | Lead ID if converted |
| `converted_at` | datetime | No | Conversion timestamp |
| `status` | string | No | Guest status |

**Valid `status` values:**
- `active` - Currently tracking
- `converted` - Became lead/user
- `expired` - Session timed out

---

### Analytics Events (Custom Table: `wpbe_analytics_events`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `guest_id` | string | No | Guest user ID |
| `user_id` | int | No | WP user ID if logged in |
| `event_type` | string | Yes | Type of event |
| `event_data` | json | No | Event-specific data |
| `page_url` | string | No | Page where event occurred |
| `referrer` | string | No | Referrer URL |

**Common `event_type` values:**
- `page_view` - Page was viewed
- `cta_click` - CTA button clicked
- `form_start` - Form interaction began
- `form_progress` - Form step completed
- `form_submit` - Form submitted
- `api_error` - API error occurred (auto-logged)

---

### Tickets (Custom Table: `wpbe_tickets`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ticket_number` | string | Auto | Unique ticket ID (TKT-XXXXXXXX) |
| `user_id` | int | Yes | Creator's WP user ID |
| `subject` | string | Yes | Ticket subject |
| `description` | text | No | Detailed description |
| `priority` | string | No | Urgency level |
| `status` | string | No | Current status |
| `category` | string | No | Ticket category |
| `assigned_to` | int | No | Assigned admin user ID |
| `conversation_id` | int | Auto | Linked conversation |

**Valid `priority` values:**
- `low` - Low priority
- `medium` - Normal priority (default)
- `high` - High priority
- `urgent` - Urgent/critical

**Valid `status` values:**
- `open` - New ticket
- `in_progress` - Being worked on
- `waiting_customer` - Awaiting customer reply
- `waiting_internal` - Awaiting internal response
- `resolved` - Issue resolved
- `closed` - Ticket closed

---

### Messages (Custom Table: `wpbe_messages`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `conversation_id` | int | Yes | Parent conversation ID |
| `sender_type` | string | Yes | Type of sender |
| `sender_id` | int | No | WP user ID (if applicable) |
| `sender_email` | email | No | Email (for guests) |
| `sender_name` | string | No | Name (for guests) |
| `content` | text | Yes | Message content |
| `is_internal` | bool | No | Internal note (admin only) |
| `is_read` | bool | No | Read status |

**Valid `sender_type` values:**
- `guest` - Anonymous visitor
- `member` - Registered user
- `client` - Client user
- `admin` - Administrator

---

### Services (CPT: `wpbe_service`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Service name (post_title) |
| `description` | html | No | Full description (post_content) |
| `excerpt` | text | No | Short description |
| `featured_image` | int | No | Attachment ID |
| `base_price` | decimal | No | Starting price |
| `pricing_model` | string | No | How pricing works |
| `is_active` | bool | No | Available for booking |
| `display_order` | int | No | Sort order |

**Valid `pricing_model` values:**
- `fixed` - Fixed price
- `hourly` - Per hour
- `project` - Per project
- `retainer` - Monthly retainer
- `custom` - Custom quote required

---

### Dynamic Cards (CPT: `wpbe_dynamic_card`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Card title (post_title) |
| `content` | html | No | Card content (post_content) |
| `featured_image` | int | No | Attachment ID |
| `card_type` | string | No | Type of card |
| `visibility` | string | No | Who can see it |
| `is_active` | bool | No | Currently active |
| `display_order` | int | No | Sort order |
| `cta_text` | string | No | Call-to-action text |
| `cta_url` | url | No | CTA link URL |
| `linked_entity_type` | string | No | Related entity type |
| `linked_entity_id` | int | No | Related entity ID |

**Valid `card_type` values:**
- `hero` - Hero banner
- `feature` - Feature highlight
- `service` - Service card
- `stat` - Statistics display
- `cta` - Call-to-action
- `testimonial` - Testimonial card
- `product` - Product card

**Valid `visibility` values:**
- `public` - Anyone can see
- `private` - Logged-in users only
- `admin` - Administrators only
