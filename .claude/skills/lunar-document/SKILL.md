---
name: lunar-document
description: Draft documentation for a lunarphp/lunar pull request or release. Accepts a PR number/URL or release tag/URL, picks the correct docs version directory, follows project MDX conventions, updates docs.json navigation, and suggests flight-plan / release-log entries when warranted. Triggers on `/lunar-document <target>`, "document this PR", "document release <tag>", "draft docs for lunar <ref>".
---

# lunar-document

Draft documentation for a `lunarphp/lunar` pull request or release and wire it into this docs site.

## When to use

The user provides one of:

- A PR number: `2458`, `#2458`
- A PR URL: `https://github.com/lunarphp/lunar/pull/2458`
- A release tag: `1.5.0-beta.3`, `v1.5.0`
- A release URL: `https://github.com/lunarphp/lunar/releases/tag/1.5.0-beta.3`

Always assume the source repo is `lunarphp/lunar`.

## Detection

Classify the target by shape:

| Input shape | Type |
| --- | --- |
| `/pull/<n>` in URL, or bare `#?<digits>` | `pr` |
| `/releases/tag/<tag>` in URL, or version-style string (`vX.Y.Z`, `X.Y.Z`, `X.Y.Z-suffix`) | `release` |

If neither matches, ask the user to clarify.

## Version map

Pick the docs directory from the PR base branch or release tag:

| Source | Docs directory |
| --- | --- |
| PR `baseRefName` = `1.x`, or release tag starting `1.` / `v1.` | `1.x/` |
| PR `baseRefName` = `0.x`, or release tag starting `0.` / `v0.` | `0.x/` |
| Anything else | Stop, report the value, do not guess |

## Steps

### 1. Prep

- Run `gh auth status` and confirm authentication. Abort with a clear message if missing.
- Classify input as `pr` or `release`.

### 2a. PR path

Run:

```bash
gh pr view <num> --repo lunarphp/lunar \
  --json number,title,body,baseRefName,headRefName,url,files,labels,author,state,mergedAt
gh pr diff <num> --repo lunarphp/lunar
```

Validate `baseRefName` against the version map. Abort on unknown.

Treat the PR as a single change item and continue to **Per change item**.

### 2b. Release path

Run:

```bash
gh release view <tag> --repo lunarphp/lunar \
  --json tagName,name,body,publishedAt,url,isPrerelease,isDraft
```

- Abort if `isDraft: true`.
- Derive docs version from `tagName` prefix against the version map; abort on unknown.
- Parse the release body for PR references:
  - `#<digits>`
  - `https://github.com/lunarphp/lunar/pull/<digits>`
  - Auto-generated `... by @user in https://github.com/lunarphp/lunar/pull/<n>`
- Deduplicate the PR list.

For each PR (fetch in parallel where possible):

```bash
gh pr view <n> --repo lunarphp/lunar \
  --json number,title,body,baseRefName,labels,files,url
```

- Skip any PR whose `baseRefName` does not match the release version. Record the skip with a reason.
- For each remaining PR, run **Per change item** and group results by docs surface (one draft per surface, not per PR).

### 3. Per change item

1. Cross-reference `../lunar` for model/class definitions when the diff touches them. The monorepo at `../lunar` is the source of truth — see `CLAUDE.md`.

2. Classify the change to pick a docs tab:

   | Touches | Tab |
   | --- | --- |
   | Models, scopes, relationships, factories | `<ver>/reference/...` |
   | Admin panel features | `<ver>/admin/...` |
   | Add-on packages (anything under `packages/addons/*` in lunar) | `<ver>/addons/...` |
   | Storefront helpers (`packages/storefront-utils/*`) | `<ver>/storefront-utils/...` |
   | Guides / how-tos | `<ver>/guides/...` |
   | Setup / install / config | `<ver>/getting-started/...` |

   On ambiguity, ask the user with `AskUserQuestion`. For releases, batch ambiguous items into a single question, not one per file.

3. Draft MDX following `CLAUDE.md` conventions:
   - Frontmatter: `title` (required), `sidebarTitle` (optional), `description` (optional).
   - Third person, American English. No "we" / "our" / "us".
   - Em dashes sparingly — prefer commas, colons, parentheses.
   - Summary sentence under the H1.
   - Full namespaces for code, e.g. `Lunar\Models\Cart` or a `use` statement.
   - Eloquent models documented as tables:
     - **Fields**: Field, Type, Description. Schema order. Type uses Laravel column types (`longText`, `foreignId`, etc.). `nullable` shown inline at end (`` `foreignId` `nullable` ``). Standard timestamps included but undescribed. `id` described as "primary key". Obvious fields need no description.
     - **Relationships**: Relationship, Type, Related Model, Description.
     - **Scopes**: Scope, Description.
   - Mintlify components available: `<Info>`, `<Warning>`, `<Tip>`, `<Card>` (with `icon`, `href`).

4. Create-vs-edit:
   - If a page already documents the touched surface (search `<ver>/` for the model / feature name), edit it.
   - Otherwise create a new MDX file.

5. Update `docs.json`:
   - For each newly created page, insert its path into the correct `navigation.versions[].tabs[].groups[].pages` array.
   - Preserve the existing ordering style of the group (do not reorder unrelated entries).
   - No `docs.json` edit needed when only editing existing pages.

### 4. Release-only extras

- Suggest a release announcement page under `logs/` (follow existing `logs/*.mdx` shape). Present as a diff.
- Suggest `logs/flight-plan.mdx` updates when items are user-visible (new feature, breaking change, notable fix). Present as a diff. Do not silently rewrite the roadmap.

### 5. Report

End with a summary that lists:

- Target type (PR / release) and source URL(s).
- Version directory picked.
- Files created / edited.
- `docs.json` navigation entries added.
- Suggested flight-plan / release-log diffs (release mode).
- Skipped items with reasons.

## Conventions checklist

Quick lint before finishing:

- [ ] Third person, American English.
- [ ] Em dashes used sparingly.
- [ ] Summary sentence under H1.
- [ ] Frontmatter `title` present.
- [ ] Full namespaces for all `Lunar\...` references.
- [ ] Model tables in correct column order.
- [ ] `nullable` inline, schema order preserved.
- [ ] New pages added to `docs.json`.

See `/Users/glenn/GitHub/lunarphp/docs/CLAUDE.md` for the full convention list — do not duplicate it here.

## Navigation update rules

- Locate the version under `navigation.versions[]` by `version` field.
- Locate the tab under `tabs[]` by `tab` field.
- Locate the group under `groups[]` by `group` field, or create a new group if the tab is empty / has no matching group (rare — prefer existing groups).
- Append the new page path string to `pages[]`. Preserve neighbour ordering.

## Flight-plan / release-log rule

Never edit `logs/flight-plan.mdx` or create a `logs/` release page silently. Always surface the proposed change as a diff and let the user accept. Releases get a draft release-log page; notable user-facing items get a flight-plan suggestion.

## Stop conditions

Abort cleanly with a message when:

- Unknown PR base branch or release tag (does not match version map).
- `gh auth status` fails.
- Release is a draft (`isDraft: true`).
- Classification remains ambiguous after one user clarification question.
