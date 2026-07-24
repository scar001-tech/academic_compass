---
name: Academic Compass Architecture
description: Key decisions and quirks for the Academic Compass school management app
---

## Stack
- **Frontend**: React 18 + TypeScript + Vite + react-router-dom (NOT wouter) + TanStack Query + shadcn/ui + Recharts + Sonner
- **Backend**: Express (artifacts/api-server) + Drizzle + PostgreSQL via @workspace/db
- **Auth**: JWT (jsonwebtoken) + bcryptjs. Token key: `ac_token` in localStorage. SECRET from `SESSION_SECRET` env var.
- **Data**: localStorage via AppState (key: `scholaris_v1`). Synced to backend when online.

## Routing
- Frontend artifact preview path: `/` (root). BrowserRouter without basename.
- API server at `/api`. All frontend fetch calls use `const BASE = "/api"`. Replit proxy routes `/api/*` → api-server.
- Never hardcode localhost in frontend code — Replit proxy handles routing.

## Three bugs fixed
1. **Online indicator**: `school.tsx` uses `window.addEventListener("online"/"offline")` + `navigator.onLine`. The `setOnline()` no-op is kept for API compat but `AppShell.tsx` shows read-only Wifi/WifiOff icon (no Switch toggle).
2. **Pending marks count**: Dashboard counts only `e.pending === true` — not `score == null`.
3. **Pending marks navigation**: Dashboard "Open" button links to `/entry?sheet=<sheetId>` (sheet with most pending entries), not just `/entry`.

## DB schema
Tables prefixed with `ac_` in `lib/db/src/schema/academic-compass.ts`:
- `ac_profiles`, `ac_user_roles`, `ac_mark_entries`, `ac_timetable_slots`, `ac_sync_conflicts`
- Schema exported via `lib/db/src/schema/index.ts`

**Why:** First user to sign up auto-becomes principal (admin + principal roles) and is auto-approved.

## Tailwind v4 theme
The CSS uses `@theme inline` with `hsl(var(--name))` mappings. Custom semantic tokens (success, warning, info, *-soft variants) are added to `@theme inline` as `--color-<name>` so Tailwind generates `bg-success`, `text-warning-foreground`, etc. Light/dark CSS vars in `:root` / `.dark`.
