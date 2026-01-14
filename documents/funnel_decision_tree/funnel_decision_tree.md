# Funnel Decision Tree

Decision-guided routing for sales funnel entry

---

## High-Level Overview

Visitor  
↓  
Router Page (4 Questions)  
↓  
Best Next Step (1 of 4 paths)

The visitor never chooses a form directly.  
They answer questions → the system routes them.

---

## Full Decision Tree (Text Diagram)

[ Visitor Lands on Site ]
|
v
[ Router Page: "Let's find the best next step" ]
|
v
──────────────────────────────────────────────
Q1: What are you trying to do?
──────────────────────────────────────────────
├─ Build something new
├─ Improve / redesign an existing site
├─ Fix something broken
└─ Not sure / need guidance
|
v
──────────────────────────────────────────────
Q2: How clear is your project right now?
──────────────────────────────────────────────
├─ Very clear
├─ Somewhat clear
└─ Not clear
|
v
──────────────────────────────────────────────
Q3: How soon do you want to start?
──────────────────────────────────────────────
├─ ASAP
├─ 2–4 weeks
├─ 1–3 months
└─ Just researching
|
v
──────────────────────────────────────────────
Q4: What are you ready to do today?
──────────────────────────────────────────────
├─ Send a quick message
├─ Book a call
├─ Request a quote / proposal
└─ Do a full discovery intake
|
v
──────────────────────────────────────────────
ROUTING LOGIC
──────────────────────────────────────────────



---

## Routing Outcomes (Decision Rules)

### Path 1 — Quick Message (Low Commitment)

**IF**
- Q3 = “Just researching”  
  OR  
- Q4 = “Send a quick message”

**THEN**
- Route to: Quick Message Form

**User mindset:**  
“I’m browsing or have one small question.”

**Business goal:**  
Capture curiosity without pressure.

---

### Path 2 — Free Consultation (Guidance First)

**IF**
- Q1 = “Not sure / need guidance”  
  OR  
- Q2 = “Not clear”  
  OR  
- Q4 = “Book a call”

**THEN**
- Route to: Free Consultation

**User mindset:**  
“I want help figuring this out.”

**Business goal:**  
Clarify the problem and build trust.

---

### Path 3 — Project Quote (Prepared Buyer)

**IF**
- Q2 = “Very clear”  
  AND  
- Q4 = “Request a quote / proposal”

**THEN**
- Route to: Project Quote Form

**User mindset:**  
“I know what I want. I want pricing.”

**Business goal:**  
Serve high-intent buyers efficiently.

---

### Path 4 — Project Discovery (Complex / High-Value)

**IF**
- Q1 = “Build something new”  
  AND  
- Q2 = “Somewhat clear”  
  AND  
- Q4 = “Do a full discovery intake”

**THEN**
- Route to: Project Discovery Intake

**User mindset:**  
“This is complex. I want to get it right.”

**Business goal:**  
De-risk large or custom projects.

---

## Result Screen Logic (Important)

After routing, **do not auto-redirect**.

Instead, display a result screen:

- Recommended Next Step (Primary CTA)
- Why this is recommended
- One to two alternative options (Secondary CTAs)

This prevents:
- “I don’t want a call” bounces
- False exits
- Forced decisions

---

## Funnel State Transition Map

Visitor  
↓  
Identified Lead  
↓  
Conversation / Appointment  
↓  
Commitment (Deposit / Agreement)  
↓  
Client / Project  
↓  
Support / Retainer

The router page exists only to move:

**Visitor → Lead → Conversation**  
as cleanly as possible.

---

## Rule to Keep Forever

If a visitor is unsure which option to pick,  
the funnel has failed to guide them.

This decision tree is the guidance layer that was missing.
