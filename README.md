# Vanilla Vite Template Engine

A minimal, reusable Vite-based vanilla JavaScript frontend template with modular SCSS architecture and WordPress API integration support.

## Project Structure

```
├── v13_vite/               # Main application source
│   ├── src/
│   │   ├── js/             # JavaScript modules
│   │   │   ├── auth.js     # Authentication handling
│   │   │   ├── api.js      # API configuration
│   │   │   ├── core.js     # Core utilities (mobile menu, etc.)
│   │   │   └── services/   # API service modules
│   │   └── scss/           # Modular SCSS architecture
│   │       ├── _variables.scss
│   │       ├── _reset.scss
│   │       ├── _typography.scss
│   │       ├── _layout.scss
│   │       ├── _buttons.scss
│   │       ├── _forms.scss
│   │       ├── _cards.scss
│   │       ├── _navigation.scss
│   │       ├── _utilities.scss
│   │       └── main.scss
│   ├── flows/              # Multi-step form flows
│   └── public/             # Static assets
├── documents/              # Project documentation
└── cicd-setup/             # CI/CD pipeline configuration
```

## Tech Stack

- **Build Tool:** Vite 7.x
- **Language:** Vanilla JavaScript (ES modules)
- **Styling:** Sass/SCSS (modular BEM architecture)
- **HTTP Client:** Axios
- **Animations:** GSAP

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Development

```bash
cd v13_vite
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`

### Build

```bash
npm run build
```

Output is generated in `v13_vite/dist/`

## Template Pages

| Page | Description |
|------|-------------|
| `index.html` | Homepage template |
| `about.html` | About page |
| `contact.html` | Contact form |
| `content.html` | Content listing grid |
| `content-single.html` | Single content/article page |
| `login.html` | Login form |
| `signup.html` | Registration form |
| `forgot-password.html` | Password reset request |
| `reset-password.html` | New password form |
| `router.html` | Multi-step wizard/funnel |
| `style-guide.html` | Component showcase |
| `404.html` | Error page |
| `flows/form.html` | Standalone contact form |
| `flows/thank-you.html` | Form confirmation page |

## SCSS Architecture

The styling follows a modular BEM-style architecture:

- **`_variables.scss`** - CSS custom properties (colors, typography, spacing, shadows)
- **`_reset.scss`** - Modern CSS reset with accessibility defaults
- **`_typography.scss`** - Headings, body text, links, lists, code blocks
- **`_layout.scss`** - Container, grid, flexbox, spacing utilities
- **`_buttons.scss`** - Button variants (.btn--primary, .btn--outline, etc.)
- **`_forms.scss`** - Inputs, selects, checkboxes, validation states
- **`_cards.scss`** - Card component with variants
- **`_navigation.scss`** - Header, nav, mobile menu, footer
- **`_utilities.scss`** - Display, text, color, border helpers

### Using the Style Guide

Open `style-guide.html` in the browser to see all available components and utility classes. Use this as a reference when building new pages.

## Backend Integration

This template includes JavaScript modules for WordPress REST API integration:

- **API Base:** `/wp-json/wpbe/v1` (configurable via `.env`)
- **Auth:** JWT tokens via `/wp-json/jwt-auth/v1/token`

### Environment Variables

Create a `.env` file in `v13_vite/`:

```env
VITE_API_BASE_URL=https://your-backend.com/wp-json/wpbe/v1
VITE_WP_BASE_URL=https://your-backend.com
```

## Customization

1. **Branding** - Update `_variables.scss` with your colors, fonts, and spacing
2. **Navigation** - Edit the header/footer in each HTML file
3. **Content** - Replace placeholder text with your content
4. **Forms** - Configure `data-wpbe-form` attributes for backend integration

## License

MIT - Free to use for personal and commercial projects.
