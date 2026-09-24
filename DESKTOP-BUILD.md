# W2W Desktop (Electron) — Build Guide

W2W ships as 4 separate desktop editions, each tailored to one login type:

| Edition       | For account type | Features                                                       |
| ------------- | ---------------- | -------------------------------------------------------------- |
| Individual    | `individual`     | Scanner, Log, Marketplace, Facilities                          |
| Student       | `student`        | Scanner, Log, Marketplace, Facilities, Wallet, Friends         |
| Company       | `company`        | Scanner, Log, Facilities, Org Dashboard, Reports               |
| School        | `school`         | Scanner, Log, Facilities, Org Dashboard, Leaderboard, Friends  |

Variant gating is **hybrid**:
- Build-time: each installer has features baked in (smaller, secure).
- Runtime: after login, `account_type` is compared with the installer's variant. Mismatch → modal asks user to download the correct edition.

A web "Full" variant (`VITE_W2W_VARIANT=full` or unset) is used by the Lovable preview and dev mode — shows every feature.

## Quick start (local machine, not sandbox)

```bash
# 1. Install Electron deps (only first time, ~150MB)
npm install --save-dev electron @electron/packager

# 2. Build one combination
node scripts/build-variant.mjs student linux
node scripts/build-variant.mjs student darwin
node scripts/build-variant.mjs student win32

# 3. Or build everything (4 variants × 3 platforms = 12 archives)
node scripts/build-all.mjs
```

Output archives land in `/mnt/documents/releases/` (or `./releases/` on local).

## Dev mode (hot reload against Lovable preview)

```bash
W2W_VARIANT=student W2W_DEV_URL=https://id-preview--c15dcf09-6740-40ba-b4f4-1541d4830ea5.lovable.app npx electron electron/main.cjs
```

## Output formats

| Platform | Format                          | Why                                       |
| -------- | ------------------------------- | ----------------------------------------- |
| Linux    | `.tar.gz` (contains executable) | `.AppImage` needs `electron-builder`      |
| macOS    | `.zip` (contains `.app`)        | `.dmg` needs macOS-only `hdiutil`         |
| Windows  | `.zip` (contains `.exe`)        | Signed `.exe` installer needs NSIS + Wine |

To produce signed installers (`.dmg`, NSIS `.exe`, `.AppImage`) on your own machine, swap `@electron/packager` for `electron-builder`.

## Android (.apk) — separate flow

Electron does not build `.apk`. Use Capacitor on your local machine (sandbox cannot build APKs):

```bash
npm install --save @capacitor/core @capacitor/android
npm install --save-dev @capacitor/cli
npx cap init "W2W" app.lovable.c15dcf09674040bab4f41541d4830ea5
npx cap add android
VITE_W2W_VARIANT=student npm run build
npx cap sync
npx cap open android   # Android Studio → Build → Build APK
```

Repeat with each variant to get 4 APKs. Each gets a unique `appId` suffix so they coexist on one phone.

## Sandbox limits

- `.dmg`, signed `.exe`, `.AppImage`, and `.apk` cannot be produced in the Lovable sandbox.
- The build scripts here run unchanged on your local Linux/macOS/Windows machine.
