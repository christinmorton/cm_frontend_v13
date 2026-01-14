/**
 * Core functionality for the V1 Website
 * Handles global UI interactions like specific navigation toggles.
 */

import { initTracking } from './tracking/index.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    initTracking();
    initMobileMenu();
});

function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileBtn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = document.querySelector('.mobile-menu-close');
    const body = document.body;

    if (!mobileBtn || !mobileMenu) return;

    // Open Menu
    mobileBtn.addEventListener('click', () => {
        const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';

        if (!isExpanded) {
            mobileMenu.classList.add('active');
            mobileBtn.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        }
    });

    // Close Menu Actions
    const closeMenu = () => {
        mobileMenu.classList.remove('active');
        mobileBtn.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    // Close on link click (for better UX on single page or jumping)
    const navLinks = mobileMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on click outside (optional, but good polish)
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            closeMenu();
        }
    });
}
