// SCSS imported via HTML head to prevent FOUC
// import './scss/main.scss';
import { ThreeBackground } from './js/components/ThreeBackground.js';
import { initTracking } from './js/tracking/index.js';
import { initMobileMenu } from './js/core.js';
import { autoInitForms } from './js/utils/index.js';

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Background (if applicable)
  // Only init if we are not on a mobile device or if performance allows? 
  // For now, adhering to previous implementation which just ran new ThreeBackground()
  // However, ThreeBackground likely manages its own container check.
  try {
    new ThreeBackground();
  } catch (e) {
    console.warn('ThreeBackground initialization failed or skipped', e);
  }

  // 2. Initialize Tracking
  initTracking();

  // 3. Initialize Core UI (Mobile Menu)
  initMobileMenu();

  // 4. Initialize Forms
  autoInitForms();

  console.log('App Initialized');
});
