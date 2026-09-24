# W2W Desktop + Mobile — Multi-Variant Packaging

Big scope, so doing it in phases. Each phase is independently shippable.

## Phase 1 — Electron foundation (desktop shell)

- Add `electron`, `@electron/packager` as devDeps
- Create `electron/main.cjs` (BrowserWindow, `contextIsolation: true`, loads built `dist/index.html`)
- Create `electron/preload.cjs` exposing a tiny safe API: `variant`, `appVersion`, `platform`
- Set `base: './'` in `vite.config.ts` so file:// URLs resolve
- Add `"main": "electron/main.cjs"` to `package.json`
- Dev script that points Electron at the Lovable preview URL (hot reload)

## Phase 2 — Variant system (Hybrid gating)

Build-time variant flag + runtime login verification.

- `VITE_W2W_VARIANT` env var: `individual` | `student` | `company` | `school` | `full`
- `src/lib/variant.ts` — reads flag, exposes `getVariant()`, `getAllowedFeatures()`, `assertVariantMatchesAccount(accountType)`
- Feature map per variant:
  - **individual** → Scanner, MyLog, Marketplace (browse + list)
  - **student** → Scanner, MyLog, Marketplace, CarbonWallet, Friends, school join flow
  - **company** → Scanner, MyLog, OrgDashboard (company view), ExportReport
  - **school** → Scanner, MyLog, OrgDashboard (school view), Leaderboard, StudentManagement, invite codes
- Route guard: wrap `App.tsx` routes — if route's required feature not in variant → redirect to `/` with toast
- After login: compare `profile.account_type` vs variant. Mismatch → show modal "This installer is for X. Please download the Y edition." + sign-out button. Allowed crossovers: `full` accepts all; `student` accepts `student` only; etc.
- Nav menu auto-hides items not in variant
- Small "Edition: Student" badge in app footer

## Phase 3 — Offline + sync layer

- Add Dexie (IndexedDB wrapper) — lighter than full Supabase offline
- `src/lib/offline/db.ts` — tables: `pendingScans`, `cachedScans`, `cachedProfile`, `cachedOrgStats`
- `src/lib/offline/sync.ts`:
  - `queueScan(scan)` — write to `pendingScans` when offline
  - `flushQueue()` — runs on `window.online` event, on app boot, and every 60s when online; pushes to Supabase, removes from queue on success
  - `cacheRead(key, fetcher)` — read-through cache for read queries (TTL 5 min); falls back to last cached value when offline
- Wire into `scanApi.ts` — if `navigator.onLine === false`, run a deterministic local fallback (use existing `mockResults` + `co2Formula`) and queue
- Online/offline indicator pill in top bar
- "X scans pending sync" badge when queue non-empty

## Phase 4 — Build & packaging

One build script per variant × per platform.

- `scripts/build-variant.mjs <variant> <platform>`:
  1. `VITE_W2W_VARIANT=<variant> vite build`
  2. `@electron/packager . "W2W-<Variant>" --platform=<plat> --arch=x64 --out=releases/<variant>/<plat>`
  3. Archive: Linux → `.tar.gz`, macOS → `.zip` (sandbox can't make `.dmg`), Windows → `.zip` (sandbox can't make signed `.exe` installer; the unpacked folder contains a runnable `.exe`)
- `scripts/build-all.mjs` loops variants × platforms, writes archives to `/mnt/documents/releases/`
- README section listing every output file + which user downloads which

**Sandbox limits to be upfront about:**
- True `.dmg` needs macOS `hdiutil` — not available. Output is `W2W-Student-darwin-x64.zip`; user drags `.app` to Applications.
- Signed `.exe` installer (NSIS) needs `electron-builder` + Wine, which breaks in this sandbox. Output is `W2W-Student-win32-x64.zip` containing `W2W-Student.exe`.
- `.AppImage` similarly needs `electron-builder`. Linux output is `.tar.gz`; user extracts and runs the binary.
- Real signed installers (notarized `.dmg`, signed `.exe`, AppImage) you'd run locally on your machine using the same scripts with `electron-builder` swapped in.

## Phase 5 — Android `.apk` via Capacitor

Electron does **not** build `.apk` — Android is a separate Capacitor flow.

- Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`
- `npx cap init` with `appId: app.lovable.c15dcf09674040bab4f41541d4830ea5`, `appName: "W2W"`
- `capacitor.config.ts` reads the same `VITE_W2W_VARIANT` to set per-variant `appId` suffix (`...student`, `...company`, etc.) so 4 APKs can coexist on one phone
- Variant logic + offline layer (phases 2–3) work unchanged in the Capacitor WebView
- Actual `.apk` build must run on **your machine** (needs Android Studio + JDK 17). This sandbox cannot produce `.apk`. I'll give you the exact commands: `npx cap add android` → `npm run build` → `npx cap sync` → `npx cap open android` → Build > Build APK.

## Phase 6 — Auto-update + telemetry (optional, ask later)

Out of scope unless you want it: `electron-updater`, crash reporting, version pinning per variant.

---

## Technical details

- `electron/main.cjs` reads variant from `process.env.W2W_VARIANT` baked at package time (via `--app-copyright`/`--build-version` or a generated `electron/variant.json`)
- Preload exposes `window.w2w.variant` so React reads the same value Electron was built with — prevents mismatch
- CSP: `default-src 'self' https://*.supabase.co https://ai.gateway.lovable.dev https://*.tile.openstreetmap.org`
- Dexie schema versioned from v1; migrations added in `db.ts` only
- Sync conflict policy: server wins on read, client queue is append-only for scans (no edits offline)
- All Supabase calls already go through `@/integrations/supabase/client` — no changes needed there
- Variant guard runs in `App.tsx` via a `<VariantGate>` wrapper around `<AuthProvider>` children

## Deliverables you'll get

- 12 desktop archives in `/mnt/documents/releases/` (4 variants × 3 platforms)
- A landing/download page snippet pointing each account type at its installer
- Capacitor project ready to clone + build `.apk` locally
- Sync-status UI + offline indicator inside the app

---

## What I need from you before I start

1. **Phase order** — ship Phase 1+2 first (desktop shell + variants, ~1 round), then 3 (offline), then 4 (build all), then 5 (android)? Or you want everything attempted in one go?
2. **`full` edition** — should I also build a "W2W-Full" variant for internal/admin use, or strictly the 4?
3. **Download page** — add a `/download` route inside the web app that detects OS + account type and recommends the right installer? (Recommended.)
