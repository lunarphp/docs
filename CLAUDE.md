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

## Source Code

The monorepo for the Lunar project can be found at `../lunar`. We should use this codebase as a reference when creating documentation and we should always test example code to ensure it is accurate and correct.

Lunar is heavily based around Eloquent models. When documenting these, we should ensure we have all the relationships, scopes and methods covered.

Always include the full namespace for code references, either by showing a "use" statement, or writing out the full namespace. E.g. 

```php
Lunar\Models\Cart
```

or

```php
use Lunar\Models\Cart;

$unmergedCarts = Cart::unmerged()->get();
```


## Writing

Write all documentation in third person. Never use "we", "our", or "us" — always refer to Lunar, the package, or the feature directly.

Write using American English.

Ensure the language can be understood by a global audience, avoid using British or American sayings that may not be understood by others. Some readers may not have English as their first language.

Use em dashes sparingly. Prefer commas, colons, or parentheses where appropriate instead.

After the main page heading, always include a sentence summarising the topic.

## Eloquent model fields

Show them as a table with the columns: Field, Type, Description.

When describing the fields of an Eloquent model, follow these rules: 

- `id` should be described as "primary key"
- Show if a field is nullable (we don't need to show not-nullable)
  - Show nullable formatted as inline code in the Type column, always at the end, e.g. "`foreignId` `nullable`"
- We don't need a description for standard Laravel timestamps (created_at, updated_at, deleted_at), but they should still be included
- Fields that are obvious need not be described, e.g. first_name
- Show the Laravel column type, e.g. `longText`
- Ensure the order of the fields is the same as the database schema

### Relationships

Show them as a table with the columns: Relationship, Type, Related Model, Description.

### Scopes

Show them as a table with the columns: Scope, Description.
