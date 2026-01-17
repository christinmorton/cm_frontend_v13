# Error Handling Standardization Plan

## Goal
Create a standardized error handling system with the **backend API as the single source of truth**. The backend will:
1. Define all error codes and messages
2. Log server errors (500) and auth failures (401/403) as analytics events
3. Provide documentation for frontend consumption

---

## Part 1: Backend Error Logging (WordPress Plugin)

### Error Events to Log

| Status | Category | Log? | Reason |
|--------|----------|------|--------|
| 500 | Server | **Yes** | Bugs, failed operations |
| 401 | Auth | **Yes** | Session issues, token problems |
| 403 | Permission | **Yes** | Access violations, potential attacks |
| 404 | Not Found | No | Usually expected |
| 400 | Validation | No | User error, too noisy |

### Implementation: Error Logger Class

**File:** `includes/api/class-error-logger.php`

```php
<?php
namespace WPBE\API;

class ErrorLogger {

    /**
     * Log an API error as an analytics event
     */
    public static function log( $error_code, $message, $status, $context = [] ) {
        // Only log 500, 401, 403 errors
        if ( ! in_array( $status, [ 500, 401, 403 ], true ) ) {
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'wpbe_analytics_events';

        // Get user/guest context
        $user_id = get_current_user_id();
        $guest_id = self::get_guest_id();

        $event_data = [
            'error_code'  => $error_code,
            'message'     => $message,
            'endpoint'    => $_SERVER['REQUEST_URI'] ?? '',
            'method'      => $_SERVER['REQUEST_METHOD'] ?? '',
            'user_agent'  => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'ip_hash'     => self::hash_ip(),  // Privacy: hash, don't store raw IP
        ];

        // Add safe context (exclude sensitive data)
        if ( ! empty( $context ) ) {
            unset( $context['password'], $context['token'], $context['key'] );
            $event_data['context'] = $context;
        }

        $wpdb->insert( $table, [
            'guest_id'    => $guest_id,
            'user_id'     => $user_id ?: null,
            'event_type'  => 'api_error',
            'event_data'  => wp_json_encode( $event_data ),
            'page_url'    => $_SERVER['HTTP_REFERER'] ?? '',
            'created_at'  => current_time( 'mysql' ),
        ] );
    }

    private static function get_guest_id() {
        $token = $_SERVER['HTTP_X_GUEST_TOKEN'] ?? '';
        if ( empty( $token ) ) return null;

        global $wpdb;
        $table = $wpdb->prefix . 'wpbe_guests';
        return $wpdb->get_var( $wpdb->prepare(
            "SELECT id FROM $table WHERE session_token = %s",
            $token
        ) );
    }

    private static function hash_ip() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        return $ip ? substr( hash( 'sha256', $ip . wp_salt() ), 0, 16 ) : null;
    }
}
```

### Integration: Update BaseController

**File:** `includes/api/class-base-controller.php`

Add logging to the `error_response` method:

```php
protected function error_response( $message, $code = 400, $error_code = 'rest_error', $context = [] ) {
    // Log server and auth errors
    ErrorLogger::log( $error_code, $message, $code, $context );

    return new \WP_Error(
        $error_code,
        $message,
        [ 'status' => $code ]
    );
}
```

### Files to Modify/Create (Backend)

| File | Action |
|------|--------|
| `includes/api/class-error-logger.php` | **Create** - Error logging class |
| `includes/api/class-base-controller.php` | **Modify** - Add logging call |
| `includes/api/class-api-init.php` | **Modify** - Require error logger |

---

## Part 2: Error Code Documentation (API Reference)

Update API documentation with complete error code reference.

**File:** `docs/API-DOCUMENTATION.md` - Add new section:

```markdown
## Error Handling

### Error Response Format

All errors return this structure:
```json
{
  "code": "rest_not_found",
  "message": "Item not found",
  "data": { "status": 404 }
}
```

### Error Codes Reference

#### Authentication (401)
| Code | Message | When |
|------|---------|------|
| `rest_not_logged_in` | You must be logged in | Protected endpoint, no token |
| `rest_invalid_token` | Invalid session token | Guest token invalid |
| `rest_guest_expired` | Session expired | Guest session timed out |
| `rest_expired_key` | Reset link expired | Password reset link too old |
| `rest_invalid_key` | Invalid reset link | Password reset link invalid |

#### Permission (403)
| Code | Message | When |
|------|---------|------|
| `rest_forbidden` | Permission denied | Insufficient role |
| `rest_not_owner` | Access denied | Not resource owner |

#### Validation (400)
| Code | Message | When |
|------|---------|------|
| `rest_invalid_param` | Invalid parameter | Validation failed |
| `rest_missing_param` | Required field missing | Required field empty |
| `rest_email_exists` | Email already registered | Duplicate email |
| `rest_username_exists` | Username taken | Duplicate username |
| `rest_weak_password` | Password too short | < 8 characters |
| `rest_invalid_email` | Invalid email format | Email validation failed |
| `rest_invalid_slot` | Time slot unavailable | Appointment conflict |

#### Not Found (404)
| Code | Message | When |
|------|---------|------|
| `rest_not_found` | Item not found | Resource doesn't exist |

#### Server (500)
| Code | Message | When |
|------|---------|------|
| `rest_cannot_create` | Creation failed | Database insert failed |
| `rest_cannot_update` | Update failed | Database update failed |
| `rest_cannot_delete` | Deletion failed | Database delete failed |
| `rest_error` | Server error | Unexpected error |

### Frontend Error Handling

1. Check `data.status` for HTTP status code
2. Use `code` to display appropriate user message
3. For 401 errors: Clear tokens, redirect to login
4. For 500 errors: Show retry option
```

---

## Part 3: Frontend Implementation (Vanilla JavaScript)

