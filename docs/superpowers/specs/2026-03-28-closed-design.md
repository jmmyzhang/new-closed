# Closed — Design Specification

**Date:** 2026-03-28
**Status:** Draft

---

## Overview

Closed is an Angular 21 SPA for clothing wardrobe management. Users catalog their clothing pieces with automatic in-browser background removal, presented in an Instagram-style grid per user. There is no custom backend — Supabase handles auth, database, and storage directly from the client.

**Key properties:**

- Frontend: Angular 21 SPA, deployed statically on Cloudflare Pages
- Backend: Supabase only (auth, database, storage)
- Core feature: In-browser background removal via `@huggingface/transformers` + RMBG-2.0, running in a dedicated Web Worker
- All state managed with Angular signals — no RxJS BehaviorSubject/Subject

---

## Visual Design

SSENSE-inspired aesthetic: white background, pure black, all-caps labels, minimal, industrial.

**Typography:** Helvetica Neue, 9–11px base size, `letter-spacing: 0.15em` on labels.

**Design tokens** (defined in `app.scss :root`):

```scss
:root {
  --color-bg: #ffffff;
  --color-fg: #000000;
  --color-mid: #888888;
  --color-subtle: #ebebeb;
  --sidebar-width: 160px;
  --font-sans: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-size-xs: 9px;
  --font-size-sm: 10px;
  --font-size-base: 11px;
  --letter-spacing-caps: 0.15em;
}
```

- `text-transform: uppercase` applied at the component level, not globally
- Item cards use a 3:4 aspect ratio
- Hover state: bottom-up black gradient overlay — `transparent` to `rgba(0, 0, 0, 0.75)` — revealing brand + item name

---

## App Shell Layout

A persistent two-panel shell:

- **Left sidebar** (`SidebarComponent`, fixed, `--sidebar-width: 160px`): "CLOSED" wordmark logo linking to `/`, navigation tabs pinned at the bottom
- **Right panel** (`<router-outlet>`, scrollable): route content swaps here

---

## Routes

| Route | Component | Auth Required |
|-------|-----------|---------------|
| `/` | HomeComponent | No (empty for now) |
| `/search` | SearchComponent | No |
| `/new` | NewComponent | Yes |
| `/profile` | ProfileComponent (own profile) | Yes |
| `/about` | AboutComponent | No |
| `/u/:username` | PublicProfileComponent | No |
| `/u/:username/item/:id` | ItemDetailComponent | No |
| `/login` | LoginComponent | No |
| `/signup` | SignupComponent | No |

All routes use `loadComponent` for lazy loading and code splitting.

---

## Profile Page

Both the authenticated `/profile` route and the public `/u/:username` route render the same profile structure.

**Header:**
- Avatar image, 96px diameter
- `@username` display
- Bio text
- Piece count (total number of clothing items)

**Sub-navigation:**
- Closet (active)
- Outfits (WIP — disabled)
- Collections (WIP — disabled)

**Closet tab:**
- 4-column grid of item cards
- Category filter bar: All / Tops / Bottoms / Outerwear / Footwear / Accessories
- Filtering is signal-based via a `filteredItems` computed signal in `ClothingItemService`

**Item cards:**
- 3:4 aspect ratio
- On hover: bottom-up gradient overlay (`transparent` → `rgba(0,0,0,0.75)`) with brand and name displayed over it

---

## Item Detail Page (`/u/:username/item/:id`)

- Displays the background-removed PNG on a white background
- Fields shown: brand, season (optional), name, category, description, size
- "← Return to @username's profile" back link
- Prev / Next navigation through items in that user's closet (ordered by `created_at`)

---

## Background Removal Pipeline

**Worker:** `features/upload/bg-removal.worker.ts` — dedicated Web Worker using `AutoModel` + `AutoProcessor` from `@huggingface/transformers` with the `briaai/RMBG-2.0` model.

**Boot-time pre-warm:** The worker is initialized via `APP_INITIALIZER` in `app.config.ts` so the model is ready before the user reaches `/new`.

