# Sales Funnel Summary

This document describes the **business purpose** and **user-flow logic** of the funnel system.  
It is intentionally **implementation-agnostic** (no WordPress plugin details, no frontend framework details).

## What this system is

A decision-guided funnel that helps visitors take the **right next step** with minimal confusion, then supports the business lifecycle:

**Guest → (optional) Member → (optional) Customer → (optional) Client → Projects/Invoices/Support**

Key principle:

> Visitors should never choose a form.  
> The system should guide them to the best next step.

## Core identity model

### Everyone starts as Guest
- Guest = anonymous visitor.
- Guests can browse, submit forms, and purchase.

### Member (WordPress user) is the identity anchor
- Member = authenticated account (login).
- Member can exist without being a Customer or a Client.

### Lead is not a user state
- A Lead is an **admin-facing data record** created when a Guest or Member submits an inquiry/intake.
- Creating a Lead **does not grant access** to any portal features.

### Customer and Client are separate engagement profiles
- Customer = has purchase history (commerce relationship).
- Client = has service engagement (service relationship).

Constraint:

> A Client cannot exist without a Member (user account).  
> Client is a profile/capability layer linked to a WordPress user.

## Funnel entry: Router Page

The funnel begins with a **Router Page** that asks 4 short questions:

1. **Intent** — What are you trying to do?
2. **Clarity** — How clear is your project?
3. **Timing** — How soon do you want to start?
4. **Commitment** — What are you ready to do today?

It routes the visitor to exactly one recommended path (with 1–2 alternatives):

- Quick Message (low commitment)
- Free Consultation (guidance first)
- Quote Request (prepared buyer)
- Discovery Intake (complex/high-value)

## Purchase behaviors (guest checkout supported)

Guests may purchase in the store and become:

- **Customer only** (product purchase)
- **Customer + Client in one shot** (service purchase)

Portal access always requires identity linkage:

> Guests may purchase, but portal access is always tied to a user account (Member).  
> After successful purchase, the system must link or create the user identity.

## Portals

### Customer Portal (customer-only)
For customers who are not clients:
- Orders / receipts
- Downloads (if applicable)
- Billing support

Requires:
- Member (authenticated) + Customer profile

### Client Portal (service engagement)
For active clients:
- Dashboard
- Projects
- Messages
- Invoices
- Support tickets

Requires:
- Member (authenticated) + Client profile

## Out of scope for this document

Implementation details (plugin architecture, DB tables, routes, libraries) belong in the System Documentation.
