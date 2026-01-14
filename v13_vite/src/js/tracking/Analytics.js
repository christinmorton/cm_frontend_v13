/**
 * Analytics.js
 * Handles event tracking and batching.
 */

import { guestManager } from './GuestManager.js';

// Get API base URL from environment variable, with fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://general-wp.local/wp-json/wpbe/v1';

// Check if we're using the default local URL (likely not configured)
const isDefaultLocalUrl = API_BASE.includes('general-wp.local') || API_BASE.includes('localhost');

export const analytics = {
    queue: [],
    isFlushing: false,
    isServerAvailable: true, // Track server availability to prevent error spam
    consecutiveFailures: 0,
    maxConsecutiveFailures: 2, // Stop trying after 2 consecutive failures (reduced from 3)
    retryTimer: null, // Track retry timer to prevent multiple timers
    isEnabled: true, // Allow disabling analytics entirely

    /**
     * Adds an event to the queue.
     * @param {string} eventType 
     * @param {object} eventData 
     * @param {string} pagePath 
     */
    track(eventType, eventData, pagePath = window.location.pathname) {
        this.queue.push({
            event_type: eventType,
            event_data: eventData,
            page_path: pagePath,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Flushes the event queue to the backend.
     */
    async flush(retryCount = 0) {
        // Don't flush if disabled or no events
        if (!this.isEnabled || !this.queue.length || this.isFlushing) return;

        // If analytics is disabled or server is unavailable, don't attempt to flush
        if (!this.isEnabled) {
            return;
        }

        // If server is unavailable after max failures, don't attempt to flush (prevents error spam)
        if (!this.isServerAvailable && this.consecutiveFailures >= this.maxConsecutiveFailures) {
            // Silently queue events for later (they'll be sent when server is back)
            return;
        }

        // If using default local URL and we've already failed once, don't keep trying
        if (isDefaultLocalUrl && this.consecutiveFailures >= 1) {
            // Disable analytics to prevent repeated errors
            this.isEnabled = false;
            this.isServerAvailable = false;
            this.queue = [];
            return;
        }

        // We need a guest session to track events
        if (!guestManager.hasGuest()) {
            // Attempt to ensure guest exists before giving up
            const guestId = await guestManager.ensureGuest();
            if (!guestId) return;
        }

        this.isFlushing = true;
        const eventsToSend = [...this.queue];
        this.queue = [];

        try {
            // Use AbortController to handle timeouts and prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(`${API_BASE}/analytics/events/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Guest-Token': guestManager.getToken()
                },
                body: JSON.stringify({
                    guest_id: guestManager.getGuestId(),
                    events: eventsToSend
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // If invalid token (401/403) and we haven't retried yet
            if ((response.status === 401 || response.status === 403) && retryCount === 0) {
                console.warn('Analytics token invalid. Resetting session...');
                guestManager.resetSession();
                await guestManager.ensureGuest();

                // Put events back in queue and retry
                this.queue = [...eventsToSend, ...this.queue];
                this.isFlushing = false;
                return this.flush(1); // Retry once
            }

            if (!response.ok) {
                // Server responded but with error status
                this.consecutiveFailures++;
                if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
                    this.isServerAvailable = false;
                    console.warn(`Analytics server unavailable after ${this.consecutiveFailures} failures. Events will be queued.`);
                }
                // Re-queue events for retry
                this.queue = [...eventsToSend, ...this.queue];
            } else {
                // Success - reset failure counter
                this.consecutiveFailures = 0;
                this.isServerAvailable = true;
            }

        } catch (error) {
            // Network error (connection refused, timeout, etc.)
            this.consecutiveFailures++;
            
            // If using default local URL and server is unavailable, disable analytics after first failure
            if (isDefaultLocalUrl && this.consecutiveFailures >= 1) {
                this.isEnabled = false;
                this.isServerAvailable = false;
                this.queue = []; // Clear queue since we're disabling
                console.info('Analytics: Disabled due to unavailable server. Configure VITE_API_BASE_URL in .env to enable.');
                return; // Exit early, don't re-queue events
            }
            
            // Only log error on first failure to avoid spam
            if (this.consecutiveFailures === 1) {
                console.warn('Analytics server connection failed. Events will be queued for retry.');
            }
            
            if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
                this.isServerAvailable = false;
            }
            
            // Re-queue events for retry when server is back (unless disabled)
            if (this.isEnabled) {
                this.queue = [...eventsToSend, ...this.queue];
            }
        } finally {
            this.isFlushing = false;
        }
    },

    // Helper methods for common events
    trackPageView() {
        this.track('page_view', { page_title: document.title });
    },

    trackCtaClick(ctaId) {
        this.track('cta_click', { cta_id: ctaId });
    },

    trackFormStart(formId) {
        this.track('form_start', { form_id: formId });
    },

    trackFormProgress(formId, step, data) {
        this.track('form_progress', { form_id: formId, step, field_data: data });
    }
};

// Auto-flush every 5 seconds (only if enabled)
setInterval(() => {
    if (analytics.isEnabled) {
        analytics.flush();
        // If server was unavailable, try to recover periodically
        if (!analytics.isServerAvailable && analytics.queue.length > 0 && !analytics.retryTimer) {
            // Reset failure counter after 30 seconds to allow retry
            analytics.retryTimer = setTimeout(() => {
                analytics.consecutiveFailures = 0;
                analytics.isServerAvailable = true;
                analytics.retryTimer = null;
            }, 30000); // Wait 30 seconds before retrying
        }
    }
}, 5000);

// Flush on page unload
window.addEventListener('beforeunload', () => {
    // changing to navigator.sendBeacon for reliability on unload if possible, 
    // but sticking to fetch as requested in patterns for now, but usually fetch on unload is flaky.
    // However, the original pattern used simple fetch. 
    // We'll call flush but keep in mind it might be cancelled by browser.
    analytics.flush();
});
