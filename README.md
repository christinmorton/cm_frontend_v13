# christinmorton.com Frontend

A modern Vite-based vanilla JavaScript frontend for christinmorton.com, featuring a client portal, sales funnel system, and WordPress API integration.

## Project Structure

```
├── v13_vite/           # Main application source
├── cicd-setup/         # CI/CD pipeline configuration
├── documents/          # Project documentation
│   ├── api/            # API & integration docs
│   ├── business-logic/ # Business rules & decision trees
│   └── features/       # Feature-specific documentation
└── resources/          # Marketing data & media assets
```

## Tech Stack

- **Build Tool:** Vite
- **Language:** Vanilla JavaScript (ES modules)
- **Styling:** Sass/SCSS + Tailwind CSS
- **HTTP Client:** Axios
- **Animations:** GSAP
- **3D Graphics:** Three.js

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

## Features

- **Client Portal** - Dashboard, projects, invoices, tickets, messaging
- **Sales Funnel** - Dynamic routing for lead capture and conversion
- **Guest Checkout** - E-commerce without mandatory registration
- **Appointment Booking** - Calendar integration for consultations
- **Form Submissions** - Contact, testimonials, FAQs, social proof
- **Guest Tracking** - Analytics for anonymous visitors

## Backend Integration

This frontend connects to a WordPress backend running the WP Business Essentials Pro plugin.

- **API Base:** `/wp-json/wpbe/v1`
- **Auth:** JWT tokens via `/wp-json/jwt-auth/v1/token`

See [documents/api/](documents/api/) for complete API documentation.

## Deployment

Automated deployment via GitHub Actions. See [cicd-setup/](cicd-setup/) for configuration.

### Servers

| Domain | Purpose |
|--------|---------|
| christinmorton.com | Vite frontend (Nginx + static files) |
| cms.christinmorton.com | WordPress backend |

## Documentation

- [API Documentation](documents/api/API-DOCUMENTATION.md)
- [Authentication Guide](documents/api/AUTH-DOCUMENTATION.md)
- [Frontend Integration Guide](documents/api/FRONTEND-INTEGRATION-GUIDE.md)
- [Business Logic](documents/business-logic/)
- [Decision Trees](documents/business-logic/decision-trees/)

## License

Private - All rights reserved.
