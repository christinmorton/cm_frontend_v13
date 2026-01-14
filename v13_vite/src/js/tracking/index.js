/**
 * tracking/index.js
 * Entry point for Guest Tracking.
 */

import { guestManager } from './GuestManager.js';
import { analytics } from './Analytics.js';

export function initTracking() {
    // 1. Initial Guest Check (lazy, or eager?)
    // The pattern suggests lazy ensure on interaction, or maybe eager?
    // "Guests are created on engagement... not on page load" from docs.
    // However, page_view is a valid event. If we want to track page views, we likely need a guest.
    // But docs say "Guests are created on engagement". 
    // Let's stick to the docs: "Guests are created on engagement (CTA clicks or form interactions)".

    // BUT, if we want to track page_view, we probably want to create one if they are already a guest?
    // Let's follow this logic:
    // If they are ALREADY a guest (localStorage has id), track page view.
    // If NOT, do NOT create guest just for page view (wait for engagement).

    if (guestManager.hasGuest()) {
        analytics.trackPageView();
    }

    // 2. Setup CTA Click Listeners
    document.querySelectorAll('[data-cta]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            // Ensure guest exists now (engagement happened)
            await guestManager.ensureGuest();

            const ctaId = e.target.dataset.cta || e.currentTarget.dataset.cta;
            analytics.trackCtaClick(ctaId);
        });
    });

    // 3. Setup Form Listeners
    document.querySelectorAll('form[data-track]').forEach(form => {
        const formId = form.dataset.track;

        // Track when they focus in the form (start)
        form.addEventListener('focusin', async () => {
            await guestManager.ensureGuest();
            analytics.trackFormStart(formId);
        }, { once: true });

        // Track submission
        form.addEventListener('submit', async (e) => {
            // Note: form might preventDefault, or it might submit naturally.
            // If natural submit, we need to try to flush quickly.
            // Assuming this app might use SPA style or AJAX handling since it's Vite + likely JS driven.
            // But if standard submit, this race is hard to win.

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => data[key] = value);

            const isConversion = form.getAttribute('data-convert') === 'true';

            if (isConversion) {
                // Attempt conversion (creates Lead on backend)
                // We await this, hoping the browser doesn't navigate away too fast if it's a standard form
                await guestManager.convertGuest(formId, data);
            } else {
                analytics.track('form_submit', {
                    form_id: formId,
                    form_data: data
                });
            }

            analytics.flush();
        });
    });

    // Expose for debugging if needed
    window.__guestManager = guestManager;
    window.__analytics = analytics;

    console.log('Tracking initialized');
}
