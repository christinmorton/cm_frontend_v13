# Content Extraction Strategy - Summary

## Overview

Strategy for extracting portfolio content from HTML into structured JSON files, creating a **content-first data model** that enables framework-agnostic rebuilds while preserving user-facing content.

## Benefits & Goals

- **Single Source of Truth**: Content separate from presentation
- **Framework Agnostic**: Reusable across React, Vue, static HTML, etc.
- **Easy Updates**: Change content without touching code
- **Version Control**: Track content changes independently
- **Reusability**: Mix and match components across designs

## What We Store vs. Don't Store

### ✅ Store
- User-facing text content
- Links (URLs + labels)
- Images (paths + alt text)
- Icons (references/identifiers)
- Form field definitions
- Semantic component types

### ❌ Don't Store
- CSS classes and styling
- Layout-specific HTML nesting
- Animation/carousel configuration
- Presentational-only elements

---

## File Structure

**Using: Separate JSON Files Per Page**

```
/content
  ├── global.json              # Shared components (header, nav, social)
  ├── index.json               # Home page
  ├── about.json               # About page
  ├── service.json             # Services page
  ├── contact.json             # Contact page
  ├── project-quote.json       # Forms
  └── [other pages...]
```

**Why?** Easier editing, better version control, cleaner organization, fewer merge conflicts.

---

## Core Component Types

### 1. Shared Global Components

**Header/Navigation**
```json
{
  "type": "header",
  "logo": { "src": "/images/logo.png", "alt": "Logo" },
  "navigation": [
    { "href": "index.html", "label": "Home", "active": true }
  ]
}
```

**Social Links**
```json
{
  "type": "socialLinks",
  "links": [
    { "platform": "GitHub", "url": "https://...", "icon": "github" }
  ]
}
```

---

### 2. Section-Level Components

**Hero Section**
```json
{
  "type": "hero",
  "heading": { "text": "Main Title", "highlight": "Highlighted" },
  "description": "Intro text...",
  "image": { "src": "/images/profile.png", "alt": "Profile" },
  "cta": [{ "label": "Get Started", "href": "/contact" }],
  "stats": [{ "value": "50+", "label": "Happy Clients" }]
}
```

**Card Grid Section**
```json
{
  "type": "section",
  "sectionTitle": { "text": "Services", "highlight": "We Offer" },
  "components": [
    {
      "type": "card",
      "variant": "serviceCard",
      "title": "Web Development",
      "price": { "from": "$500" },
      "features": ["Feature 1", "Feature 2"]
    }
  ]
}
```

**Card Variants:**
- `serviceCard` - Services with pricing
- `skillCard` - Skills with descriptions
- `experienceCard` - Work history
- `testimonialCard` - Client testimonials
- `packageCard` - Pricing packages
- `ctaCard` - Call-to-action cards
- `problemCard` - Problem/solution statements
- `featureCard` - Feature highlights

**Tabbed Content**
```json
{
  "type": "tabbedContent",
  "tabs": [
    {
      "id": "skills",
      "label": "Skills",
      "active": true,
      "content": { "type": "cardGrid", "cards": [...] }
    }
  ]
}
```

**FAQ Section**
```json
{
  "type": "faq",
  "title": "Frequently Asked",
  "items": [
    {
      "question": "How long does it take?",
      "answer": { "paragraphs": ["2-4 weeks..."] }
    }
  ]
}
```

**Process Steps**
```json
{
  "type": "processList",
  "title": "How It Works",
  "steps": [
    { "title": "Step 1", "description": "Description..." }
  ]
}
```

---

### 3. Form Components (Highest Priority)

**Form Structure**
```json
{
  "type": "form",
  "id": "contactForm",
  "title": "Contact",
  "method": "post",
  "fields": [
    {
      "type": "text",
      "name": "name",
      "placeholder": "Full Name*",
      "required": true,
      "validation": { "minLength": 2 }
    },
    {
      "type": "email",
      "name": "email",
      "placeholder": "Email*",
      "required": true
    },
    {
      "type": "select",
      "name": "budget",
      "options": [
        { "value": "under-500", "label": "Under $500" }
      ]
    }
  ],
  "submitButton": { "label": "Submit", "icon": "arrow-right" },
  "messages": {
    "success": "Message sent!",
    "error": "Error sending message."
  }
}
```

**Supported Field Types:**
- `text` - Single-line text
- `email` - Email with validation
- `tel` - Phone number
- `textarea` - Multi-line text
- `select` - Dropdown
- `checkbox` - Multiple choice
- `radio` - Single choice
- `file` - File upload with drag-drop
- `hidden` - Hidden metadata

**File Upload Configuration**
```json
{
  "type": "file",
  "name": "attachments",
  "multiple": true,
  "accept": [".pdf", ".jpg", ".png"],
  "maxSize": "10MB",
  "maxFiles": 5,
  "validation": {
    "fileTypes": ["pdf", "jpg", "png"],
    "maxFileSize": 10485760
  },
  "errorMessages": {
    "fileType": "Only PDF, JPG, PNG allowed",
    "fileSize": "Max 10MB"
  }
}
```

---

### 4. Primitive Content Types

**Heading**
```json
{ "type": "heading", "level": 1, "text": "Title", "highlight": "Title" }
```

**Paragraph**
```json
{ "type": "paragraph", "text": "Content..." }
```

**Image**
```json
{ "type": "image", "src": "/images/photo.jpg", "alt": "Description" }
```

**Link/Button**
```json
{ "type": "link", "label": "Learn More", "href": "/about", "icon": "arrow-right" }
{ "type": "button", "label": "Get Started", "variant": "primary" }
```

**List**
```json
{ "type": "list", "style": "unordered", "items": ["Item 1", "Item 2"] }
```

---

## Icon Handling

### SVG Sprite Icons
```json
{ "icon": "arrow-right", "iconType": "svg" }
```

### Icon Font (Icofont)
```json
{ "icon": "icofont-github", "iconType": "iconFont" }
```

### Emoji/Unicode
```json
{ "icon": "🎯", "iconType": "emoji" }
```

---

## Page Metadata

```json
{
  "meta": {
    "pageId": "index",
    "title": "Home - Portfolio",
    "description": "Homepage",
    "template": "background",
    "lastUpdated": "2025-01-15"
  },
  "sections": [...]
}
```

---

## Design Principles

1. **Content Over Structure** - Store what users see, not display logic
2. **Flexibility** - Support multiple use cases
3. **Simplicity** - Prefer flat structures
4. **Extensibility** - Easy to add new component types
5. **Portability** - Framework-agnostic

---

## Implementation Steps

1. **Create Schema** - Define TypeScript/JSON Schema for validation
2. **Extract Content** - Start with form pages (highest priority)
3. **Build Renderer** - Create HTML renderer that reads JSON
4. **Validate & Test** - Ensure no content loss
5. **Iterate** - Refine schema based on usage

---

## Key Notes

- **Carousels**: Treat as simple arrays; rendering layer handles animation
- **Optional Fields**: Components support optional properties (subtitle, badge, etc.)
- **Nested Components**: Cards can contain primitives (headings, lists, etc.)
- **Form Focus**: Most detailed schema due to high customization priority
