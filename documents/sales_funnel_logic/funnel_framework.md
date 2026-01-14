# Funnel Routing and Framework

This document defines a reusable, decision-guided sales funnel that aligns with the
business lifecycle defined in the ERD:

Guest → Lead → Appointment / Conversation → Client → Project → Invoice / Purchase → Support

Reference: wp-business-essentials-pro-erd

---

## 1. Exact Routing Questions

Design goal:  
One decision at a time, completed in under 30 seconds.

---

### Question 1 — Intent

**What are you trying to accomplish?**

- Build something new
- Improve or redesign an existing site
- Fix something that’s broken
- I’m not sure — I need guidance

**Why this matters:**  
This is the clearest intent signal and reduces anxiety for unsure visitors.

---

### Question 2 — Clarity

**How clear is your project right now?**

- Very clear (I know what I want and can describe it)
- Somewhat clear (I have ideas, need help refining)
- Not clear (I need help figuring out scope)

**Why this matters:**  
This replaces “which form should I pick?” with “how confident am I?”

---

### Question 3 — Timing

**How soon do you want to start?**

- ASAP
- Within 2–4 weeks
- 1–3 months
- Just researching

**Why this matters:**  
Urgency affects routing priority and follow-up strategy.

---

### Question 4 — Commitment Level

**What kind of commitment are you ready for today?**

- Quick message (1–2 minutes)
- Book a call (talk it through)
- Request a quote or proposal (I want numbers)
- Do a discovery intake (serious planning)

**Why this matters:**  
This lets users choose effort level without being overwhelmed by form choices.

---

## 2. Routing Logic

Routing rules are simple, explainable, and user-centered.

---

### Route to Free Consultation when:
- “Not sure — need guidance”  
  OR  
- “Not clear”  
  OR  
- “Book a call”

**Label:**  
Best if you’re unsure or want to talk first.

---

### Route to Project Quote when:
- “Very clear”  
  AND  
- “Request a quote or proposal”

**Label:**  
Best if you already know what you want and need pricing.

---

### Route to Project Discovery when:
- “Build something new” AND complexity is implied  
  OR  
- “Somewhat clear” AND serious planning is selected

**Label:**  
Best for complex projects where getting it right matters.

---

### Route to Quick Message when:
- “Quick message” is selected  
  OR  
- “Just researching”

**Label:**  
Best if you’re browsing and want a fast answer.

---

## 3. Entry Page Design (Funnel Router)

This page replaces “pick a form” with guided decision-making.

---

### Page Goal
Help the visitor reach the correct next step in under 60 seconds.

---

### Hero Section

#### Headline Options
- Let’s choose the best next step for your project.
- Not sure where to start? I’ll guide you.

#### Subtext
Answer 4 quick questions and I’ll route you to the right option — free consultation,
quote request, or a full discovery intake.

#### Trust Microcopy
No spam. No pressure. Just the right next step.

---

### Primary UI Block
- Progress indicator: Step 1 of 4
- Lightweight and friendly tone

---

### Results Screen: “Your Best Next Step”

Display a result page, not an automatic redirect.

#### Recommended Path (Primary)
- Large card
- Clear explanation
- Single CTA

**Example:**

Recommended: Book a Free Consultation  
Best if you’re still shaping the idea or want to talk it through.

Button: Book a Free Consultation

---

#### Alternative Paths (Secondary)

Alternative 1: Request a Quote  
Best if your scope is already clear and you want pricing.  
Link: I already know what I need →

Alternative 2: Quick Message  
Best if you have one fast question.  
Link: Send a quick question →

This prevents bounce caused by “I don’t want a call.”

---

## 4. Reusable Funnel Framework

Every funnel step should map cleanly to a business outcome.

### Core Outcomes
- Form submission
- Lead
- Appointment
- Conversation
- Client
- Project / Invoice / Purchase
- Ticket (later)

The funnel should be expressed as states and transitions.

---

## 5. Funnel States

### State A — Visitor
- Anonymous
- Browsing and learning

**Goal:** Understanding and self-identification  
**Offer:** Router and clarity

---

### State B — Identified Lead
- Email or phone captured

**Goal:** Move to conversation or appointment  
**Offer:** Consultation or quote

---

### State C — Engaged Conversation
- Active thread or scheduled call

**Goal:** Reduce risk and confirm fit  
**Offer:** Plan, proposal, or deposit

---

### State D — Commitment
- Payment or signed agreement

**Goal:** Smooth onboarding  
**Offer:** Kickoff and project start

---

### State E — Client Delivery
- Active project
- Communication
