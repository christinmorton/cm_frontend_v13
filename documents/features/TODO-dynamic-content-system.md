# TODO: Dynamic Content Generation System

**Status:** Future Feature
**Priority:** Low
**Created:** 2026-01-17

## Overview

Build a system in the WordPress plugin backend that serves marketing content dynamically via API, using structured JSON data as the source.

## Current Approach

Marketing content is hardcoded in the frontend HTML. The JSON files in `resources/data/marketing_data_files/` serve as the source of truth for writing content.

## Proposed Feature

Create a WordPress-based content management system that:

1. **Stores marketing data** in the database (or as structured options)
2. **Exposes REST API endpoints** to serve content to the frontend
3. **Allows admin editing** of messaging, headlines, CTAs without code changes
4. **Supports versioning** for A/B testing potential

## Source Files

These JSON files would seed or inform the system:

- `ad-copy-messaging.json` - Headlines, taglines, CTAs, social posts
- `one-pager.json` - Brand info, services, pricing, process steps
- `lead-magnet-checklist.json` - Interactive ownership audit content
- `proposal-template.json` - Client proposal structure
- `seo-content-outlines.json` - Blog post outlines

## Benefits (When Needed)

- Single source of truth for all marketing copy
- Update content without frontend redeployment
- A/B testing capabilities
- Multi-channel content distribution (web, email, proposals)
- Reusable for future clients if productized

## When to Implement

Consider building this when:

- [ ] Frequent content updates become a bottleneck
- [ ] A/B testing is a priority
- [ ] Multiple team members need to edit copy
- [ ] The platform is being productized for other clients

## Technical Notes

- Could extend existing `dynamic_cards` or `content` tables
- API endpoints: `/content/marketing/{section}`
- Consider caching strategy to avoid API latency on page load
- Fallback to static content if API fails

## Decision

**2026-01-17:** Decided to hardcode content for initial launch. Revisit after launch based on actual content update frequency.
