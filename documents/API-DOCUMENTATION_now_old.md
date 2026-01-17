# WPBE Pro REST API Documentation

**Base URL:** `https://your-site.com/wp-json/wpbe/v1`
**Frontend Use:** Client portal & public website (no admin features)

---

## Authentication

### Login (Members & Clients)
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
    form_type: 'contact_form', // contact_form, quote_request, support_request
    form_data: { name: 'John', message: 'Hello' },
    sender_email: 'user@example.com',
    sender_name: 'John Doe'
  })
});
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
| Services, Testimonials, FAQs | Read | Read | Read |
| Lead/Form Submit | Yes | Yes | Yes |
| `/auth/me` | - | Yes | Yes |
| Tickets | - | Full | Full |
| Projects, Invoices | - | - | Read |
| Appointments | Book | Book | Full |
| Conversations, Messages | - | Send | Full |
| Guest Tracking | Yes | - | - |
| File Upload | Yes | Yes | Yes |