### Error Constants (Sync with Backend)

```javascript
// js/utils/error-constants.js

export const ERROR_CATEGORY = {
  VALIDATION: 'validation',   // 400
  AUTH: 'auth',               // 401
  PERMISSION: 'permission',   // 403
  NOT_FOUND: 'not_found',     // 404
  SERVER: 'server',           // 500
  NETWORK: 'network'          // No response
};

// These messages match the backend - update if backend changes
export const ERROR_MESSAGES = {
  // Auth (401)
  rest_not_logged_in: 'Please log in to continue',
  rest_invalid_token: 'Your session has expired',
  rest_guest_expired: 'Your session has expired',
  rest_expired_key: 'This reset link has expired',
  rest_invalid_key: 'This reset link is invalid',

  // Permission (403)
  rest_forbidden: "You don't have permission to do this",
  rest_not_owner: 'You cannot access this resource',

  // Validation (400)
  rest_invalid_param: 'Please check your input',
  rest_missing_param: 'Required information is missing',
  rest_email_exists: 'This email is already registered',
  rest_username_exists: 'This username is taken',
  rest_weak_password: 'Password must be at least 8 characters',
  rest_invalid_email: 'Please enter a valid email address',
  rest_invalid_slot: 'This time slot is no longer available',

  // Not Found (404)
  rest_not_found: 'The requested item was not found',

  // Server (500)
  rest_cannot_create: 'Unable to create. Please try again',
  rest_cannot_update: 'Unable to save changes',
  rest_cannot_delete: 'Unable to delete',
  rest_error: 'Something went wrong. Please try again',

  // Network
  network_error: 'Connection failed. Check your internet'
};
```

### API Error Class

```javascript
// js/utils/api-error.js

import { ERROR_CATEGORY, ERROR_MESSAGES } from './error-constants.js';

export class ApiError extends Error {
  constructor(response) {
    const code = response?.code || 'rest_error';
    const message = response?.message || 'An unexpected error occurred';
    const status = response?.data?.status || 500;
    const displayMessage = ERROR_MESSAGES[code] || message;

    super(displayMessage);

    this.code = code;
    this.status = status;
    this.originalMessage = message;
    this.category = this.getCategory(status);
    this.isRetryable = status >= 500 || status === 0;
  }

  getCategory(status) {
    if (status === 0) return ERROR_CATEGORY.NETWORK;
    if (status === 400) return ERROR_CATEGORY.VALIDATION;
    if (status === 401) return ERROR_CATEGORY.AUTH;
    if (status === 403) return ERROR_CATEGORY.PERMISSION;
    if (status === 404) return ERROR_CATEGORY.NOT_FOUND;
    return ERROR_CATEGORY.SERVER;
  }

  requiresAuth() {
    return this.category === ERROR_CATEGORY.AUTH;
  }

  canRetry() {
    return this.isRetryable;
  }
}

export function createNetworkError() {
  return new ApiError({
    code: 'network_error',
    message: 'Unable to connect to server',
    data: { status: 0 }
  });
}
```

### API Client

```javascript
// js/services/api-client.js

import { ApiError, createNetworkError } from '../utils/api-error.js';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getAuthHeaders() {
    const headers = {};
    const token = localStorage.getItem('jwt_token');
    const guestToken = localStorage.getItem('guest_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (guestToken) headers['X-Guest-Token'] = guestToken;
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        return data;
      }

      throw new ApiError(data);

    } catch (err) {
      if (err instanceof ApiError) {
        if (err.requiresAuth()) {
          window.dispatchEvent(new CustomEvent('api:auth-required', { detail: { error: err } }));
        }
        throw err;
      }
      throw createNetworkError();
    }
  }

  get(endpoint) { return this.request(endpoint, { method: 'GET' }); }
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiClient('https://your-site.com/wp-json/wpbe/v1');
```

### Error Display Utilities

```javascript
// js/utils/error-display.js

export function showError(containerEl, error, options = {}) {
  clearError(containerEl);

  const errorEl = document.createElement('div');
  errorEl.className = `error-message error-${error.category}`;
  errorEl.setAttribute('role', 'alert');
  errorEl.innerHTML = `<span>${error.message}</span>`;

  if (options.showRetry && error.canRetry() && options.onRetry) {
    const btn = document.createElement('button');
    btn.textContent = 'Try Again';
    btn.onclick = () => { clearError(containerEl); options.onRetry(); };
    errorEl.appendChild(btn);
  }

  containerEl.prepend(errorEl);
}

export function clearError(containerEl) {
  const existing = containerEl.querySelector('.error-message');
  if (existing) existing.remove();
}
```

---

## Files Summary

### Backend (WordPress Plugin)
| File | Action |
|------|--------|
| `includes/api/class-error-logger.php` | Create |
| `includes/api/class-base-controller.php` | Modify (add logging) |
| `includes/api/class-api-init.php` | Modify (require logger) |
| `docs/API-DOCUMENTATION.md` | Modify (add error reference) |

### Frontend (JavaScript)
| File | Purpose |
|------|---------|
| `js/utils/error-constants.js` | Error codes & messages |
| `js/utils/api-error.js` | ApiError class |
| `js/services/api-client.js` | Fetch wrapper |
| `js/utils/error-display.js` | DOM utilities |

---

## Verification

### Backend
1. Trigger a 500 error → Check `wpbe_analytics_events` table for `api_error` event
2. Access protected endpoint without token → Verify 401 is logged
3. Access admin endpoint as client → Verify 403 is logged
4. Submit invalid form data → Verify 400 is NOT logged

### Frontend
1. Network error → Shows "Connection failed" with retry
2. 401 error → Fires `api:auth-required` event
3. 400 error → Shows user-friendly message
4. 500 error → Shows retry button
