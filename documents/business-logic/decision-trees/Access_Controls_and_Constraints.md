# Access Controls and Contraints

Below are the rewritten portal decision trees using your corrected access model:

## Everyone starts as Guest

- Lead is admin-only data, not a user state

- Member (authenticated) is a real user type with limited privileges

- Customer (WooCommerce) is a purchase attribute, not a client

- Client is a service engagement attribute (can be created by purchase OR admin)

Portal access is controlled by Member + Client (and optionally Customer for store-related views)


## Identity + Access Badges (Core Concept)

(These are independent “badges” a person can have.)

### Axis A: Identity
  - Guest (anonymous)
  - Member (authenticated WP user)
### Axis B: Commerce
  - Not a Customer
  - Customer (has WooCommerce order history)
### Axis C: Service Engagement
  - Not a Client
  - Client (service relationship exists)
### Important:
  - Lead is NOT a badge/state
  - Lead is an admin-only record created by form submissions







## 1. Guest → Protected Page Gate Tree (Universal Guard)

(Applies to any protected portal route.)

[Visitor requests a URL]
        |
        v
[Default State: Guest]
        |
        v
[Is the requested page PUBLIC?]
  |-- Yes -> Show page
  |-- No  -> Continue
        |
        v
[Is the requested page MEMBER-ONLY?]
  |-- Yes -> Show "Sign In / Create Account" gate
  |-- No  -> Continue
        |
        v
[Is the requested page CLIENT-ONLY?]
  |-- Yes -> Show "Client Access Required" gate
             - Option: Sign In (if member)
             - Option: View services / buy service
             - Option: Contact / consult CTA


Note: “Lead submission” never grants portal access.





## 2. Guest Funnel Submission Tree (Creates Admin-Only Lead)

(Guest can create leads, but does not become anything.)

[Guest submits a form]
  |-- Quick Message
  |-- Consultation Request
  |-- Quote Request
  |-- Discovery Intake
        |
        v
[Create Lead Record (admin-only)]
        |
        v
[Show Confirmation Page]
  - "Thanks, we received it"
  - Explain next steps + expected timeline
  - Offer optional: "Create a free account to track updates"
        |
        v
[Guest remains Guest unless they sign up or sign in]




##  3. Guest → Member (Free Account) Tree

(Member is a real identity. Still not client.)

[Guest chooses: "Create Free Account"]
        |
        v
[Registration]
        |
        v
[Authenticated User: Member]
        |
        v
[Member can access]
  - Member-only pages (if you create them)
  - Profile / settings
  - Saved preferences (optional)
  - Content downloads (optional)
        |
        v
[Member tries to access Client Portal?]
  -> Deny: "Client access required"
  -> Show: service CTA / consult CTA







  ## 4. Member Login Tree (JWT Auth Context, Conceptual)

(Auth grants “Member” access, not “Client.”)

[Guest clicks "Sign In"]
        |
        v
[Login success]
        |
        v
[Member Session Active]
        |
        v
[Access Check]
  - If Member-only page -> Allow
  - If Client-only page -> Check Client badge








  ## 5. Client Access Assignment Tree

(How a user becomes a client — only two ways.)

[How does a person become a Client?]
   |
   +--> Path A: Service purchase in system
   |        |
   |        v
   |   [Payment confirmed]
   |        |
   |        v
   |   [Assign Client badge]
   |        |
   |        v
   |   [Client portal access granted]
   |
   +--> Path B: Admin manually creates Client
            |
            v
       [Admin links client to identity]
         - Existing Member account OR
         - Create account / invite via email
            |
            v
       [Client badge assigned]


Important: Customer ≠ Client, so not all purchases create Client badge.





## 6. Customer (WooCommerce) Tree (Separate From Client)

(Store purchases give “Customer” badge, not client.)

[Guest or Member buys something in WooCommerce]
        |
        v
[Order created]
        |
        v
[Assign Customer badge]
        |
        v
[Customer can access]
  - Order history / receipts (optional)
  - Downloads (if digital goods)
        |
        v
