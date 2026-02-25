# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Documentation site for **Lunar PHP**, a headless Laravel e-commerce framework. Built with **Mintlify** — all content is MDX files configured via `docs.json`.

## Development Commands

```bash
npm i -g mint        # Install Mintlify CLI
mint dev             # Local dev server at http://localhost:3000
mint update          # Update CLI if dev environment isn't working
```

## Architecture

- **`docs.json`** — Central configuration: navigation, theming, redirects, integrations. All page routing is defined here.
- **`1.x/`** — Current version docs (v1.x). This is where most edits happen.
- **`0.x/`** — Legacy version docs (v0.x). Rarely modified.
- **`support/`** — Community and Lunar Alliance partner pages.
- **`logs/`** — Roadmap (`flight-plan.mdx`) and release announcements.

## Content Conventions

- All content files are **MDX** (Markdown + JSX components).
- Frontmatter fields: `title` (required), `sidebarTitle` (optional short name), `description` (optional).
- **Every new page must be added to `docs.json`** under the appropriate version/tab/group in the `navigation` section, or it won't appear in the sidebar.

### Mintlify Components Used

- `<Info>`, `<Warning>`, `<Tip>` — Callout boxes
- `<Card>` — Feature cards with `icon` and `href` props
- Standard fenced code blocks with language identifiers (php, bash, js)

## Versioned Documentation

Navigation in `docs.json` is organized under `navigation.versions`:
- **v1.x** has tabs: Getting Started, Reference, Admin Panel, Add-ons, Support, Mission Control
- **v0.x** has tabs: Getting Started, Reference, Admin Hub
