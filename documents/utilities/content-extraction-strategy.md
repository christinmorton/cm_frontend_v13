# Content Extraction Strategy

## Overview

This document outlines the strategy for extracting content from the current HTML portfolio into structured JSON files. The goal is to create a **content-first data model** that can be used to rebuild the portfolio with different frameworks, designs, or technologies while preserving the actual content users see and interact with.

## Why Extract Content to JSON?

### Benefits
- **Single Source of Truth**: Content lives in one place, separate from presentation
- **Framework Agnostic**: Use the same content across different HTML projects, React apps, Vue, etc.
- **Easy Updates**: Change content without touching HTML/CSS
- **Version Control**: Track content changes independently from code
- **Reusability**: Mix and match components across different page designs

### What We're NOT Storing
- CSS classes and styling information
- Layout-specific HTML nesting (divs, wrappers)
- Animation/carousel configuration
- Presentational-only elements

### What We ARE Storing
- User-facing text content
- Links (URLs + labels)
- Images (paths + alt text)
- Icons (references/identifiers)
- Form field definitions
- Semantic component types (cards, buttons, etc.)

---

## File Structure Approach

We will use **Option 2: Separate JSON Files Per Page**

```
/content
  ├── global.json          # Shared components (header, nav, social links)
  ├── index.json           # Home page content
  ├── about.json           # About page content
  ├── service.json         # Services page content
  ├── contact.json         # Contact page content
  ├── project-quote.json   # Project quote form
  ├── free-consultation.json
  ├── project-discovery.json
  ├── consultation-booking.json
  └── [other form pages...]
```

### Why Separate Files?
- Easier to edit individual pages
- Better for version control and diffs
- Cleaner code organization
- Reduces merge conflicts
- Can still reference `global.json` from each page if needed

---

## Content Structure Patterns

Based on analysis of the existing HTML files, here are the semantic component types we've identified:

### **1. Shared Global Components**

#### **Header/Navigation**
```json
{
  "type": "header",
  "logo": {
    "src": "/images/logo_2.png",
    "alt": "Christin Morton Logo"
  },
  "navigation": [
    { "href": "index.html", "label": "Home", "active": true },
    { "href": "about.html", "label": "About", "active": false },
    { "href": "service.html", "label": "Services", "active": false },
    { "href": "contact.html", "label": "Contact", "active": false }
  ]
}
```

#### **Social Links**
```json
{
  "type": "socialLinks",
  "links": [
    {
      "platform": "Facebook",
      "url": "https://www.facebook.com/morton41Christin",
      "icon": "facebook",
      "iconType": "svg"
    },
    {
      "platform": "GitHub",
      "url": "https://github.com/christinmorton",
      "icon": "icofont-github",
      "iconType": "iconFont"
    }
  ]
}
```

---

### **2. Section-Level Components**

Each page is composed of multiple sections. Sections can contain various component types.

#### **Hero/Intro Sections**
```json
{
  "type": "hero",
  "heading": {
    "text": "Need a Website",
    "highlight": "that Works?"
  },
  "description": "I'm Christin, I specialize in WordPress and modern web apps...",
  "image": {
    "src": "/images/my_profile_pic_2025_round-out-effect_transparent_2.png",
    "alt": "Christin Morton - Web Developer",
    "width": "600"
  },
  "cta": [
    {
      "type": "button",
      "label": "Get Free Consultation",
      "href": "free-consultation.html",
      "icon": "arrow-right"
    }
  ],
  "badge": {
    "icon": "🎯",
    "text": "Las Vegas Web Developer"
  },
  "stats": [
    { "value": "2-4", "label": "Week Delivery" },
    { "value": "50+", "label": "Happy Clients" },
    { "value": "100%", "label": "Mobile Ready" }
  ]
}
```

#### **Card Grid Sections**
Cards are one of the most common component types. They can be service cards, skill cards, experience cards, testimonial cards, etc.

```json
{
  "type": "section",
  "sectionTitle": {
    "text": "Choose Your",
    "highlight": "Perfect Package"
  },
  "sectionSubtitle": "Transparent pricing, clear deliverables, fast turnaround",
  "components": [
    {
      "type": "card",
      "variant": "serviceCard",
      "icon": "🟡",
      "title": "Tech Touch-Ups",
      "subtitle": "One-time fixes",
      "price": {
        "from": "$50",
        "range": "- $150"
      },
      "features": [
        "Analytics setup",
        "Email configuration",
        "Security hardening",
        "Speed optimization"
      ],
      "cta": {
        "label": "View Services",
        "href": "#packages"
      }
    }
  ]
}
```

