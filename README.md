# Modular Form Creator

Frontend for the Cloudfide recruitment task.

## Run

Full stack:

```bash
docker compose up -d --build
```

Frontend on `http://localhost:5173`, backend on `http://localhost:5001`
(Swagger at `/docs`).

Local vite with dockerized backend:

```bash
docker compose up -d backend mongo
cp .env.example .env
npm install
npm run dev
```

## What I added

On top of the scaffold:

- `@tanstack/react-query` for server state and cache invalidation
- `react-hook-form` + `zod` + `@hookform/resolvers` for forms and validation

## Notes

- The buffer for completed-resource edits is a Context provider in
  `ResourceLayout`, keyed by `resourceId`. Navigating to a different resource
  or refreshing drops it (no localStorage), per the spec.
- Module forms are split into a presentational `*Form.tsx` and a `*Page.tsx`
  that picks the submit behavior. Draft mode goes straight to PATCH, completed
  mode writes to the buffer and the user saves later via PUT from the overview.
- Validation in `src/domain/schemas.ts` mirrors the backend rules, so client
  errors match what the server would say.
- List filters live in the URL so refresh and the back button preserve them.

## What I left out

- Tests. The vitest + Storybook setup is there from the template;
  I prioritized covering the spec end-to-end.
- A global toast layer — errors are surfaced inline at the form or page
  that triggered them.
