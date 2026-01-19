# Router Funnel System

## Overview

The router is a decision-guided funnel that helps visitors take the right next step with minimal confusion. Instead of presenting multiple form options and asking users to choose, the router asks 4 simple questions and recommends the best path based on their answers.

**Core Principle:**
> Visitors should never choose a form. The system should guide them to the best next step.

## Location

**File:** `v13_vite/router.html`

## How It Works

### The 4 Routing Questions

The router collects answers through 4 sequential steps:

| Step | Question | Purpose | Variable |
|------|----------|---------|----------|
| 1 | What are you looking to achieve? | Understand intent | `intent` |
| 2 | How clear is your scope right now? | Assess clarity | `clarity` |
| 3 | How soon do you want to start? | Gauge timing/urgency | `timing` |
| 4 | What are you ready to do today? | Determine commitment | `readiness` |

### Step 1: Intent

"What are you looking to achieve?"

| Option | Value | Signals |
|--------|-------|---------|
| Build something new | `build_new` | New project, potentially complex |
| Improve an existing site | `improve` | Enhancement work |
| Fix something broken | `fix` | Bug fix or urgent issue |
| I'm not sure — need guidance | `unsure` | Needs consultation |

### Step 2: Clarity

"How clear is your scope right now?"

| Option | Value | Signals |
|--------|-------|---------|
| Very clear — I know what I want | `very_clear` | Ready for quote |
| Somewhat clear — I need help refining | `somewhat_clear` | May need discovery |
| Not clear — Help me figure it out | `not_clear` | Needs consultation |

### Step 3: Timing

"How soon do you want to start?"

| Option | Value | Signals |
|--------|-------|---------|
| ASAP | `asap` | High urgency |
| Within 2–4 weeks | `weeks` | Medium urgency |
| 1–3 months | `months` | Planning ahead |
| Just researching | `researching` | Low commitment |

### Step 4: Commitment (Readiness)

"What are you ready to do today?"

| Option | Value | Routes To |
|--------|-------|-----------|
| Send a quick message | `quick_message` | Quick Message form |
| Book a call | `book_call` | Consultation form |
| Request a quote or proposal | `request_quote` | Quote Request form |
| Do a full discovery intake | `discovery` | Discovery form |
| Reserve my spot with a deposit | `reserve_spot` | Deposit page |

## Routing Logic

The **Step 4 choice (`readiness`) is the primary routing decision**. Previous answers adjust the messaging but do not override the destination.

### Route Mapping

```
readiness === 'reserve_spot'  → flows/deposit.html
readiness === 'quick_message' → flows/quick-message.html
readiness === 'book_call'     → flows/consultation.html
readiness === 'request_quote' → flows/quote-request.html
readiness === 'discovery'     → flows/discovery.html
```

### Context-Aware Messaging

While the destination is determined by Step 4, the description text adapts based on earlier answers:

**Quote Request:**
- With `clarity === 'very_clear'`: "You know exactly what you need. Let's get you a price estimate quickly."
- Otherwise: "Tell me about your project and I'll send you a custom quote."

**Discovery Intake:**
- With `intent === 'build_new'`: "For complex new builds, a deep-dive intake helps us map out the perfect solution."
- Otherwise: "A detailed intake helps me understand your project fully before we begin."

**Consultation:**
- With `clarity === 'not_clear'` or `intent === 'unsure'`: "Since you're looking for guidance, a quick chat is the best way to clarify your next steps."
- Otherwise: "Let's talk through your project and figure out the best approach together."

**Quick Message:**
- With `timing === 'researching'`: "Since you're just researching, dropping a line is the best way to start."
- Otherwise: "No pressure. Just send a quick question or hello."

## Result Screen

After completing all 4 steps, users see a result card with:

1. **Recommendation heading** - "Recommendation"
2. **Title** - The recommended action (e.g., "Start Project Discovery")
3. **Description** - Context-aware explanation of why this is recommended
4. **Primary CTA button** - Links to the recommended form
5. **Alternative options** - Secondary links to other paths
6. **Start Over button** - Reloads the page to begin again