**Card Variants We've Identified:**
- `serviceCard` - Service offerings with pricing
- `skillCard` - Skills with title + description
- `experienceCard` - Work history with title, role, description
- `testimonialCard` - Client testimonials with rating, quote, author
- `packageCard` - Detailed pricing packages
- `ctaCard` - Call-to-action cards in carousels
- `problemCard` - Problem/solution statements
- `featureCard` - Feature highlights

#### **Tabbed Content**
```json
{
  "type": "tabbedContent",
  "tabs": [
    {
      "id": "skills",
      "label": "Skills",
      "active": true,
      "content": {
        "type": "cardGrid",
        "cards": [
          {
            "type": "card",
            "variant": "skillCard",
            "title": "Custom Website Development",
            "description": "Building tailored sites for unique goals."
          }
        ]
      }
    },
    {
      "id": "experience",
      "label": "Experience",
      "active": false,
      "content": { /* ... */ }
    }
  ]
}
```

#### **Text-Heavy Sections**

**FAQ Section:**
```json
{
  "type": "faq",
  "title": "Frequently Asked",
  "titleHighlight": "Questions",
  "items": [
    {
      "question": "How long does a standard 5-page site take?",
      "answer": {
        "paragraphs": [
          "Most Business Site Builder projects launch within **2–4 weeks**..."
        ],
        "lists": [
          {
            "type": "unordered",
            "items": [
              "**Week 1:** Planning & setup",
              "**Week 2-3:** Development & design",
              "**Week 4:** Testing & launch"
            ]
          }
        ]
      }
    }
  ]
}
```

**Process Steps:**
```json
{
  "type": "processList",
  "title": "How It Works",
  "titleHighlight": "(Simple 7-Step Process)",
  "steps": [
    {
      "title": "Book a Free Call",
      "description": "a quick 15-minute chat to understand your goals."
    },
    {
      "title": "Fast Estimate",
      "description": "you'll get a clear price range and recommended package."
    }
  ]
}
```

**Problem/Solution Blocks:**
```json
{
  "type": "problemSolutionSection",
  "problemSide": {
    "badge": {
      "icon": "⚠️",
      "text": "The Problem"
    },
    "title": "What Businesses Struggle With",
    "items": [
      {
        "icon": "😤",
        "title": "Outdated DIY Sites",
        "description": "Unprofessional websites driving customers away"
      }
    ]
  },
  "solutionSide": {
    "badge": {
      "icon": "✅",
      "text": "My Solution"
    },
    "title": {
      "text": "Simple,",
      "highlight": "Productized Services"
    },
    "intro": "I turn complex technology into clear, simple packages...",
    "features": [
      {
        "icon": "🎯",
        "title": "Clearly Scoped",
        "description": "No surprises, no scope creep"
      }
    ]
  }
}
```

---

### **3. Form Components** (Highest Detail Priority)

Forms are the **most configurable** part of this content model. They should support maximum flexibility for customization.