**Processing flow:**
1. User selects a file on `/new`
2. Background removal starts immediately in the worker (parallel with metadata entry)
3. Signal-based progress: `modelReady`, `stage`, `progress`, `processedBlob` exposed from `UploadService`
4. On form submit: processed blob is uploaded to Supabase Storage, item record is saved

**WASM threading:** ONNX WASM files are copied to `public/` via `angular.json` assets. `env.backends.onnx.wasm.wasmPaths = '/'` is set at startup. COOP/COEP headers in `public/_headers` enable `SharedArrayBuffer`, enabling threaded WASM (2–3x faster).

---

## Database Schema (Supabase)

### `profiles`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, references `auth.users` |
| `username` | text | Unique |
| `display_name` | text | |
| `bio` | text | Nullable |
| `avatar_url` | text | Nullable |
| `created_at` | timestamptz | Default `now()` |

### `clothing_items`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `profiles.id` |
| `name` | text | |
| `brand` | text | Nullable |
| `season` | text | Nullable (Spring/Summer/Fall/Winter) |
| `category` | text | Tops/Bottoms/Outerwear/Footwear/Accessories |
| `description` | text | Nullable |
| `size` | text | Nullable |
| `processed_url` | text | Public URL of background-removed PNG |
| `original_url` | text | Nullable — URL of original upload |
| `created_at` | timestamptz | Default `now()` |

Row-level security is enforced: users can only insert/update/delete their own rows. Public reads are allowed.

---

## Supabase Storage

**Bucket:** `clothing-items` (public reads, RLS-enforced authenticated writes)

**Path convention:**
```
clothing-items/
  {user_id}/
    processed/{item_id}.png    — background-removed PNG
    originals/{item_id}.jpg    — original upload (optional)
```

---

## Hosting: Cloudflare Pages

Deployed as a static SPA on Cloudflare Pages.

- `public/_redirects`: SPA fallback — all routes serve `index.html`
- `public/_headers`: COOP/COEP headers enabling `SharedArrayBuffer` (required for threaded WASM)

Build output directory: `dist/new-closed/browser`

---

## Environment Config

Build-time via Angular's file replacement:
- `src/environments/environment.ts` — development
- `src/environments/environment.prod.ts` — production

Both export `supabaseUrl` and `supabaseAnonKey`. The anon key is intentionally public — Supabase RLS enforces all access control.

---

## Angular Patterns

- **Standalone components:** All components use `imports` array; no NgModules
- **Signal-based state:** `signal()`, `computed()`, `asReadonly()` throughout — no RxJS Subject/BehaviorSubject
- **Root-scoped services:** All services use `@Injectable({ providedIn: 'root' })`
- **Route params as inputs:** `withComponentInputBinding()` enabled — route params bind as `@Input()` on components
- **Lazy loading:** All routes use `loadComponent`

---

## Core Services (`src/app/core/`)

| File | Purpose |
|------|---------|
| `core/services/supabase.service.ts` | Wraps Supabase client; exposes `readonly client` typed with generated `Database` interface |
| `core/services/auth.service.ts` | Signal-based auth state (`session`, `user`, `isLoggedIn`, `sessionReady`); provides `signUp`/`signIn`/`signOut` |
| `core/services/profile.service.ts` | Loads and caches profiles by username or ID |
| `core/services/clothing-item.service.ts` | Loads clothing items for a user; `filteredItems` computed signal |
| `core/guards/auth.guard.ts` | Async `CanActivateFn` — waits for `sessionReady` before evaluating `isLoggedIn`; redirects to `/login` |
| `core/database.types.ts` | Supabase-generated TypeScript types for all DB tables |

## Feature Services

| File | Purpose |
|------|---------|
| `features/upload/upload.service.ts` | Owns the Web Worker; exposes `modelReady`, `stage`, `progress`, `processedBlob` signals; `uploadAndSave()` |
| `features/search/search.service.ts` | Username search via Supabase `ilike` query |
