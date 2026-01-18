# Guest Tracking API - Implementation Guide

## Overview

Backend API for tracking engaged visitors, recording analytics events, and converting guests to leads. Guests are created on engagement (CTA clicks or form interactions), not on page load.

---

## API Endpoints

### 1. Create Guest (Public)
```
POST /wp-json/wpbe/v1/guests

Request:
{
  "user_agent": "Mozilla/5.0...",
  "referrer_url": "https://google.com",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "spring-promo",
  "utm_term": "keyword",
  "utm_content": "ad-variant"
}

Response (201):
{
  "success": true,
  "data": {
    "guest_id": "uuid-string",
    "session_token": "random-32-char-string"
  }
}
```
Server captures: IP address from request headers.

### 2. Touch Session (Update last_seen)
```
POST /wp-json/wpbe/v1/guests/{guest_id}/touch
Header: X-Guest-Token: {session_token}

Response (200):
{
  "success": true,
  "data": { "touched": true }
}
```

### 3. Record Single Event
```
POST /wp-json/wpbe/v1/analytics/events
Header: X-Guest-Token: {session_token}

Request:
{
  "guest_id": "uuid",
  "event_type": "form_progress",
  "event_data": {
    "form_id": "qualification",
    "step": 2,
    "field_data": { "budget": "5000-10000" }
  },
  "page_path": "/discovery/step-2",
  "referrer": "/discovery/step-1"
}

Response (201):
{
  "success": true,
  "data": { "event_id": 123 }
}
```

**Valid event_types:** `cta_click`, `form_start`, `form_progress`, `form_submit`, `page_view`

### 4. Batch Events
```
POST /wp-json/wpbe/v1/analytics/events/batch
Header: X-Guest-Token: {session_token}

Request:
{
  "guest_id": "uuid",
  "events": [
    { "event_type": "page_view", "event_data": { "page_title": "Home" }, "page_path": "/" },
    { "event_type": "cta_click", "event_data": { "cta_id": "hero-btn" }, "page_path": "/" }
  ]
}

Response (201):
{
  "success": true,
  "data": { "saved_count": 2, "total_count": 2 }
}
```

### 5. Convert Guest to Lead
```
POST /wp-json/wpbe/v1/guests/{guest_id}/convert
Header: X-Guest-Token: {session_token}

Request:
{
  "form_id": "quote-request",
  "form_data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "company_name": "Acme Inc",
    "message": "I need a quote for..."
  },
  "temperature": "hot"
}

Response (201):
{
  "success": true,
  "data": { "lead_id": 45, "guest_id": "uuid" }
}
```

---

## Frontend Integration

### localStorage Keys
- `wpbe_guest_id` - Guest UUID
- `wpbe_guest_token` - Session token for API auth
- `wpbe_guest_date` - For same-day session check
- `wpbe_opt_out` - Set to "true" to disable tracking

### Guest Manager Pattern
```js
const guestManager = {
  async ensureGuest() {
    if (localStorage.getItem('wpbe_opt_out') === 'true') return null;
    if (this.hasGuest()) return this.getGuestId();

    const response = await fetch('/wp-json/wpbe/v1/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_agent: navigator.userAgent,
        referrer_url: document.referrer,
        utm_source: new URLSearchParams(location.search).get('utm_source'),
        utm_medium: new URLSearchParams(location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(location.search).get('utm_campaign')
      })
    });

    const { data } = await response.json();
    localStorage.setItem('wpbe_guest_id', data.guest_id);
    localStorage.setItem('wpbe_guest_token', data.session_token);
    localStorage.setItem('wpbe_guest_date', new Date().toDateString());
    return data.guest_id;
  },

  hasGuest() {
    return !!localStorage.getItem('wpbe_guest_id');
  },

  getGuestId() { return localStorage.getItem('wpbe_guest_id'); },
  getToken() { return localStorage.getItem('wpbe_guest_token'); }
};
```

### Analytics Tracker Pattern
```js
const analytics = {
  queue: [],

  track(eventType, eventData, pagePath) {
    this.queue.push({ event_type: eventType, event_data: eventData, page_path: pagePath });
  },

  async flush() {
    if (!this.queue.length || !guestManager.hasGuest()) return;

    await fetch('/wp-json/wpbe/v1/analytics/events/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Token': guestManager.getToken()
      },
      body: JSON.stringify({
        guest_id: guestManager.getGuestId(),
        events: this.queue
      })
    });
    this.queue = [];
  },

  trackPageView() { this.track('page_view', { page_title: document.title }, location.pathname); },
  trackCtaClick(ctaId) { this.track('cta_click', { cta_id: ctaId }, location.pathname); },
  trackFormStart(formId) { this.track('form_start', { form_id: formId }, location.pathname); },
  trackFormProgress(formId, step, data) { this.track('form_progress', { form_id: formId, step, field_data: data }, location.pathname); }
};

// Flush every 5 seconds and on page unload
setInterval(() => analytics.flush(), 5000);
window.addEventListener('beforeunload', () => analytics.flush());
```

### CTA Click Handler
```js
document.querySelectorAll('[data-cta]').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    await guestManager.ensureGuest();
    analytics.trackCtaClick(e.target.dataset.cta);
  });
});
```

### Form Tracking
```js
document.querySelectorAll('form[data-track]').forEach(form => {
  const formId = form.dataset.track;

  form.addEventListener('focusin', async () => {
    await guestManager.ensureGuest();
    analytics.trackFormStart(formId);
  }, { once: true });

  form.addEventListener('submit', () => {
    analytics.track('form_submit', { form_id: formId, form_data: Object.fromEntries(new FormData(form)) }, location.pathname);
    analytics.flush();
  });
});
```

---

## Database Schema

### wpbe_guest_users
| Column | Type | Description |
|--------|------|-------------|
| guest_id | VARCHAR(100) | UUID (unique) |
| session_token | VARCHAR(255) | Auth token |
| first_seen / last_seen | DATETIME | Timestamps |
| ip_address | VARCHAR(45) | Client IP |
| user_agent | TEXT | Browser info |
| utm_source/medium/campaign/term/content | VARCHAR | UTM params |
| referrer_url | TEXT | HTTP referrer |
| page_views_count / events_count | INT | Counters |
| converted_to_lead_id | BIGINT | FK to leads |
| converted_at | DATETIME | Conversion time |
| status | VARCHAR(20) | active/converted/expired |

### wpbe_analytics_events
| Column | Type | Description |
|--------|------|-------------|
| event_type | VARCHAR(50) | Event type |
| session_id | VARCHAR(100) | Guest UUID |
| ip_address | VARCHAR(45) | Client IP |
| user_agent | TEXT | Browser info |
| page_path | TEXT | URL path |
| referrer | TEXT | Previous page |
| event_data | TEXT (JSON) | Event payload |
| event_timestamp | DATETIME | When event occurred |

---

## Conversion Flow

| Form Completed | Temperature | Lead Status |
|----------------|-------------|-------------|
| free-consultation | hot | warm (75) |
| quote-request | hot | warm (75) |
| contact | cold | cold (25) |
| quick-message | cold | cold (25) |

---

## Session Rules

- **Same day** = same session (call `/touch` to update `last_seen`)
- **90-day expiration** for unconverted guests
- **Opt-out** via `localStorage.setItem('wpbe_opt_out', 'true')`
