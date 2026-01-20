# Issue Tracker

Non-critical bugs and improvements to be addressed in future updates.

## Status Legend

- **Open** - Identified, not yet fixed
- **In Progress** - Currently being worked on
- **Resolved** - Fixed (move to Resolved section with date)

---

## Open Issues

### [ISS-004] Local fallback URLs in services
- **Files**:
  - `src/js/api.js`
  - `src/js/tracking/Analytics.js`
  - `src/js/tracking/GuestManager.js`
  - `src/js/services/FormSubmissionService.js`
  - `src/js/services/MediaService.js`
  - `src/js/services/CommentService.js`
- **Description**: All services have `http://general-wp.local` as fallback when env var is missing
- **Impact**: None in production (env vars are set), but could cause confusion in dev
- **Fix**: Consider throwing error if required env vars are missing, or document `.env` setup
- **Date opened**: 2025-01-19

### [ISS-005] Auth redirect paths need configuration
- **Files**: `login.html`, `signup.html`, `forgot-password.html`, `reset-password.html`
- **Description**: Auth pages redirect to `/index.html` after login. This should be configurable.
- **Impact**: Low - Works for basic use cases
- **Fix**: Add `VITE_AUTH_REDIRECT_URL` environment variable or make it configurable per page
- **Date opened**: 2025-01-19

---

## In Progress

*No issues currently in progress*

---

## Resolved

### [ISS-001] Hardcoded WooCommerce checkout URL
- **File**: `v13_vite/cart.html` (deleted)
- **Resolution**: File removed during template simplification - e-commerce pages deleted
- **Date opened**: 2025-01-19
- **Date resolved**: 2025-01-19

### [ISS-002] GTM ID hardcoded in HTML
- **File**: `v13_vite/index.html`
- **Resolution**: GTM script removed during template simplification
- **Date opened**: 2025-01-19
- **Date resolved**: 2025-01-19

### [ISS-003] Three.js dependency unused in most pages
- **File**: `src/main.js`, `package.json`
- **Resolution**: Three.js removed from project during template simplification
- **Date opened**: 2025-01-19
- **Date resolved**: 2025-01-19

---

## How to Add an Issue

Copy this template:

```markdown
### [ISS-XXX] Short title
- **File**: `path/to/file.js` line X
- **Description**: What's wrong
- **Impact**: High/Medium/Low - What breaks or is affected
- **Fix**: Suggested solution
- **Date opened**: YYYY-MM-DD
```

Assign the next available ISS number (check the highest existing number and increment).
