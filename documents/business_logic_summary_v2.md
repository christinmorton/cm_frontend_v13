# Business Logic Recap

## What We Have Fully Defined

---

## 1. Core Philosophy (Locked In)

- WordPress is the single source of truth
- WP User is the identity anchor
- Everything else (leads, customers, clients, projects, tickets) is linked data, not identity

You explicitly avoided the common mistake of conflating:
- “Someone who contacted me”
- “Someone who bought something”
- “Someone I’m actively working with”

That separation is a strength, not complexity.

---

## 2. Identity and Role Model (Clarified)

### Identity (Always True)

#### Guest
- Anonymous
- Can browse
- Can submit forms
- Can purchase
- Has no portal access

#### Member (WP User)
- Authenticated via JWT
- Can log in
- May or may not be a customer
- May or may not be a client

---

### Engagement Profiles (Attached to WP User)

#### Customer Profile
- Exists if there is WooCommerce order history
- Does not imply service engagement
- Enables customer-only portal:
  - Orders
  - Downloads
  - Billing support

#### Client Profile
- Exists only if there is a service relationship
- Cannot exist without a WP user
- Grants client portal access:
  - Projects
  - Invoices
  - Support

Client profiles can be created by:
- Service purchase
- Admin action (offline transaction)

#### Important Constraint (Agreed)
- Lead is NOT a user state
- Lead is an admin-only data record
- Leads are created by guest or member actions

---

## 3. Funnel System (Defined)

You now have a decision-guided funnel, not “pages with forms”.

### Funnel Entry
- Single router page
- Four short routing questions:
  - Intent
  - Clarity
  - Timing
  - Commitment level

### Funnel Outcomes
- Quick Message (low commitment)
- Free Consultation (guidance)
- Quote Request (prepared buyer)
- Discovery Intake (complex or high-value)

#### Locked Rule
Visitors never choose forms.  
The system routes them.

---

## 4. Lead Handling (Admin-Focused)

- Guests and members can create leads
- Leads:
  - Are stored as data objects
  - Are visible to admins only
  - Do not grant access
  - Do not represent a user state

Follow-up or purchase is what advances the relationship.

---

## 5. Portal Access Model (Guest-First, Gated Upward)

### Access Ladder
- Guest  
  → Member (login)  
    → Customer profile (purchase)  
      → Client profile (service engagement)

---

### Portal Types (Separated Cleanly)

#### Customer Portal
- Orders
- Downloads
- Billing support
- Requires:
  - Member
  - Customer profile

#### Client Portal
- Dashboard
- Projects
- Messages
- Invoices
- Support tickets
- Requires:
  - Member
  - Client profile

#### Critical Agreement
- A client is still a WP user
- Client is a service engagement profile, not a new identity
- Client profiles can be archived or deleted without deleting the user

---

## 6. Guest Checkout Scenarios (Resolved)

You accounted for high-motivation users.

### Guest Buys a Product
- Checkout allowed
- After payment:
  - System links or creates WP user
  - Assigns Customer profile only
- Portal access requires login

### Guest Buys a Service
- Checkout allowed
- After payment:
  - System links or creates WP user
  - Assigns Customer profile
  - Assigns Client profile
- Client portal available immediately after login

### Core Rule
Guests can initiate transactions,  
but portal access always flows through a WP user.

---

## 7. Decision Trees Created (Completed)

You now have text-based diagrams for:
- Funnel routing logic
- Guest → Member → Client progression
- Client portal flows:
  - Login gating
  - Dashboard
  - Projects
  - Messages
  - Invoices
  - Support
- Customer-only portal flows
- Guest checkout → user creation → profile assignment

These diagrams now serve as:
- Business logic specifications
- ERD sanity checks
- Future implementation references

---

# What Is Left to Design

Business logic only — no code yet.

This is the remaining checklist to fully lock down the system.

---

## 1. Client Lifecycle Rules

- Define client profile statuses:
  - Active
  - Inactive
  - Archived
  - Suspended (optional)

- Decide:
  - When a client profile is archived vs deleted
  - What happens to projects, tickets, and invoices on archive
  - How reactivation works (new profile vs revive old)

---

## 2. Lead to User Linking Rules

- Define conceptual rules for:
  - Matching leads to users (email match, admin action, manual merge)

- Decide:
  - Whether leads auto-link when a user registers
  - Whether historical leads remain standalone

---

## 3. Service Classification Logic

- Define what makes a WooCommerce product a service:
  - Category
  - Tag
  - Metadata (conceptual)

- Define:
  - Which services auto-create client profiles
  - Which require admin approval before client access

---

## 4. Onboarding and “What Happens Next” Flows

- Post-consultation next steps
- Post-quote acceptance next steps
- Post-service-purchase onboarding
- First-login experience for:
  - New customer
  - New client
  - Admin-created client

---

## 5. Admin-Side Business Workflows

- Lead review and qualification flow
- Manual client creation
- Client offboarding
- Project creation rules
- Ticket escalation to project change request logic

---

## 6. Permissions Matrix (Final Pass)

- Explicit resource by role matrix for:
  - Guest
  - Member
  - Customer
  - Client
  - Admin

This becomes your guardrail during API and system implementation.

---

## 7. Naming and Vocabulary Consistency

- Lock terminology:
  - Client profile vs client account
  - Customer portal vs orders
  - Member vs user

This prevents confusion as the system grows.
