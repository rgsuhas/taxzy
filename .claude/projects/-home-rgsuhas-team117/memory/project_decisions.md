---
name: Key product decisions
description: Auth, storage, portal integration, and brand name decisions for Taxzy
type: project
---

Project renamed from TaxEase AI → **Taxzy**. All files updated.

Auth: username/password, JWT stored in localStorage (not HTTP-only cookie — can't use middleware for auth guard).

Storage: SQLite via SQLAlchemy (blobs for docs).

Portal integration: pre-fill from AIS JSON + ITR XML export via `/api/itr/generate-xml`.

AI: Gemini free tier (not Claude API).

Next.js version: 16.2.6 — uses `proxy.ts` instead of `middleware.ts` (renamed in v16). Accordion uses `@base-ui/react`, no `type`/`collapsible` props. TooltipTrigger has no `asChild` prop.

**Why:** Hackathon project, speed over architecture.

**How to apply:** When adding auth guards, do it client-side. When using shadcn components, check `components/ui/*.tsx` for actual API before writing.
