# Issue Tracker

Non-critical bugs and improvements to be addressed in future updates.

## Status Legend

- **Open** - Identified, not yet fixed
- **In Progress** - Currently being worked on
- **Resolved** - Fixed (move to Resolved section with date)

---

## Open Issues

### [ISS-001] Hardcoded WooCommerce checkout URL
- **File**: `v13_vite/cart.html` line 169
- **Description**: Checkout URL is hardcoded as `http://general-wp.local/checkout/`
- **Impact**: Low - Cart functionality won't work in production
- **Fix**: Replace with `import.meta.env.VITE_WC_CHECKOUT_URL`
- **Blocked by**: Need to update archived version branches first
- **Date opened**: 2025-01-19

### [ISS-002] GTM ID hardcoded in HTML
- **File**: `v13_vite/index.html` lines 88-97
- **Description**: Google Tag Manager ID is hardcoded directly in HTML
- **Impact**: Low - Works, but not configurable per environment
- **Fix**: Inject GTM script dynamically using `import.meta.env.VITE_GTM_ID`
- **Date opened**: 2025-01-19

### [ISS-003] Local fallback URLs in services
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

---

## In Progress

*No issues currently in progress*

---

## Resolved

### [ISS-000] Template
- **File**: `path/to/file.js` line X
- **Description**: Description of the issue
- **Resolution**: How it was fixed
- **Date opened**: YYYY-MM-DD
- **Date resolved**: YYYY-MM-DD

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
