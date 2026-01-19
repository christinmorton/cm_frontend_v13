# Smart Thank You Page

## Overview

The thank you page dynamically renders context-aware content based on the form type the user just submitted. Instead of a generic "Received!" message for all forms, users see personalized messaging that matches their action and sets appropriate expectations.

## Features

### 1. Form-Type Specific Messaging
Each form type displays a unique title, body message, and response timeframe:

| Form Type | Title | Response Time |
|-----------|-------|---------------|
| `quick_message` | Message Sent! | 24 hours |
| `book_a_call` | Call Requested! | Check inbox for confirmation |
| `quote_request` | Quote Request Received! | 48 hours |
| `discovery_intake` | Discovery Intake Complete! | 2-3 business days |
| `contact_form` | Thanks for Reaching Out! | Soon |
| `newsletter_signup` | You're Subscribed! | N/A |
| `testimonial_submission` | Thank You! | After review |

### 2. Name Personalization
If the user provided their name, the title includes it:
- Without name: "Message Sent!"
- With name: "Message Sent, John!"

### 3. Auto-Redirect Countdown
After displaying the thank you message, the page automatically redirects to the home page. Users see a countdown and can cancel if they want to stay.

Redirect delays vary by form complexity:
- **6 seconds**: Newsletter signup (quick action)
- **8 seconds**: Quick message, contact form (standard)
- **10 seconds**: Book a call, quote request (more content to read)
- **12 seconds**: Discovery intake (longest message)

### 4. Secondary CTA (Toggle-able)
Each form type can optionally display a secondary link below the primary button. This feature is **disabled by default** but can be enabled per form type.

Example when enabled:
```
[Back to Home]        <- Primary button
Browse Portfolio →    <- Secondary link
```

## How It Works

### URL Parameters
The form handler appends parameters to the thank you page URL:

```
/flows/thank-you.html?type=quote_request&name=John
```

| Parameter | Source | Purpose |
|-----------|--------|---------|
| `type` | `data-wpbe-form` attribute | Determines which content config to use |
| `name` | `sender_name` from form data | Personalizes the title (first name only) |

### Fallback Behavior
If no `type` parameter is provided (or an invalid one), the page displays the default generic message. This ensures backwards compatibility.

## Files Modified

### formHandler.js
Location: `v13_vite/src/js/utils/formHandler.js`

The `autoInitForms()` function now appends URL parameters on successful form submission:

```javascript
onSuccess: redirectUrl ? (response, formData) => {
    const url = new URL(redirectUrl, window.location.origin);
    url.searchParams.set('type', formType);

    if (formData.sender_name) {
        const firstName = formData.sender_name.split(' ')[0];
        url.searchParams.set('name', firstName);
    }

    window.location.href = url.toString();
} : undefined
```

### thank-you.html
Location: `v13_vite/flows/thank-you.html`

Contains:
- `THANK_YOU_CONTENT` configuration object with all form type definitions
- JavaScript that reads URL params and updates DOM elements
- Countdown timer with cancel functionality
- Hidden secondary CTA element (shown when enabled)

## Configuration

### Adding a New Form Type
Add an entry to the `THANK_YOU_CONTENT` object in `thank-you.html`:

```javascript
new_form_type: {
    title: "Form Submitted!",
    body: "Your custom message here.",
    icon: "icofont-check-circled",
    redirectDelay: 8,
    cta: { text: "Back to Home", href: "../index.html" },
    altCta: { text: "Alternative Action", href: "../page.html", enabled: false }
}
```

### Enabling Secondary CTA
Change `enabled: false` to `enabled: true` for any form type:

```javascript
altCta: { text: "Browse Portfolio", href: "../work.html", enabled: true }
```

### Adjusting Redirect Timing
Modify the `redirectDelay` value (in seconds) for any form type.

## Form Types Supported

All form types from `FormSubmissionService.js` are configured:

- `quick_message`
- `book_a_call`
- `quote_request`
- `request_a_quote`
- `discovery_intake`
- `contact_form`
- `newsletter_signup`
- `faq_question`
- `testimonial_submission`
- `social_proof_submission`
- `support_request`
- `support_form`

## User Experience Flow

1. User fills out a form (e.g., quote request)
2. Form submits successfully to API
3. Browser redirects to `/flows/thank-you.html?type=quote_request&name=John`
4. Thank you page reads parameters and displays:
   - Title: "Quote Request Received, John!"
   - Body: "I'll review your project details and send a custom quote within 48 hours."
   - Countdown: "Redirecting in 10 seconds... [Cancel]"
5. After countdown (or user clicks CTA), redirects to home page
