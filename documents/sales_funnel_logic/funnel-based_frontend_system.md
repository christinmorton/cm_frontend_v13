# Frontend Routing Architecture



## Core Route Structure
/                          → Public homepage
/about                     → Public pages
/services                  → Public pages
/contact                   → Public contact form

/flows/                    → note: Flows was origingally named funnels 
  /quick-message           → Guest funnel (creates Lead)
  /consultation            → Guest funnel (creates Lead)
  /quote-request           → Guest funnel (creates Lead)
  /discovery               → Guest funnel (creates Lead)
  /thank-you               → Confirmation page (after form submission)

/auth/
  /sign-in                 → Login page
  /sign-up                 → Registration page
  /reset-password          → Password reset

/member/                   → [Requires: Member badge]
  /dashboard               → Member-only content
  /profile                 → Account settings
  /downloads               → Optional member resources

/shop/                     → WooCommerce integration
  /products                → Public product listings
  /cart                    → Shopping cart
  /checkout                → Checkout flow
  
/account/                  → [Requires: Customer badge]
  /orders                  → Order history
  /downloads               → Digital products

/portal/                   → [Requires: Client badge]
  /dashboard               → Client portal home
  /projects                → Projects list
  /projects/:id            → Individual project view
  /messages                → Message center
  /messages/:threadId      → Specific thread
  /invoices                → Invoice list
  /invoices/:id            → Invoice detail
  /support                 → Support ticket center
  /support/new             → Create ticket
  /support/:ticketId       → Ticket thread
  /settings                → Client account settings



## Route Guard System
Guard Hierarchy (Middleware Layers)

// Pseudo-code for route guards

function RouteGuard(route, user) {
  // Layer 1: Public routes (always allow)
  if (route.isPublic) return ALLOW;
  
  // Layer 2: Member-only routes
  if (route.requiresMember && !user.hasBadge('Member')) {
    return REDIRECT('/auth/sign-in');
  }
  
  // Layer 3: Customer-only routes
  if (route.requiresCustomer && !user.hasBadge('Customer')) {
    return SHOW_GATE('customer-required');
  }
  
  // Layer 4: Client-only routes
  if (route.requiresClient && !user.hasBadge('Client')) {
    return SHOW_GATE('client-required');
  }
  
  return ALLOW;
}
```

---

## Funnel Flow Mapping

### Funnel 1: Quick Message (Guest → Lead)
```
State: Guest
├─ Route: /flows/quick-message
├─ Form Fields: Name, Email, Message
├─ On Submit:
│  ├─ POST /api/leads (creates Lead record)
│  ├─ Event: 'lead:created' { type: 'quick-message', leadId }
│  └─ Redirect: /flows/thank-you?type=quick-message
│
└─ Route: /flows/thank-you
   ├─ Show: Confirmation message
   ├─ Show: "Expected response time: 24-48 hours"
   ├─ Optional CTA: "Create free account to track updates"
   └─ State: Still Guest (no badge changes)
```

### Funnel 2: Consultation Request (Guest → Lead)
```
State: Guest
├─ Route: /flows/consultation
├─ Form Fields: Name, Email, Phone, Preferred Date/Time, Service Interest
├─ On Submit:
│  ├─ POST /api/leads (creates Lead record)
│  ├─ Event: 'lead:created' { type: 'consultation', leadId }
│  └─ Redirect: /flows/thank-you?type=consultation
│
└─ Route: /flows/thank-you
   ├─ Show: "We'll contact you within 24 hours to schedule"
   ├─ Optional CTA: "Create account for faster booking"
   └─ State: Still Guest
```

### Funnel 3: Quote Request (Guest → Lead)
```
State: Guest
├─ Route: /flows/quote-request
├─ Form Fields: Name, Email, Company, Project Type, Budget Range, Timeline, Details
├─ On Submit:
│  ├─ POST /api/leads (creates Lead record)
│  ├─ Event: 'lead:created' { type: 'quote', leadId }
│  └─ Redirect: /flows/thank-you?type=quote
│
└─ Route: /flows/thank-you
   ├─ Show: "Quote will be prepared within 2-3 business days"
   ├─ Optional CTA: "Create account to view quote status"
   └─ State: Still Guest
```

### Funnel 4: Discovery Intake (Guest → Lead)
```
State: Guest
├─ Route: /flows/discovery
├─ Form Fields: Multi-step intake form (business goals, technical needs, etc.)
├─ On Submit:
│  ├─ POST /api/leads (creates Lead record with full intake data)
│  ├─ Event: 'lead:created' { type: 'discovery', leadId }
│  └─ Redirect: /flows/thank-you?type=discovery
│
└─ Route: /flows/thank-you
   ├─ Show: "Deep dive intake received. We'll prepare a custom proposal"
   ├─ Optional CTA: "Create account"
   └─ State: Still Guest
