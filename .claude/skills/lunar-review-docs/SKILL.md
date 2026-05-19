---
name: lunar-review-docs
description: Review the current lunarphp/docs branch against project conventions. Diffs the working branch against its base, then reports style, structure, navigation, and accuracy issues locally — no GitHub comments are posted. Triggers on `/lunar-review-docs`, "review my docs changes", "review the docs branch".
---

# lunar-review-docs

Review the current `lunarphp/docs` branch and produce a local convention report. Read-only: no GitHub comments, no file edits.

This is the counterpart to `lunar-document`. Where `lunar-document` *drafts* docs from a `lunarphp/lunar` PR or release, this skill *reviews* the in-progress changes on the current docs branch against the conventions defined in `CLAUDE.md`.

## When to use

Invoked with no argument. The skill operates on whatever is currently checked out in the working directory.

If the user passes a PR number or URL, respond with a one-line note that this skill only reviews the local branch, and suggest they push and review locally on that branch instead.

## Steps

### 1. Prep

- Confirm the working directory is the `lunarphp/docs` repo (`git remote get-url origin` contains `lunarphp/docs`). Abort with a clear message otherwise.
- Identify the base branch — prefer `next` if it exists on the remote, else `main`.
- If the current branch *is* the base branch and the working tree is clean, emit a short note and stop.

### 2. Build the change set

```bash
BASE=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo origin/next)
MERGE_BASE=$(git merge-base HEAD "$BASE")
git diff --name-status "$MERGE_BASE"...HEAD
git diff "$MERGE_BASE"...HEAD
```

Also include uncommitted work — run `git status --porcelain` and `git diff HEAD` so in-progress edits are reviewed too.

Partition the touched files into:

- MDX content under `1.x/`, `0.x/`, `support/`, `logs/`
- `docs.json`
- Other (images, redirects, config) — list but do not lint

If neither MDX nor `docs.json` changed, emit a short note and stop.

### 3. Determine docs version

Infer from the touched paths (`1.x/...` vs `0.x/...`). Mixed-version changes are flagged as a finding, not an abort.

### 4. Check passes

Run all four passes against each touched MDX file. Collect findings; do not stop early.

#### a. Style, voice & frontmatter

- Frontmatter parses cleanly; `title` present.
- Third person — flag occurrences of `\b(we|our|us)\b` outside fenced code blocks.
- American English — flag British spellings: `colour`, `behaviour`, `organisation`, `centre`, `licence`, `analyse`, `optimise`, `customise`, `recognise`.
- Em-dash density — flag files with more than 2 em dashes per 1000 characters as "review for overuse" per `CLAUDE.md` ("Use em dashes sparingly").
- Summary sentence — verify a non-empty paragraph sits between the H1 and the next block.

#### b. Structural conventions

- Code fences referencing `Lunar\` use the full namespace inline or a visible `use` statement in the same fence.
- Eloquent model field tables have columns: **Field, Type, Description** (in that order).
- Relationship tables have columns: **Relationship, Type, Related Model, Description**.
- Scope tables have columns: **Scope, Description**.
- `nullable` appears inline at the end of the Type cell, formatted as code (e.g. `` `foreignId` `nullable` ``).
- `id` row is described as "primary key".
- Standard timestamps (`created_at`, `updated_at`, `deleted_at`) are present in field tables but need no description.

#### c. Navigation wiring (`docs.json`)

For each touched file with status:

- `A` (added): verify the path appears exactly once under `navigation.versions[].tabs[].groups[].pages`.
- `D` (deleted): verify the path has been removed from `docs.json`.
- `R` (renamed): verify the old path is gone and the new path is present.

If new MDX files were added but `docs.json` is unchanged in the diff, flag as a **blocker**.

See `lunar-document/SKILL.md` → "Navigation update rules" for the traversal pattern.

#### d. Accuracy vs `../lunar`

Run only when the change set touches `<ver>/reference/...` or any MDX references `Lunar\Models\...`.

- Resolve each referenced class by searching `../lunar/packages/` for the matching path.
- If `../lunar` is missing, skip this pass with a note. Do not fail.
- For documented fields, compare against the latest migration plus `$fillable` / `$casts` and report:
  - Missing fields.
  - Wrong column types.
  - Order drift relative to the migration.
  - `nullable` mismatches.
- For documented relationships and scopes, confirm each named method exists on the model class.

`../lunar` is the source of truth per `CLAUDE.md`.

### 5. Report

Print a single grouped Markdown report to the chat. No `gh pr review`, no `gh pr comment`, no file edits.

Order:

1. **Blockers** — missing `docs.json` entries for new pages, missing `title` frontmatter, broken MDX frontmatter.
2. **Conventions** — voice, spelling, summary sentence, em-dash overuse.
3. **Structure** — namespaces, table columns, schema order, nullable formatting.
4. **Navigation** — non-blocker `docs.json` drift, deletion mismatches.
5. **Accuracy** — `../lunar` mismatches.
6. **Info** — version, current branch, base branch, files reviewed, files skipped, whether uncommitted changes were included.

Each finding includes: file path, line number where derivable, one-sentence explanation, suggested fix.

End with the conventions checklist from `lunar-document/SKILL.md` so the user can scan-confirm.

## Stop conditions

Abort cleanly with a message when:

- The current directory is not the `lunarphp/docs` repo.
- The current branch is the base branch with a clean working tree.
- The change set has no MDX or `docs.json` changes.

## Out of scope

- Reviewing remote PRs — push the branch and run the skill on the local checkout instead.
- Posting GitHub review comments (read-only by design).
- Editing files in the change set.
- Running `mint dev` or full MDX compilation.
- Reviewing `0.x/` content beyond the same checks — legacy docs are reported but not deeply cross-referenced against `../lunar`.

See `/Users/glenn/GitHub/lunarphp/docs/CLAUDE.md` for the authoritative convention list. Do not duplicate it here.
