# Form Submission Service

This service handles form submissions to the WPBE Pro Form Submission API.

## Usage

### Automatic Initialization

Add the `data-wpbe-form` attribute to your form with the form type:

```html
<form data-wpbe-form="contact_form">
    <input type="email" name="email" required>
    <input type="text" name="name">
    <textarea name="message" required></textarea>
    <button type="submit">Submit</button>
    <div class="form-status" aria-live="polite"></div>
</form>
```

Forms are automatically initialized when the page loads.

### Manual Initialization

```javascript
import { initFormSubmission, FORM_TYPES } from './services/index.js';

const form = document.querySelector('#my-form');
initFormSubmission(form, {
    formType: FORM_TYPES.CONTACT_FORM,
    onSuccess: (response) => {
        console.log('Success!', response);
    },
    onError: (error) => {
        console.error('Error:', error);
    }
});
```

### Direct API Usage

```javascript
import { formSubmissionService, FORM_TYPES } from './services/index.js';

const formData = {
    form_type: FORM_TYPES.CONTACT_FORM,
    sender_email: 'user@example.com',
    sender_name: 'John Doe',
    message: 'Hello!'
};

try {
    const response = await formSubmissionService.submit(formData);
    console.log('Success:', response.data.message);
} catch (error) {
    console.error('Error:', error.message);
}
```

## Valid Form Types

- `contact_form` - General contact inquiries
- `quick_message` - Short/quick message submissions
- `book_a_call` - Schedule a call requests
- `request_a_quote` - Detailed quote requests
- `quote_request` - Quick quote/estimate requests
- `discovery_intake` - Discovery/onboarding intake forms
- `newsletter_signup` - Email newsletter subscriptions
- `support_request` - Support ticket requests
- `support_form` - General support inquiries
- `faq_question` - FAQ submissions

## Form Field Mapping

The service automatically maps common form field names:

- `email`, `sender_email`, `e-mail` → `sender_email` (required)
- `name`, `sender_name`, `full_name` → `sender_name`
- `phone`, `sender_phone`, `tel` → `sender_phone`
- `subject`, `title` → `subject`
- `message`, `body`, `comments` → `message`

All other fields are collected into `form_data` object.