[Does purchase represent a SERVICE engagement?]
  |-- Yes -> Also assign Client badge (service product rule)
  |-- No  -> Customer remains "not client"


This is the “separation” you wanted:

Customer can exist without Client

Client can exist without Customer (offline/admin)





### Client Portal Trees (Login → Dashboard → Project → Messages → Invoices → Support)
## 7. Portal Entry Tree (Corrected)

(Client portal should only be reachable if Client badge exists.)

[Visitor navigates to /portal]
        |
        v
[Is visitor authenticated?]
  |-- No -> Gate: "Sign in required"
  |         - Sign in
  |         - Create account
  |         - View services / consult
  |
  |-- Yes -> Member session active
            |
            v
[Does Member have Client badge?]
  |-- No -> Gate: "Client access required"
  |         - Explanation: "Portal is for active service clients"
  |         - CTA: Buy service / book consult
  |
  |-- Yes -> Enter Client Portal Dashboard

## 8. Client Dashboard Tree

(Client portal home.)

[Client Dashboard]
     |
     v
[Client choices]
  |-- View Projects
  |-- Messages
  |-- Invoices
  |-- Support
  |-- Account Settings

## 9. Projects Tree (Client-Scoped Access)

(Client can only see projects attached to their client record.)

[Client clicks "Projects"]
        |
        v
[Project List]
  - Active
  - Completed
  - On hold
        |
        v
[Client selects a project]
        |
        v
[Project View]
  - Overview / scope
  - Status / milestones
  - Deliverables
  - Project files
  - Project conversation thread
        |
        v
[Client actions]
  |-- Send message about this project
  |-- Upload assets
  |-- View related invoices
  |-- Create a support ticket linked to this project

## 10. Messages Tree (Thread Types)

(Threads exist by context: general, project, ticket, invoice.)

[Client clicks "Messages"]
        |
        v
[Message Center]
  |-- General thread (account-wide)
  |-- Project threads (per project)
  |-- Ticket threads (per ticket)
  |-- Invoice threads (per invoice, optional)
        |
        v
[Client opens a thread]
        |
        v
[Thread View]
  - Read history
  - Attach files
  - Send message
        |
        v
[Does message require staff action?]
  |-- Yes -> Mark "Needs Response" + Notify Admin
  |-- No  -> Store message normally

## 11. Invoices Tree (Billing)

(Invoices may exist for client work whether or not WooCommerce is involved.)

[Client clicks "Invoices"]
        |
        v
[Invoice List]
  - Unpaid
  - Paid
  - Overdue
        |
        v
[Client selects invoice]
        |
        v
[Invoice View]
  - Amount / line items summary
  - Due date
  - Status
  - Related project
        |
        v
[Client actions]
  |-- Pay now (if allowed)
  |-- Ask a question (invoice thread)
  |-- Download receipt

## 12. Support Tree (Tickets)

(Ticket creation is client-only; guests use public contact instead.)

[Client clicks "Support"]
        |
        v
[Support Home]
  - Create new ticket
  - View open tickets
  - View closed tickets
        |
        v
[Create Ticket]
  |
  v
[Ticket Category?]
  |-- Bug / broken
  |-- Billing
  |-- Change request
  |-- General question
        |
        v
[Ticket Created]
  - Ticket thread opens
  - Attachments allowed
        |
        v
[Resolution Flow]
  |-- Needs info -> Staff asks -> Client responds
  |-- Resolved -> Close ticket -> Notify client
  |-- Converts to project work -> Add to project backlog -> Keep linked thread


## Quick “Resource Gate Matrix” (so you can build one layer at a time)
Resource/Page          Guest   Member   Customer   Client
----------------------------------------------------------
Public Pages            Yes     Yes       Yes       Yes
Router + Public Forms   Yes     Yes       Yes       Yes
Member Content          No      Yes       Yes       Yes
Order History           No      Yes*      Yes       Yes
Client Dashboard        No      No        No        Yes
Projects                No      No        No        Yes
Invoices                No      No        No        Yes
Support Tickets         No      No        No        Yes

*Order history requires authentication; customer badge implies purchase.