---
name: WPBE API Integration Completion Plan
overview: Complete the frontend integration with the WordPress REST API by implementing missing public endpoints, client portal features, tickets, messages, appointments, and file uploads.
todos:
  - id: public-content
    content: Implement public content endpoints (Services, Testimonials, Case Studies, FAQs, Social Proof, Dynamic Sections) - Create ContentService.js and update HTML pages
    status: pending
  - id: lead-capture
    content: Implement lead capture endpoint (POST /leads) - Add to FormSubmissionService or create LeadService.js
    status: pending
  - id: projects-list
    content: Create standalone projects list page with filtering by status
    status: pending
  - id: invoices-list
    content: Create invoices list page with filtering (unpaid, by status)
    status: pending
  - id: appointments
    content: Implement appointments system - booking, listing, available slots calendar
    status: pending
  - id: client-profile
    content: Implement client profile management (GET /clients/me, PUT /clients/{id})
    status: pending
  - id: tickets
    content: Implement tickets system - list, create, view, update (full CRUD)
    status: pending
  - id: messages
    content: Implement conversations and messages system - list conversations, view threads, send messages, mark as read
    status: pending
  - id: file-upload
    content: Implement file upload service (POST /media/upload) with guest token support
    status: pending
  - id: dashboard-enhance
    content: Enhance dashboard with all stats from /auth/me, upcoming appointments, unread messages count
    status: pending
---

# WPBE API Integration Completion Plan

## Overview

This plan identifies what's already implemented and what remains to be completed based on the API documentation in `documents/API-DOCUMENTATION.md`.

## Already Implemented

### Core Infrastructure

- **API Client** (`v13_vite/src/js/api.js`): Axios instance with JWT token interceptor, 401 handling
- **Authentication** (`v13_vite/src/js/auth.js`): Login, logout, user data management, auth guards
- **Form Submissions** (`v13_vite/src/js/services/FormSubmissionService.js`): Complete implementation with all form types
- **Guest Tracking** (`v13_vite/src/js/tracking/GuestManager.js`): Guest session creation, validation, conversion
- **Analytics** (`v13_vite/src/js/tracking/Analytics.js`): Event tracking with batching and retry logic

### Client Portal (Partial)

- **Dashboard** (`v13_vite/src/js/dashboard.js`): Basic dashboard with projects list (uses `/projects/my`)
- **Project Details** (`v13_vite/src/js/project-details.js`): Single project view (uses `/projects/{id}`)
- **Invoice Details** (`v13_vite/src/js/invoice-details.js`): Single invoice view (uses `/invoices/{id}`)

## Missing Implementations

### 1. Public Content Endpoints

**Status:** Not implemented

**Endpoints to implement:**

- `GET /services` - List all services
- `GET /services/active` - Active services only
- `GET /services/{id}` - Single service
- `GET /testimonials/approved` - Approved testimonials
- `GET /testimonials/featured` - Featured testimonials
- `GET /case-studies` - List case studies
- `GET /case-studies/featured` - Featured case studies
- `GET /faqs/public` - Public FAQs
- `GET /faqs/category/{category}` - FAQs by category
- `GET /social-proof` - Social proof items
- `GET /dynamic-sections/public` - Public dynamic sections

**Files to create:**

- `v13_vite/src/js/services/ContentService.js` - Service for fetching public content
- Update existing HTML pages (service.html, about.html, etc.) to use these endpoints

### 2. Lead Capture Endpoint

**Status:** Not implemented

**Endpoint:**

- `POST /leads` - Submit lead (alternative to form submissions)

**Action:** Add method to `FormSubmissionService.js` or create `LeadService.js`

### 3. Client Portal - Projects

**Status:** Partially implemented

**Missing:**

- Projects list page (currently only in dashboard)
- Filter by status (`/projects/status/{status}`)
- Full CRUD operations for clients

**Files to create/update:**

- `v13_vite/src/js/projects-list.js` - Standalone projects list page
- `v13_vite/projects.html` - Projects listing page

### 4. Client Portal - Invoices

**Status:** Partially implemented

**Missing:**

- Invoices list page
- Filter by status (`/invoices/unpaid`, `/invoices/status/{status}`)
- Invoice payment integration

**Files to create/update:**

- `v13_vite/src/js/invoices-list.js` - Invoices listing page
- `v13_vite/invoices.html` - Invoices listing page
- Update `invoice-details.js` with payment functionality

### 5. Client Portal - Appointments

**Status:** Not implemented

**Endpoints:**

- `GET /appointments/my` - Client's appointments
- `GET /appointments/upcoming` - Upcoming appointments
- `GET /appointments/available-slots?date={date}` - Available slots (public)
- `POST /appointments` - Book appointment

**Files to create:**

