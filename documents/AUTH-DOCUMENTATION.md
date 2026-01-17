# WPBE Pro Authentication System

Extends JWT Authentication plugin with registration, password reset, and user management.

---

## Endpoints Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | Public | Create new user account |
| `/auth/forgot-password` | POST | Public | Request password reset email |
| `/auth/reset-password` | POST | Public | Reset password with key |
| `/auth/me` | GET | JWT | Get current user info |
| `/jwt-auth/v1/token` | POST | Public | Login (JWT plugin) |

---

## User Registration

**Endpoint:** `POST /wp-json/wpbe/v1/auth/register`

```js
fetch('/wp-json/wpbe/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    username: 'johndoe',
    password: 'securepass123'
  })
});
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "message": "Registration successful. You can now log in.",
    "user": {
      "id": 5,
      "username": "johndoe",
      "email": "john@example.com",
      "display_name": "John Doe"
    }
  }
}
```

**Validation:**
- Email: Required, valid format, unique
- Username: Required, unique
- Password: Required, minimum 8 characters
- New users get "member" role (not "client")

---

## Login (JWT Plugin)

**Endpoint:** `POST /wp-json/jwt-auth/v1/token`

```js
const login = async (username, password) => {
  const res = await fetch('/wp-json/jwt-auth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) localStorage.setItem('jwt_token', data.token);
  return data;
};
```

---

## Forgot Password

**Endpoint:** `POST /wp-json/wpbe/v1/auth/forgot-password`

```js
fetch('/wp-json/wpbe/v1/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@example.com' })
});
```

**Response:** Always returns success (prevents email enumeration)
```json
{
  "success": true,
  "data": {
    "message": "If an account with that email exists, a password reset link has been sent."
  }
}
```

**Email sent to user contains:**
```
Reset URL: https://yoursite.com/reset-password.html?key=RESET_KEY&login=USERNAME
```

---

## Reset Password

**Endpoint:** `POST /wp-json/wpbe/v1/auth/reset-password`

```js
// Extract params from URL: ?key=RESET_KEY&login=USERNAME
const params = new URLSearchParams(window.location.search);

fetch('/wp-json/wpbe/v1/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: params.get('key'),
    login: params.get('login'),
    password: 'newSecurePass123'
  })
});
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password has been reset successfully. You can now log in with your new password."
  }
}
```

---

## Error Codes

| Code | Message |
|------|---------|
| `rest_missing_email` | Email is required |
| `rest_missing_username` | Username is required |
| `rest_missing_password` | Password is required |
| `rest_invalid_email` | Invalid email address |
| `rest_email_exists` | Email already registered |
| `rest_username_exists` | Username already taken |
| `rest_weak_password` | Password too short (min 8 chars) |
| `rest_expired_key` | Reset link expired |
| `rest_invalid_key` | Invalid reset link |

---

## Customization Hooks

### Change Reset URL Base
```php
add_filter('wpbe_password_reset_url', function($url) {
    return 'https://myapp.com/reset-password';
});
```

### Customize Reset Email Subject
```php
add_filter('wpbe_password_reset_email_subject', function($subject, $user) {
    return 'Reset your password - ' . get_bloginfo('name');
}, 10, 2);
```

### Customize Reset Email Message
```php
add_filter('wpbe_password_reset_email_message', function($message, $user, $reset_url) {
    return "Hi {$user->display_name},\n\nClick here to reset: {$reset_url}";
}, 10, 3);
```

---

## Frontend Flow

```
1. REGISTER
   User fills form → POST /auth/register → Success → Redirect to login

2. LOGIN
   User fills form → POST /jwt-auth/v1/token → Store JWT → Redirect to dashboard

3. FORGOT PASSWORD
   User enters email → POST /auth/forgot-password → Email sent with reset link

4. RESET PASSWORD
   User clicks email link → Lands on reset-password.html?key=X&login=Y
   User enters new password → POST /auth/reset-password → Success → Redirect to login
```

---

## Security Features

- Password minimum 8 characters
- Email enumeration protection (forgot-password always returns success)
- Reset keys expire after 24 hours (WordPress default)
- All actions logged via WPBE Logger
- Input sanitization on all fields

---

## Magic Link Authentication

**Not yet implemented.** A magic link feature would allow passwordless login:

1. User enters email
2. System sends email with one-time login link
3. User clicks link and is automatically logged in

To implement, you would need:
- New endpoint: `POST /auth/magic-link`
- Custom token storage (database table or user meta)
- Token validation endpoint
- Auto-login on valid token

Let me know if you'd like me to implement this feature.