#### **Form Structure**
```json
{
  "type": "form",
  "id": "contactForm",
  "title": "Let's work",
  "titleHighlight": "Together",
  "description": "Ready to bring your ideas to life? Get in touch...",
  "method": "post",
  "action": "javascript:void(0)",
  "fields": [
    {
      "type": "text",
      "name": "name",
      "placeholder": "Full Name*",
      "required": true,
      "gridColumn": "1",
      "validation": {
        "required": true,
        "minLength": 2
      }
    },
    {
      "type": "email",
      "name": "email",
      "placeholder": "Email*",
      "required": true,
      "gridColumn": "2",
      "validation": {
        "required": true,
        "pattern": "email"
      }
    },
    {
      "type": "textarea",
      "name": "message",
      "placeholder": "Message",
      "rows": 4,
      "required": true,
      "gridColumn": "full",
      "validation": {
        "required": true,
        "minLength": 10
      }
    },
    {
      "type": "file",
      "name": "attachments",
      "label": "Attach files (optional)",
      "multiple": true,
      "accept": [".pdf", ".doc", ".docx", ".jpg", ".png"],
      "maxSize": "10MB",
      "maxFiles": 5,
      "dragDropText": "Drag & drop files here or click to browse",
      "validation": {
        "fileTypes": ["pdf", "doc", "docx", "jpg", "png"],
        "maxFileSize": 10485760,
        "maxFiles": 5
      },
      "errorMessages": {
        "fileType": "Only PDF, DOC, DOCX, JPG, and PNG files are allowed",
        "fileSize": "File size must be less than 10MB",
        "maxFiles": "Maximum 5 files allowed"
      }
    },
    {
      "type": "select",
      "name": "budget",
      "label": "Budget Range",
      "placeholder": "Select your budget",
      "options": [
        { "value": "", "label": "Select your budget" },
        { "value": "under-500", "label": "Under $500" },
        { "value": "500-1500", "label": "$500 - $1,500" },
        { "value": "1500-5000", "label": "$1,500 - $5,000" },
        { "value": "5000-plus", "label": "$5,000+" }
      ],
      "validation": {
        "required": false
      }
    },
    {
      "type": "checkbox",
      "name": "serviceTypes",
      "label": "What services are you interested in?",
      "options": [
        { "value": "website", "label": "New Website" },
        { "value": "redesign", "label": "Website Redesign" },
        { "value": "maintenance", "label": "Maintenance & Updates" },
        { "value": "custom", "label": "Custom Development" }
      ],
      "validation": {
        "required": false
      }
    },
    {
      "type": "radio",
      "name": "timeline",
      "label": "Preferred Timeline",
      "options": [
        { "value": "asap", "label": "ASAP (within 2 weeks)" },
        { "value": "month", "label": "Within a month" },
        { "value": "flexible", "label": "Flexible" }
      ],
      "validation": {
        "required": false
      }
    }
  ],
  "submitButton": {
    "label": "Let's Talk",
    "icon": "arrow-right"
  },
  "messages": {
    "success": "Thank you! Your message has been sent successfully.",
    "error": "Sorry, there was an error sending your message. Please try again."
  },
  "sidebar": {
    "sections": [
      {
        "title": "What You'll Get",
        "type": "benefitsList",
        "items": [
          "✓ 15-minute consultation call",
          "✓ Clear next steps",
          "✓ No pressure, just clarity"
        ]
      },
      {
        "title": "We'll Discuss",
        "type": "topicsList",
        "items": [
          {
            "icon": "🎯",
            "title": "Your Goals",
            "description": "What you want to achieve"
          },
          {
            "icon": "💡",
            "title": "Best Approach",
            "description": "Which service fits your needs"
          }
        ]
      }
    ]
  }
}
```

#### **Form Field Types Supported**
- `text` - Single-line text input
- `email` - Email input with validation
- `tel` - Phone number input
- `textarea` - Multi-line text
- `select` - Dropdown menu
- `checkbox` - Multiple choice checkboxes
- `radio` - Single choice radio buttons
- `file` - File upload with drag-drop
- `hidden` - Hidden fields for metadata

#### **File Upload Configuration**
File upload fields deserve special attention for maximum configurability:

```json
{
  "type": "file",
  "name": "attachments",
  "label": "Attach files (optional)",
  "helpText": "Share inspiration, mockups, or documents",
  "multiple": true,
  "accept": [".pdf", ".doc", ".docx", ".jpg", ".png", ".zip"],
  "maxSize": "10MB",
  "maxFiles": 5,
  "dragDropEnabled": true,
  "dragDropText": "Drag & drop files here or click to browse",
  "showPreview": true,
  "previewType": "thumbnail",
  "validation": {
    "required": false,
    "fileTypes": ["pdf", "doc", "docx", "jpg", "png", "zip"],
    "maxFileSize": 10485760,
    "maxFiles": 5,
    "minFiles": 0
  },
  "errorMessages": {
    "fileType": "Only PDF, DOC, DOCX, JPG, PNG, and ZIP files are allowed",
    "fileSize": "File size must be less than 10MB",
    "maxFiles": "Maximum 5 files allowed",
    "uploadFailed": "Upload failed. Please try again."
  },
  "ui": {
    "buttonText": "Choose Files",
    "removeButtonText": "Remove",
    "uploadingText": "Uploading...",
    "showFileList": true,
    "showFileSize": true
  }
}
```

