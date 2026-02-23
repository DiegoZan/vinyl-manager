# agents.md

## Purpose

This repository contains a full-stack web application (React + Node/Express + SQLite) deployed behind Nginx.  
This `agents.md` file provides coding and collaboration guidelines for AI coding assistants (e.g., Codex) and humans contributing to the project.

The goals are:

- Keep the codebase consistent and maintainable.
- Prefer simple, readable solutions.
- Add tests when introducing logic.
- Keep documentation accurate and up to date.

---

## Language and Naming Conventions

### English-only code

- **All variable names, function names, class names, file names, and comments must be in English.**
- UI text can be localized later, but **code identifiers remain English**.

### Case conventions (React/JS/TS)

Follow standard JavaScript + React naming rules:

- **Variables & functions:** `camelCase`
  - `releaseId`, `fetchDiscogsRelease`, `formatTrackDuration`
- **Components:** `PascalCase`
  - `ReleaseCard`, `ReleaseDetailsPage`
- **Hooks:** `useSomething`
  - `useReleaseSearch`, `useDiscogsLookup`
- **Constants:** `UPPER_SNAKE_CASE` for true constants
  - `DEFAULT_PAGE_SIZE`, `API_TIMEOUT_MS`
- **Files & folders:**
  - React components: `PascalCase` folder when a component is the main export, or `kebab-case` for feature folders (choose one style per area and keep it consistent).
  - Prefer `kebab-case` for route/feature folders: `release-details/`, `discogs-lookup/`.
  - Prefer `PascalCase` for component files: `ReleaseCard.jsx`.

---

## Code Style and Quality

### Keep changes small and focused

- One PR/commit should ideally solve one problem.
- Avoid mixing refactors with feature work unless necessary.

### Prefer clarity over cleverness

- Use straightforward logic, explicit names, and small functions.
- Avoid overly abstract patterns until they provide real value.

### Validation and error handling

- Validate external inputs (request bodies, query params) on the backend.
- Fail fast with meaningful error messages.
- Never trust Discogs API responses blindly—handle missing fields.

### Accessibility (frontend)

- Prefer semantic HTML where possible.
- Ensure interactive elements are keyboard accessible.
- Provide accessible names for controls (`aria-label`, `aria-describedby`) where needed.

---

## Testing Requirements

### Unit tests are expected for logic

- **Whenever possible, functions must have unit tests**, especially for:
  - Data transformations/parsing/mapping
  - Search filtering logic
  - Sorting logic
  - Any non-trivial utility function
  - Backend service logic (Discogs mapping, DB query wrappers)

### When tests can be skipped

Tests may be skipped only if:

- The change is purely presentational UI (layout/styles only), or
- The logic is trivial and already covered by integration tests (if present).

If skipping tests for a logic change, add a short explanation in the PR/commit message.

### Testing principles

- Keep tests deterministic (no real network calls).
- Mock external services (Discogs).
- Use clear AAA structure: Arrange → Act → Assert.

---

## Authentication and Security

### Discogs API Authentication

The application will use the **Discogs API Key/Secret authentication method**.

- Authentication must be implemented using:
  - `key` and `secret`
  - Sent inside the `Authorization` header
- Authentication logic must be implemented **only in the backend**.
- The frontend must never communicate directly with Discogs.
- The Discogs key and secret must never be exposed to the client.

Example (conceptual):

```
Authorization: Discogs key=YOUR_KEY, secret=YOUR_SECRET
```

All Discogs requests must go through the backend service layer.

---

### Environment Variables

Any confidential information must be provided via environment variables.

This includes (but is not limited to):

- Discogs API key
- Discogs API secret
- Database credentials (if applicable)
- Any future authentication secrets
- JWT secrets (if introduced later)

Rules:

- Never hardcode secrets in source files.
- Never commit secrets to the repository.
- Use `.env` files only for local development.
- Ensure `.env` is included in `.gitignore`.
- Document required environment variables in `README.md`.

Example variable names:

- `DISCOGS_KEY`
- `DISCOGS_SECRET`
- `DATABASE_PATH`
- `PORT`

---

## Documentation Requirements

### Keep README.md up to date

**Whenever changes are introduced to:**

- project structure (folders, build output paths),
- the deployment approach,
- the technology stack (libraries, frameworks, runtime requirements),
- environment variables or configuration,
- authentication mechanisms,

…you must update **README.md** to reflect the change.

### What to document

At minimum, README updates should cover:

- New env vars and where they are used
- New setup steps
- New scripts (dev/build/test)
- Any changes in architecture or deployment

---

## Project Architecture Notes (high-level)

- **Frontend:** React (Vite). Served as static assets behind Nginx.
- **Backend:** Node.js + Express. Exposes REST endpoints under `/api`.
- **Database:** SQLite file (e.g., `vinyl.db`) on the VPS.
- **Reverse proxy:** Nginx routes `/` to frontend assets and `/api` to backend.
- **External API:** Discogs (via backend proxy only).

---

## Suggested Default Workflow for Changes

1. Understand the requirement and expected outcome.
2. Make a small, focused change.
3. Add/update unit tests when logic changes.
4. Run format/lint/tests locally.
5. Update README.md if structure/stack/deploy/auth steps changed.
6. Ensure naming conventions and English-only identifiers/comments are respected.

---

## AI Assistant Instructions (Codex)

When generating code:

- Use English for all identifiers and comments.
- Apply React naming conventions (camelCase/PascalCase).
- Prefer minimal, idiomatic React and Express patterns.
- Add unit tests for non-trivial logic whenever feasible.
- Use Discogs Key/Secret authentication via Authorization header.
- Never expose secrets to the frontend.
- Read secrets from environment variables only.
- If you change structure or the stack, update README.md accordingly.

When unsure:

- Prefer the simplest solution consistent with the existing patterns.
- Do not introduce new libraries unless clearly justified.