### Alternative Options by Path

| Primary Route | Alternatives Shown |
|---------------|-------------------|
| Reserve Spot | Book a call first, Request a quote |
| Quick Message | Book a call instead |
| Consultation | Just send a message, Request a quote |
| Quote Request | Discuss it first |
| Discovery | Just book a call |

## State Management

### Answer Storage

Answers are stored in a JavaScript object:

```javascript
let answers = {
    intent: '',    // Step 1
    clarity: '',   // Step 2
    timing: '',    // Step 3
    readiness: ''  // Step 4
};
```

### Navigation

- **Forward:** `nextStep(currentStep, value)` - Saves answer and advances
- **Back:** `prevStep(currentStep)` - Returns to previous step
- **Finish:** `finishFunnel(readinessValue)` - Saves Step 4 answer and calculates result

### Progress Bar

A visual progress bar updates as users move through steps:
- Step 1: 20%
- Step 2: 40%
- Step 3: 60%
- Step 4: 80%
- Result: 100% (progress bar hidden)

## Analytics Tracking

When the funnel completes, an analytics event is tracked:

```javascript
window.__analytics.track('router_funnel_complete', {
    form_id: 'router_flow',
    form_data: answers,
    router_intent: answers.intent,
    router_clarity: answers.clarity,
    router_timing: answers.timing,
    router_readiness: answers.readiness,
    message: 'Router Funnel Results: ...',
    source: 'router_funnel'
});
```

This allows tracking of:
- Which paths users are routed to
- Common answer combinations
- Funnel completion rates

## Form Destinations

| Route | Form File | Form Type |
|-------|-----------|-----------|
| Quick Message | `flows/quick-message.html` | `quick_message` |
| Consultation | `flows/consultation.html` | `book_a_call` |
| Quote Request | `flows/quote-request.html` | `quote_request` |
| Discovery | `flows/discovery.html` | `discovery_intake` |
| Deposit | `flows/deposit.html` | N/A (payment flow) |

## User Experience Flow

```
[Router Page]
     │
     ├─ Step 1: Intent
     │      │
     │      ▼
     ├─ Step 2: Clarity
     │      │
     │      ▼
     ├─ Step 3: Timing
     │      │
     │      ▼
     ├─ Step 4: Commitment
     │      │
     │      ▼
     └─ Result Screen
            │
            ├─ [Primary CTA] ──→ Recommended Form
            │
            └─ [Alt Links] ──→ Alternative Forms
```

## Design Philosophy

### Why This Approach?

1. **Reduces decision fatigue** - Users answer simple questions instead of evaluating form options
2. **Matches commitment level** - Low-commitment visitors get low-friction paths
3. **Qualifies leads** - Answer data helps understand visitor intent before they submit
4. **Increases trust** - Guidance feels helpful rather than pushy
5. **Scales across services** - Same router can serve multiple service offerings

### Three Visitor Mindsets

The router is designed to serve:

| Mindset | Characteristics | Typical Path |
|---------|-----------------|--------------|
| **Explorers** | Unsure, researching, low urgency | Quick Message |
| **Evaluators** | Real problem, comparing options | Consultation |
| **Buyers** | Clear intent, ready to act | Quote or Discovery |

## Styling

The router uses inline CSS with:
- Dark theme (black background, white text)
- Card-based option buttons with hover effects
- Animated transitions between steps
- Primary color accents on progress bar and icons
- Responsive grid layout for options

## Related Documentation

- [Funnel Framework](../business-logic/funnel_framework_v2.md) - Business logic and philosophy
- [Funnel Decision Tree](../business-logic/decision-trees/funnel_decision_tree.md) - Original routing rules
- [Sales Funnel Summary](../business-logic/sales_funnel_summary.md) - High-level overview
- [Smart Thank You Page](./smart-thank-you-page.md) - Post-submission experience
