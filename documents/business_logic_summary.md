BUSINESS LOGIC RECAP

(What we have fully defined)

1. Core Philosophy (Locked In)

WordPress is the single source of truth

WP User = identity anchor

Everything else (leads, customers, clients, projects, tickets) is linked data, not identity

You explicitly avoided the common mistake of conflating:

“someone who contacted me”

“someone who bought something”

“someone I’m actively working with”

That separation is a strength, not complexity.

2. Identity & Role Model (Clarified)
Identity (always true)

Guest

Anonymous

Can browse

Can submit forms

Can purchase

Has no portal access

Member (WP User)

Authenticated via JWT

Can log in

May or may not be a customer

May or may not be a client

Engagement Profiles (attached to WP User)

Customer Profile

Exists if there is WooCommerce order history

Does not imply service engagement

Enables customer-only portal (orders, downloads, billing support)

Client Profile

Exists only if there is a service relationship

Cannot exist without a WP user

Grants client portal access (projects, invoices, support)

Can be created by:

service purchase

admin action (offline transaction)

Important constraint (agreed)

Lead is NOT a user state.
Lead is an admin-only data record created by guest or member actions.

3. Funnel System (Defined)

You now have a decision-guided funnel, not “pages with forms”.

Funnel Entry

Single Router Page

4 short routing questions:

Intent

Clarity

Timing

Commitment level

Funnel Outcomes

Quick Message (low commitment)

Free Consultation (guidance)

Quote Request (prepared buyer)

Discovery Intake (complex / high-value)

Rule locked in:

Visitors never choose forms — the system routes them.

4. Lead Handling (Admin-Focused)

Guests and members can create leads

Leads:

are stored as data objects

are visible to admins only

do NOT grant access

do NOT represent a “user state”

Follow-up or purchase is what advances the relationship.

5. Portal Access Model (Guest-First, Gated Upward)
Access Ladder
Guest
  → Member (login)
    → Customer profile (purchase)
      → Client profile (service engagement)

Portal Types (Separated Cleanly)

Customer Portal

Orders

Downloads

Billing support

Requires: Member + Customer profile

Client Portal

Dashboard

Projects

Messages

Invoices

Support tickets

Requires: Member + Client profile

Critical agreement

A client is still a WP user

Client = “service engagement profile”, not a new identity

Client profile can be archived or deleted without deleting the user

6. Guest Checkout Scenarios (Resolved)

You accounted for high-motivation users.

Guest buys a product

Checkout allowed

After payment:

system links or creates WP user

assigns Customer profile only

Portal access requires login

Guest buys a service

Checkout allowed

After payment:

system links or creates WP user

assigns Customer profile

assigns Client profile

Client portal available immediately after login

Core rule

Guests can initiate transactions,
but portal access always flows through a WP user.

7. Decision Trees Created (Completed)

You now have text-based diagrams for:

Funnel routing logic

Guest → Member → Client progression

Client portal flows:

login gating

dashboard

projects

messages

invoices

support

Customer-only portal flows

Guest checkout → user creation → profile assignment

These diagrams now serve as:

business logic specs

ERD sanity checks

future implementation references

WHAT IS LEFT TO DESIGN

(Business logic only — no code yet)

This is the remaining checklist to fully lock down the system.

1. Client Lifecycle Rules

☐ Define client profile statuses

active

inactive

archived

suspended (optional)

☐ Decide:

when a client profile is archived vs deleted

what happens to projects, tickets, invoices on archive

how reactivation works (new profile vs revive old)

2. Lead → User Linking Rules

☐ Define conceptual rule for:

matching leads to users (email match, admin action, manual merge)

☐ Decide:

whether leads auto-link when a user registers

whether historical leads remain standalone

3. Service Classification Logic

☐ Define what makes a WooCommerce product a “service”

category

tag

metadata conceptually

☐ Define:

which services auto-create client profiles

which require admin approval before client access

4. Onboarding & “What Happens Next” Flows

☐ Post-consultation next steps
☐ Post-quote acceptance next steps
☐ Post-service-purchase onboarding
☐ First-login experience for:

new customer

new client

admin-created client

5. Admin-Side Business Workflows

☐ Lead review & qualification flow
☐ Client creation (manual)
☐ Client offboarding
☐ Project creation rules
☐ Ticket escalation → project change request logic

6. Permissions Matrix (Final Pass)

☐ Explicit resource × role matrix for:

Guest

Member

Customer

Client

Admin

(This becomes your guardrail when implementing APIs.)

7. Naming & Vocabulary Consistency

☐ Lock terminology:

“Client profile” vs “Client account”

“Customer portal” vs “Orders”

“Member” vs “User”

This prevents confusion later when the system grows.