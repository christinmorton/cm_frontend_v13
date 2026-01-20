# Project Roadmap

This document tracks planned features, integrations, and improvements for the Vanilla Vite Template Engine.

## Status Legend

- [ ] Not started
- [x] Completed
- [~] In progress

---

## High Priority

### Template Enhancements
- [ ] Add dark mode support with CSS custom properties
- [ ] Create additional page templates (pricing, FAQ, team)
- [ ] Add skeleton loading states for dynamic content
- [ ] Implement toast/notification component

### Documentation
- [ ] Add JSDoc comments to JavaScript modules
- [ ] Create component usage examples in style guide
- [ ] Document environment variable configuration
- [ ] Add deployment guide for common hosting platforms

---

## Medium Priority

### Form Handling
- [ ] Add client-side form validation with visual feedback
- [ ] Implement multi-step form progress saving (localStorage)
- [ ] Add file upload component with drag-and-drop
- [ ] Create form field components (date picker, phone input)

### Accessibility
- [ ] Audit all components for WCAG 2.1 AA compliance
- [ ] Add skip navigation links
- [ ] Improve keyboard navigation for mobile menu
- [ ] Add ARIA live regions for dynamic content

### Performance
- [ ] Implement lazy loading for images
- [ ] Add service worker for offline support
- [ ] Optimize SCSS output with PurgeCSS
- [ ] Add preload hints for critical resources

---

## Lower Priority

### Additional Components
- [ ] Modal/dialog component
- [ ] Tabs component
- [ ] Accordion component
- [ ] Tooltip component
- [ ] Dropdown menu component
- [ ] Pagination component

### Integrations
- [ ] Add Google Analytics 4 configuration option
- [ ] Create Stripe payment form template
- [ ] Add social share buttons
- [ ] Implement cookie consent banner

### Developer Experience
- [ ] Add ESLint configuration
- [ ] Set up Prettier for code formatting
- [ ] Create VS Code workspace settings
- [ ] Add Husky pre-commit hooks

---

## Completed

### Template Simplification (v2.0)
- [x] Remove project-specific content and branding
- [x] Delete unused pages (blog, e-commerce, client portal, services)
- [x] Remove Three.js 3D background dependency
- [x] Create modular SCSS architecture with BEM naming
- [x] Build comprehensive style guide page
- [x] Simplify HTML files with generic placeholder content
- [x] Add 404 error page
- [x] Streamline flows to core multi-step form concept

### Smart Thank You Page (v1.0)
- [x] Dynamic content based on form type
- [x] Name personalization from URL params
- [x] Auto-redirect countdown with cancel option

### Router Funnel (v1.0)
- [x] Multi-step wizard component
- [x] Progress bar indicator
- [x] Dynamic result routing based on answers

### SCSS Architecture (v2.0)
- [x] CSS custom properties for design tokens
- [x] Modern CSS reset
- [x] Typography scale
- [x] Layout utilities (container, grid, flex)
- [x] Button variants and sizes
- [x] Form components with validation states
- [x] Card component with variants
- [x] Navigation components (header, mobile nav, footer)
- [x] Utility classes (display, spacing, text, colors)
- [x] Auth page layout
- [x] Alert and badge components

---

## Notes

- **No Tailwind** - This template uses custom SCSS for full control over styling
- **WordPress Integration** - JavaScript modules support WordPress REST API but are optional
- **Minimal Dependencies** - Only axios and gsap included; add others as needed