---

### **4. Primitive Content Types**

These are the atomic building blocks that compose larger components:

#### **Heading**
```json
{
  "type": "heading",
  "level": 1,
  "text": "Welcome to my portfolio",
  "highlight": "my portfolio"
}
```

#### **Paragraph**
```json
{
  "type": "paragraph",
  "text": "This is a paragraph of text content."
}
```

#### **Image**
```json
{
  "type": "image",
  "src": "/images/profile.jpg",
  "alt": "Profile photo",
  "width": "600",
  "loading": "lazy"
}
```

#### **Link/Button**
```json
{
  "type": "link",
  "label": "Learn More",
  "href": "/about",
  "icon": "arrow-right",
  "iconPosition": "right"
}
```

```json
{
  "type": "button",
  "label": "Get Started",
  "href": "/contact",
  "variant": "primary",
  "icon": "arrow-right"
}
```

#### **List**
```json
{
  "type": "list",
  "style": "unordered",
  "items": [
    "Item one",
    "Item two",
    "Item three"
  ]
}
```

#### **Badge/Tag**
```json
{
  "type": "badge",
  "icon": "🎯",
  "text": "Featured"
}
```

#### **Stat**
```json
{
  "type": "stat",
  "value": "50+",
  "label": "Happy Clients"
}
```

---

## Icon Handling Strategy

Icons in this project come from two sources:

### **1. SVG Sprite Icons** (Inline SVG symbols)
These are defined in the HTML `<svg>` sprite and referenced via `<use>` tags.

**Storage Format:**
```json
{
  "icon": "arrow-right",
  "iconType": "svg"
}
```

**Available SVG Icons:**
- `arrow-right`
- `arrow-left`
- `home`
- `person`
- `contact`
- `layout`
- `testimonial`
- `pages`
- `page-add`
- `multiple-pages`
- `quote-left`
- `search`
- `close`
- `facebook`
- `instagram`
- `twitter`
- `linkedin`
- `dribbble`
- `skype`
- `upload`
- `file`

### **2. Icon Font Icons** (Icofont)
These use CSS classes from the Icofont library.

**Storage Format:**
```json
{
  "icon": "icofont-github",
  "iconType": "iconFont"
}
```

**Common Icofont Icons Used:**
- `icofont-github`
- `icofont-behance`

### **3. Emoji/Unicode Icons**
Some UI elements use emoji for visual flair.

**Storage Format:**
```json
{
  "icon": "🎯",
  "iconType": "emoji"
}
```

**Why Store Icon Type?**
- Allows the rendering layer to handle each type appropriately
- Makes it easy to swap icon systems in the future
- Preserves semantic meaning without breaking the JSON

---

## Metadata Considerations

Each page JSON file should include metadata for context:

```json
{
  "meta": {
    "pageId": "index",
    "title": "Home - Christin Morton",
    "description": "Portfolio homepage",
    "template": "background",
    "lastUpdated": "2025-01-15"
  },
  "sections": [ /* ... */ ]
}
```

---

## Next Steps

1. **Create Schema Document** - Define TypeScript/JSON Schema for validation
2. **Extract Content** - Start with form pages (highest priority)
3. **Build Renderer** - Create a simple HTML renderer that reads JSON
4. **Validate & Test** - Ensure no content is lost in translation
5. **Iterate** - Refine schema based on usage

---

## Design Principles

1. **Content Over Structure** - Store what users see, not how it's displayed
2. **Flexibility** - Support multiple use cases without over-specifying
3. **Simplicity** - Prefer flat structures over deep nesting
4. **Extensibility** - Easy to add new component types
5. **Portability** - Works with any framework or static generator

---

## Notes

- **Carousel/Slider Content**: We treat these as simple arrays of cards/slides. Animation and UI behavior is handled by the rendering layer.
- **Conditional Content**: Some components may have optional fields (e.g., `subtitle`, `badge`, `sidebar`).
- **Nested Components**: Cards can contain other primitives (headings, paragraphs, lists, etc.).
- **Form Focus**: Forms receive the most detailed schema since they're the highest priority for customization.
