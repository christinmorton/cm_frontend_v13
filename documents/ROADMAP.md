# Project Roadmap

This document tracks planned features, integrations, and improvements for the christinmorton.com frontend.

## Status Legend

- [ ] Not started
- [x] Completed
- [~] In progress

---

## High Priority

### AI Chatbot Integration
- [ ] Design chatbot architecture (client widget + backend proxy)
- [ ] Set up OpenAI API integration on backend (avoid exposing key client-side)
- [ ] Create chat widget component
- [ ] Implement conversation context management
- [ ] Add chat history persistence (optional)
- [ ] Consider offering as white-label service for clients

### Deployment & Infrastructure
- [x] Set up GitHub Actions CI/CD workflow
- [x] Configure production branch deployment
- [x] Set up deploy user and SSH keys on server
- [x] Configure environment variables in deploy.yml
- [ ] Verify first deployment to production
- [ ] Set up Nginx configuration on server
- [ ] Configure SSL certificate (Let's Encrypt)

---

## Medium Priority

### Payment Integration (Stripe)
- [ ] Add Stripe publishable key to GitHub secrets
- [ ] Implement deposit payment flow (flows/deposit.html)
- [ ] Add payment confirmation handling
- [ ] Test Stripe webhook integration with WordPress backend

### Scheduling Integration
- [ ] Set up Calendly account/booking page
- [ ] Embed Calendly widget in consultation flow
- [ ] Alternative: Evaluate Cal.com for self-hosted option
- [ ] Integrate with Google Calendar for availability sync

### Email Notifications
- [ ] Evaluate SendGrid vs Mailgun for transactional emails
- [ ] Set up email templates for form confirmations
- [ ] Configure email notifications through WordPress backend

---

## Lower Priority

### Google Places Integration
- [ ] Set up Google Business Profile
- [ ] Obtain Google Places API key
- [ ] Display Google reviews on site
- [ ] Add structured data for local SEO

### Notion Integration
- [ ] Evaluate Notion API for client project visibility
- [ ] Design client-facing project board template
- [ ] Implement read-only project status widget

### Code Improvements
- [ ] Update cart.html to use VITE_WC_CHECKOUT_URL environment variable
- [ ] Make GTM ID load dynamically from environment variable in index.html
- [ ] Add error boundary/fallback UI for API failures
- [ ] Implement service worker for offline support

---

## Completed

### Smart Thank You Page (v1.0)
- [x] Dynamic content based on form type
- [x] Name personalization from URL params
- [x] Auto-redirect countdown with cancel option
- [x] Secondary CTA support (toggled off by default)

### Router Funnel Fix (v1.0)
- [x] Fixed routing logic so Step 4 choice determines destination
- [x] Earlier steps now adjust messaging, not routing
- [x] Documented router funnel system

### Repository Structure (v1.0)
- [x] Reorganized with branch-based variant system
- [x] Main branch contains docs only
- [x] Version branches (v1.0/service) contain app code
- [x] Production branch for deployments

---

## Notes

- **OpenAI API Key**: Should NOT be exposed client-side. Route through backend proxy.
- **Stripe Keys**: Only the publishable key is safe for client-side; secret key stays on server.
- **Google Places**: Requires active Google Business Profile to pull reviews.
