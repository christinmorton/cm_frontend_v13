// SCSS imported via HTML head to prevent FOUC
// import './scss/main.scss';
import { initTracking } from './js/tracking/index.js';
import { initMobileMenu } from './js/core.js';
import { autoInitForms } from './js/utils/index.js';

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Tracking
  initTracking();

  // 2. Initialize Core UI (Mobile Menu)
  initMobileMenu();

  // 3. Initialize Forms
  autoInitForms();

  console.log('App Initialized');
});