- `v13_vite/src/js/services/AppointmentService.js` - Appointment service
- `v13_vite/src/js/appointments-list.js` - Appointments listing
- `v13_vite/src/js/appointment-booking.js` - Booking form
- `v13_vite/appointments.html` - Appointments page
- `v13_vite/book-appointment.html` - Booking page

### 6. Client Portal - Client Profile

**Status:** Not implemented

**Endpoints:**

- `GET /clients/me` - Get current client record
- `PUT /clients/{id}` - Update own profile (limited fields)

**Files to create:**

- `v13_vite/src/js/services/ClientService.js` - Client service
- `v13_vite/src/js/client-profile.js` - Profile management
- `v13_vite/client-profile.html` - Profile page

### 7. Tickets System

**Status:** Not implemented

**Endpoints:**

- `GET /tickets/my` - User's tickets
- `GET /tickets/open` - Open tickets
- `GET /tickets/status/{status}` - Tickets by status
- `POST /tickets` - Create ticket
- `GET /tickets/{id}` - Single ticket
- `PUT /tickets/{id}` - Update ticket (description only)

**Files to create:**

- `v13_vite/src/js/services/TicketService.js` - Ticket service
- `v13_vite/src/js/tickets-list.js` - Tickets listing
- `v13_vite/src/js/ticket-details.js` - Ticket details
- `v13_vite/src/js/ticket-create.js` - Create ticket form
- `v13_vite/tickets.html` - Tickets listing page
- `v13_vite/ticket-details.html` - Ticket details page
- `v13_vite/create-ticket.html` - Create ticket page

### 8. Conversations & Messages

**Status:** Not implemented

**Endpoints:**

- `GET /conversations/my` - User's conversations
- `GET /conversations/{id}` - Single conversation
- `GET /conversations/entity/project/{id}` - Project conversation
- `GET /messages/conversation/{id}` - Messages in conversation
- `POST /messages` - Send message
- `PUT /messages/{id}/read` - Mark as read
- `GET /messages/unread/count` - Unread count

**Files to create:**

- `v13_vite/src/js/services/ConversationService.js` - Conversation service
- `v13_vite/src/js/services/MessageService.js` - Message service
- `v13_vite/src/js/conversations-list.js` - Conversations listing
- `v13_vite/src/js/conversation-thread.js` - Thread view
- `v13_vite/conversations.html` - Conversations page
- `v13_vite/conversation-thread.html` - Thread page

### 9. File Upload

**Status:** Not implemented

**Endpoint:**

- `POST /media/upload` - Upload files (with guest token support)

**Files to create:**

- `v13_vite/src/js/services/MediaService.js` - File upload service
- Integrate into message composer and project details pages

### 10. Dashboard Enhancements

**Status:** Basic implementation exists

**Missing features:**

- Invoice counts from `/auth/me` response
- Ticket counts from `/auth/me` response
- Upcoming appointments display
- Unread messages count
- Recent activity feed

**Files to update:**

- `v13_vite/src/js/dashboard.js` - Add all dashboard stats and widgets

## Implementation Priority

### Phase 1: Public Content (High Priority)

1. ContentService for public endpoints
2. Update service pages to use API
3. Update testimonials, FAQs, case studies pages

### Phase 2: Client Portal Core (High Priority)

1. Complete projects list page
2. Complete invoices list page
3. Client profile management
4. Dashboard enhancements

### Phase 3: Communication Features (Medium Priority)

1. Tickets system
2. Conversations/Messages system
3. File upload integration

### Phase 4: Appointments (Medium Priority)

1. Appointment booking
2. Appointments list
3. Available slots calendar

### Phase 5: Polish & Enhancements (Low Priority)

1. Lead capture endpoint
2. Advanced filtering and search
3. Real-time updates (WebSockets/polling)

## File Structure to Create

```
v13_vite/src/js/
├── services/
│   ├── ContentService.js          [NEW]
│   ├── LeadService.js             [NEW]
│   ├── AppointmentService.js      [NEW]
│   ├── ClientService.js           [NEW]
│   ├── TicketService.js           [NEW]
│   ├── ConversationService.js     [NEW]
│   ├── MessageService.js          [NEW]
│   └── MediaService.js            [NEW]
├── projects-list.js                [NEW]
├── invoices-list.js                [NEW]
├── appointments-list.js            [NEW]
├── appointment-booking.js          [NEW]
├── client-profile.js               [NEW]
├── tickets-list.js                 [NEW]
├── ticket-details.js               [NEW]
├── ticket-create.js                [NEW]
├── conversations-list.js           [NEW]
└── conversation-thread.js          [NEW]
```

## Notes

- All services should follow the pattern established in `FormSubmissionService.js`
- Use the existing `api.js` instance for authenticated requests
- Guest token should be included in headers where applicable (file uploads, analytics)
- Error handling should match existing patterns
- Mock data fallbacks should be maintained for development