```

---

## Registration/Authentication Flow

### Account Creation Flow (Guest → Member)
```
State: Guest
├─ Route: /auth/sign-up
├─ Form Fields: Name, Email, Password
├─ On Submit:
│  ├─ POST /api/auth/register
│  ├─ Creates WP User account
│  ├─ Event: 'user:registered' { userId }
│  ├─ Auto-login (set JWT token)
│  └─ Redirect: /member/dashboard
│
└─ New State: Member (authenticated)
   └─ Can access: /member/* routes
```

### Login Flow (Guest → Member Session)
```
State: Guest
├─ Route: /auth/sign-in
├─ Form Fields: Email, Password
├─ On Submit:
│  ├─ POST /api/auth/login
│  ├─ Receive JWT token
│  ├─ Event: 'user:login' { userId }
│  └─ Redirect: 
│     ├─ If has Client badge → /portal/dashboard
│     ├─ If has Member badge only → /member/dashboard
│     └─ If intended route exists → original destination
│
└─ State: Member (authenticated session)
```

---

## Client Portal Access Flow

### Attempting Portal Access (Member → Client Check)
```
State: Member (authenticated)
├─ Route: /portal/dashboard (attempted)
├─ Guard Check: Does user have Client badge?
│
├─ NO Client Badge:
│  └─ Show Gate: "client-access-required"
│     ├─ Message: "The portal is for active service clients"
│     ├─ CTA: "View Services" → /services
│     ├─ CTA: "Book Consultation" → /flows/consultation
│     └─ CTA: "Contact Us" → /contact
│
└─ YES Client Badge:
   └─ ALLOW: Show /portal/dashboard



## Event System for Form Submissions
Event Definitions

// Events triggered by funnel submissions
// this is only an exmaple the ERD model will give better details and guidelines for this
// I will likely use the Analytics event custom post type for this information.

events = {
  'lead:created': {
    payload: { leadId, type, email, name, timestamp },
    triggers: [
      'sendAdminNotification',
      'sendLeadConfirmationEmail',
      'trackAnalytics'
    ]
  },
  
  'user:registered': {
    payload: { userId, email, timestamp },
    triggers: [
      'sendWelcomeEmail',
      'assignMemberBadge',
      'trackConversion'
    ]
  },
  
  'purchase:completed': {
    payload: { orderId, userId, productIds, isServiceProduct },
    triggers: [
      'assignCustomerBadge',
      'conditionallyAssignClientBadge', // if service product
      'sendReceiptEmail'
    ]
  },
  
  'client:assigned': {
    payload: { userId, clientId, assignedBy, method },
    triggers: [
      'grantPortalAccess',
      'sendWelcomeToPortalEmail',
      'createInitialProjectRecord'
    ]
  }
}
```

---

## Routing State Machine

### User Journey State Diagram
```
[Guest]
  │
  ├─→ Submit Funnel Form → [Lead Created] (admin-only record)
  │   └─→ Still [Guest] → Can submit more forms
  │
  ├─→ Sign Up → [Member] (authenticated)
  │   ├─→ Access /member/* routes
  │   ├─→ Attempt /portal/* → BLOCKED (no Client badge)
  │   └─→ Purchase Service Product → [Member + Customer + Client]
  │       └─→ Access /portal/* → ALLOWED
  │
  └─→ Purchase Store Product → [Customer] (not authenticated yet)
      └─→ Can create account → [Member + Customer]
          └─→ Still no /portal access (not Client)

[Admin Actions]
  └─→ Manually assign Client badge to Member
      └─→ [Member + Client] → Portal access granted


## Dynamic Route Configuration
const routes = [
  // Public routes
  { path: '/', component: HomePage, public: true },
  { path: '/services', component: ServicesPage, public: true },
  { path: '/contact', component: ContactPage, public: true },
  
  // Funnel routes (all public, create Leads)
  { path: '/flows/quick-message', component: QuickMessageFunnel, public: true, createsLead: true },
  { path: '/flows/consultation', component: ConsultationFunnel, public: true, createsLead: true },
  { path: '/flows/quote-request', component: QuoteFunnel, public: true, createsLead: true },
  { path: '/flows/discovery', component: DiscoveryFunnel, public: true, createsLead: true },
  { path: '/flows/thank-you', component: ThankYouPage, public: true },
  
  // Auth routes
  { path: '/auth/sign-in', component: SignInPage, public: true, guestOnly: true },
  { path: '/auth/sign-up', component: SignUpPage, public: true, guestOnly: true },
  
  // Member routes
  { path: '/member/dashboard', component: MemberDashboard, requiresBadge: 'Member' },
  { path: '/member/profile', component: ProfilePage, requiresBadge: 'Member' },
  
  // Customer routes
  { path: '/account/orders', component: OrderHistory, requiresBadge: 'Customer' },
  
  // Client Portal routes
  { path: '/portal/dashboard', component: ClientDashboard, requiresBadge: 'Client' },
  { path: '/portal/projects', component: ProjectsList, requiresBadge: 'Client' },
  { path: '/portal/projects/:id', component: ProjectDetail, requiresBadge: 'Client' },
  { path: '/portal/messages', component: MessageCenter, requiresBadge: 'Client' },
  { path: '/portal/invoices', component: InvoicesList, requiresBadge: 'Client' },
  { path: '/portal/support', component: SupportCenter, requiresBadge: 'Client' },
];
```

---

## Recommended URL Patterns

### Clean Funnel URLs
```
✅ Good:
/start
/get-quote
/book-consultation
/discovery

❌ Avoid:
/flows/step1
/forms/consultation_request_v2
```

### Query Parameters for Funnel State
```
/flows/quote-request?step=2
/flows/thank-you?type=consultation&ref=homepage


