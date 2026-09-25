<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Elmorf

UI and frontend work follows `docs/ELMORF_DESIGN_SYSTEM.md` and `docs/ELMORF_FRONTEND_SPEC.md`.

- shadcn base is Radix (`radix-nova`). Do not add Base UI.
- No hardcoded user-facing copy. Messages live in `@elmorf/i18n` and app message files.
- No raw brand colors in feature components. Use semantic tokens.
- Light, dark, and system themes are supported from Phase 1. Dark is the canonical visual reference.
- Server state belongs to TanStack Query. Do not put it in Zustand.
- Mock data goes through MSW and the API client. UI does not import fixtures.
- Morphology uses Sigma.js and Graphology. Do not render it with React Flow.
- URL filters use a typed Zod parser. Do not add a URL-state library unless the spec changes.
