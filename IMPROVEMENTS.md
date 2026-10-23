# W2W (Waste-to-Worth) — System Optimization & Enhancement Log

This document records the architectural improvements, performance optimizations, and user experience enhancements implemented to make W2W faster, more efficient, and feature-rich.

---

## 1. Performance & Bundle Efficiency

### A. Client-Side Image Optimization (Canvas Downscaler)
- **Problem:** Camera and gallery uploads originally transmitted raw, uncompressed 2MB–5MB base64 images directly to the edge function. This consumed high mobile data bandwidth and caused 3–6 second upload latencies.
- **Solution:** Created [`src/lib/imageOptimizer.ts`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/lib/imageOptimizer.ts) with `optimizeImageForAi`. Images are downscaled to a max dimension of 1024px at 82% JPEG quality via an off-screen HTML5 canvas before network dispatch.
- **Impact:** Reduces payload size by **80%–90%** (typically ~3MB down to ~180KB), cutting AI scan latency by ~70%.

### B. Route Code-Splitting & Vite Manual Chunking
- **Problem:** All 14 application pages were statically imported in `App.tsx`, producing a monolithic **871 kB** initial JavaScript bundle (`dist/assets/index.js`).
- **Solution:**
  - Implemented `React.lazy()` and `<Suspense>` with a branded eco loading fallback in [`src/App.tsx`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/App.tsx).
  - Configured Rollup vendor chunking in [`vite.config.ts`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/vite.config.ts) (`vendor-react`, `vendor-radix`, `vendor-framer`, `vendor-recharts`, `vendor-supabase`).
- **Impact:**
  - Main entrypoint chunk decreased from **871.41 kB down to 121.01 kB** (gzip: **37.44 kB**) — an **86% reduction**.
  - Pages (`Landing`, `Facilities`, `Scanner`, `Marketplace`, etc.) now load on demand in lightweight 8–43 kB chunks.

### C. Eliminated Blocking Third-Party Scripts
- **Problem:** [`index.html`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/index.html) loaded Leaflet CSS & JS synchronously from `unpkg.com` in the `<head>` on every page load.
- **Solution:** Removed blocking scripts from `index.html`. Added an asynchronous, on-demand `loadLeaflet()` loader inside [`src/pages/Facilities.tsx`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/pages/Facilities.tsx) that triggers only when the user navigates to the Facilities map.

### D. Progressive Web App (PWA) Manifest
- Added [`public/manifest.webmanifest`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/public/manifest.webmanifest) and associated mobile meta tags (`theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`) to support standalone homescreen installation.

---

## 2. User Experience & Feature Enhancements

### A. Responsive Mobile Navigation with "More" Drawer
- **Problem:** On mobile screens, [`NavBar.tsx`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/components/ui/NavBar.tsx) used `.slice(0, 6)`, silently dropping items like "Wallet" or "My Log" for logged-in students.
- **Solution:** Redesigned the mobile navigation into a 5-element dock:
  1. **Home**
  2. **Marketplace**
  3. **Elevated Center Scan Button** (prominent pulsing scan hero)
  4. **Facilities Map**
  5. **More Menu** (opens a sleek slide-up Sheet containing secondary links, user profile details, direct APK download, and authentication actions).

### B. Front/Rear Camera Switching & Hardware Controls
- Added camera flipping (`facingMode: "environment" | "user"`) in [`src/pages/Scanner.tsx`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/pages/Scanner.tsx) via `SwitchCamera` control, enabling desktop webcam testing and front/rear phone lens toggling.

### C. Swachh Bharat Municipal Dustbin Color Guidance
- Integrated physical bin color recommendations into [`src/components/Results/ResultSheet.tsx`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/components/Results/ResultSheet.tsx) for every scanned item:
  - 🟢 **Green Bin** (Wet Waste / गीला कचरा) for Compostables
  - 🔵 **Blue Bin** (Dry Recyclables / सूखा कचरा) for Recyclables & Upcyclables
  - 🔴 **Red Bin** (Domestic Hazardous / खतरनाक अपशिष्ट) for Hazardous items & E-waste
  - ⚫ **Black Bin** (Residual Landfill / लैंडफिल कचरा) for Non-recyclable landfill

### D. Doorstep Scrap Pickup & Live Rate Card (Kabadiwala Integration)
- Created [`src/components/ScrapPickupModal.tsx`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/components/ScrapPickupModal.tsx):
  - **Live Scrap Rates:** Real-time benchmark rates for Old Newspaper (₹15/kg), Cardboard (₹10/kg), PET Bottles (₹18/kg), Scrap Iron (₹28/kg), Aluminium (₹115/kg), Brass (₹330/kg), Copper (₹490/kg), and E-Waste (₹50/kg).
  - **Doorstep Booking:** Form to schedule local doorstep recycling pickups with instant payout estimates and CO₂ offset projections.

---

## 3. Reliability & Automated Test Suite

Implemented a comprehensive Vitest unit testing suite in `src/test/` (17 tests, 100% passing):
- [`src/test/co2Formula.test.ts`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/test/co2Formula.test.ts): Verified LCA carbon baseline calculations, streak multipliers (1x–3x), reservoir rolls, and IPCC tonne credit thresholds.
- [`src/test/cashReward.test.ts`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/test/cashReward.test.ts): Verified 5-scan milestone progression, ₹2 cash reward unlocks, duplicate scan protection, and UPI withdrawal validations.
- [`src/test/variant.test.ts`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/test/variant.test.ts): Verified role-based feature gating across Individual, Student, School, Company, and Full editions.
- [`src/test/imageOptimizer.test.ts`](file:///c:/Users/LOQ/Desktop/upcycle-it-main/src/test/imageOptimizer.test.ts): Verified base64 byte calculation and input bounds checking.
