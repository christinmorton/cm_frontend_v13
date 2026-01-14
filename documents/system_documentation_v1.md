# System Documentation (Business Logic Spec)

This document is the **authoritative guide** for building the system.  
It focuses on **MVP behaviors**, **data contracts**, **responsibility boundaries**, and **graceful handling** when things go wrong.

It is intentionally **plugin-agnostic** and assumes the ERD is the implementation guide for entities/relationships.

---

## A. MVP Must-Have Behaviors (Non-Negotiable)

### Visitor states and what they can do

#### 1. Guest (default)
Guests can:
- Browse public content
- Use the Router Page
- Submit inquiry/intake forms (creates Lead records)
- Purchase products or services

Guests cannot:
- Access customer portal
- Access client portal

#### 2. Member (authenticated user)
Members can:
- Access member-only pages (if present)
- Access customer portal if Customer profile exists
- Access client portal if Client profile exists

#### 3. Lead (admin-only record)
Leads:
- Are data records created by form submissions
- Are visible to admins only
- Do not grant portal access
- Do not represent a user state

#### 4. Customer (commerce relationship)
Customers:
- Have order history (linked to a user account)
- May access customer portal
- Are not necessarily clients

#### 5. Client (service relationship)
Clients:
- Are members with a Client profile linked to their user account
- May access client portal features (projects/invoices/support)
- Can be created by:
  - Service purchase
  - Admin action (offline transaction)

Constraint:
- A Client profile **cannot exist without** a user account.

---

## B. Data Contract (Conceptual)

This is a contract of **what the system means**, not a database schema.

### Identity anchor
- **User (Member)**: the root identity record.

### Admin-owned intake objects
- **Lead**: created from form submissions; admin-facing.

### Engagement profiles (linked to user)
- **Customer Profile**: indicates commerce relationship.
- **Client Profile**: indicates service relationship; requires user.

### Service delivery objects
- **Project**: scoped to a Client.
- **Invoice**: scoped to a Client and optionally linked to a Project.
- **Conversation/Thread**: supports messages by context (general/project/invoice/ticket).
- **Ticket**: client support requests, optionally linked to Project/Invoice.

---

## C. Responsibility Boundaries (Conceptual Endpoints)

This section defines what the system must *be able to do*, without prescribing route names.

### Public responsibilities (Guest-safe)
- Render public pages and Router Page
- Accept form submissions (create Lead records)
- Accept guest purchases
- Show confirmation pages

### Auth responsibilities (Member)
- Sign in / sign out
- View account profile/settings
- Gate customer portal and client portal entry
- Display correct portal based on profiles

### Customer portal responsibilities (Customer-only)
- View order history / receipts
- View downloads (if applicable)
- Open billing/order support requests

### Client portal responsibilities (Client-only)
- View projects
- View invoices
- Use message center (threads)
- Create and manage support tickets

---

## D. Funnel + Portal Workflows (Authoritative)

### 1. Funnel Router Workflow
- Ask 4 routing questions (intent, clarity, timing, commitment).
- Produce:
  - 1 recommended path
  - 1–2 alternatives (to prevent bounce)
- Route to one of:
  - Quick Message
  - Free Consultation
  - Quote Request
  - Discovery Intake

### 2. Form Submission Workflow (creates Lead)
- Guest or Member submits form
- System creates Lead record (admin-only)
- System shows confirmation page with:
  - next steps
  - expected response time
  - optional CTA: “Create account to streamline future access”

### 3. Purchase Workflow (guest purchase supported)
After payment success:
- Link to an existing user account (if match exists), OR
- Create a new user account and prompt user to claim/set password

Then:
- Always create/assign Customer profile if there is an order
- Additionally create/assign Client profile if purchase represents a service engagement

### 4. Customer Portal Workflow
- Requires Member + Customer profile
- Shows: orders, receipts, downloads
- Provides billing support

### 5. Client Portal Workflow
- Requires Member + Client profile
- Shows: dashboard, projects, messages, invoices, support tickets

---

## E. Error Handling + Graceful Recovery (MVP Focus)

This section is about **what the system should do when things go wrong**, so the user flow remains trustworthy.

### Principle
When failures occur, the system should:
- Avoid dead ends
- Preserve user trust
- Provide a clear next action
- Prevent duplicate/conflicting records where possible

### 1. Authentication and access errors

#### Guest attempts to access protected portals
- Show gate screen:
  - “Sign in” primary action
  - “Create account” secondary
  - “View services / book consult” tertiary

#### Member attempts to access Client Portal but is not a Client
- Show “Client access required” page:
  - Explain that the client portal is for active service engagements
  - Provide next steps:
    - book consult
    - purchase service
    - contact support

#### Member attempts to access Customer Portal but has no purchases
- Show “No purchases found” page:
  - link to store
  - billing support option

### 2. Form submission errors (inquiry/intake)

#### If form submission fails
- Show a friendly error state:
  - “Your message didn’t go through”
  - Provide retry
  - Provide backup option (email link / alternative contact)

#### If duplicate submissions occur
- Detect likely duplicates (same email + same form type within a short window)
- Respond with:
  - “We already received your request”
  - Provide reference (optional)
  - Provide what happens next

#### If the system cannot associate the submission to a user
- Still accept and store the Lead record (admin-only)
- Do not block the user’s submission
- Show confirmation and next steps

### 3. Purchase and account-linking errors

#### Payment succeeded but account creation/linking fails
- Do not lose the purchase acknowledgment
- Show confirmation page:
  - “Your payment was successful”
  - “We’re setting up your portal access”
  - Provide a “Claim access” option and support contact path
- Admin should still be able to resolve linkage later

#### User tries to claim account but claim token/link is invalid/expired
- Provide:
  - “Resend claim link”
  - “Sign in” if they already set password
  - “Contact support” fallback

### 4. Portal data errors (projects, invoices, tickets)

#### Missing project/invoice relationships
- If a client is logged in but no projects exist:
  - show “No active projects”
  - show next steps (message center / onboarding / contact)

#### Invoice exists but payment status is unclear
- Show “Payment status pending”
- Provide:
  - refresh
  - support link for billing inquiry

#### Ticket creation fails
- Provide:
  - retry
  - alternate contact route
- Save any draft text if possible

### 5. Admin-side correction pathways (important)
Some problems will inevitably require admin intervention. The system should support:
- Linking purchases to an existing user
- Assigning Customer/Client profiles after the fact
- Converting offline clients into client profiles
- Re-sending claim/access links

---

## F. “Later” (Explicitly Out of Scope for MVP)

This section preserves ideas without contaminating execution.

### Future funnel enhancements
- A/B testing experiments
- Personalization based on behavior
- Conversion analytics dashboards
- Lead scoring / lead qualification automation

### Future operational enhancements
- Sophisticated spam prevention (captcha/honeypots)
- Advanced rate limiting rules
- Automated follow-up sequences
- SLA timers and escalation rules for tickets
- Role-based staff workflows (teams, assignment queues)

### Future commerce enhancements
- Subscriptions / retainers
- Membership tiers
- Upsell flows and bundles
