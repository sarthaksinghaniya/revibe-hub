# W2W — Waste-to-Worth

> AI-powered waste identification and disposal guide that turns garbage into value.



---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Edge Functions](#edge-functions)
7. [Authentication & Roles](#authentication--roles)
8. [Carbon Credit Algorithm](#carbon-credit-algorithm)
9. [Gamification System](#gamification-system)
10. [Getting Started](#getting-started)
11. [Environment Variables](#environment-variables)
12. [Pages & Routes](#pages--routes)

---

## Overview

W2W (Waste-to-Worth) is a mobile-first Progressive Web App that uses Google Gemini AI to identify waste items from camera photos. It classifies waste into 5 categories — **Recyclable**, **Compostable**, **Hazardous**, **Landfill**, and **Upcyclable** — and provides step-by-step disposal instructions, upcycling ideas, and nearby recycling facility locations.

The platform includes gamification (XP, streaks, carbon credits), a peer-to-peer upcycled marketplace, friend system with Snapchat-style scan streaks, and a school/organization dashboard for tracking student eco-activity.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript 5, Vite 5 |
| **Styling** | Tailwind CSS v3, shadcn/ui, Framer Motion |
| **Backend** | Lovable Cloud (Supabase) — Auth, Database (PostgreSQL), Edge Functions, Realtime |
| **AI** | Google Gemini 2.5 Flash via Lovable AI Gateway |
| **Maps** | OpenStreetMap (via iframe) |
| **State** | React Query (TanStack Query v5) |
| **Forms** | React Hook Form + Zod validation |

---

## Features

### 🔬 AI Waste Scanner
- Point camera at any waste item → instant AI identification
- Uses Google Gemini 2.5 Flash multimodal vision
- Returns: item name, confidence %, category, material, disposal steps, upcycle ideas, environmental impact (CO₂ & water saved)
- Also supports photo upload from gallery
- Results shown in a bottom sheet with category badge, waste score, and YouTube video suggestions

### 🗺️ Facilities Finder
- Interactive map showing nearby recycling centers, composting sites, and hazardous waste drop-offs
- OpenStreetMap integration with location-based search
- Category-filtered pins

### 🛒 Upcycle Marketplace
- List upcycled items for sale or free pickup
- Full CRUD: create, edit, delete listings
- AI-powered title suggestions (Gemini 3 Flash)
- Category filtering, search, save/bookmark listings
- Seller contact via email or WhatsApp
- Integrated Decay Timeline for waste type on listing detail pages
- Landfill diversion banner with active listing count

### 👥 Friends & Scan Streaks
- Add friends via unique 8-character friend codes
- Share scans with friends (with optional message)
- Snapchat-style streak system: both friends must share scans within 24 hours to maintain streak
- Streak counter with fire 🔥 emoji and streak badges
- Incoming scan feed with unseen indicators
- Friend request accept/decline flow

### 🏫 School / Organization Dashboard
- Schools sign up → get unique invite code
- Students enter school code at registration → auto-linked to organization
- Real-time leaderboard: ranked by XP, credits, and scan count
- Aggregate stats: total students, total scans, CO₂ saved
- Admin tools: copy invite code, remove students, search members
- Exportable CSV reports (student rankings, scan counts, CO₂ data)
- Scans auto-tagged to student's organization via database trigger

### 💰 Carbon Credit Wallet
- Track total carbon credits earned from scans
- Daily streak multiplier (1x → 1.5x → 2x → 3x at 7 days)
- Weekly activity graph
- XP-based leveling system (6 levels from "Waste Rookie" to "Zero Waste Hero")
- Milestone badges

### ⏳ Decay Timeline
- Visual timeline showing how long common materials take to decompose
- Reusable component shown on landing page and marketplace listings

### 🌿 Eco Fingerprint
- Animated radar chart visualization of user's waste profile
- Shows distribution across 5 waste categories

### 📹 YouTube Video Suggestions
- After each scan, shows 2-3 contextual YouTube videos
- Mapped to waste categories (recycling DIYs, composting guides, upcycling tutorials)
- Mock data with real YouTube video IDs

---

## Project Structure

```
src/
├── assets/                  # Static images
├── components/
│   ├── DecayTimeline.tsx     # Material decomposition timeline
│   ├── EcoFingerprint.tsx    # Radar chart waste profile
│   ├── FloatingWaste.tsx     # Animated floating waste icons
│   ├── NavLink.tsx           # Navigation link component
│   ├── OrgDashboard/         # School dashboard sub-components
│   │   ├── ExportReport.tsx  # CSV export for school reports
│   │   ├── Leaderboard.tsx   # Student ranking table
│   │   ├── OrgStats.tsx      # Aggregate org statistics
│   │   └── StudentManagement.tsx  # Admin student management
│   ├── Results/
│   │   ├── CategoryBadge.tsx # Waste category label badge
│   │   ├── ResultSheet.tsx   # Scan result bottom sheet
│   │   ├── ShareScanModal.tsx# Share scan with friends dialog
│   │   ├── VideoSuggestions.tsx # YouTube video cards
│   │   └── WasteScore.tsx    # Circular waste score indicator
│   ├── Scanner/
│   │   ├── CaptureButton.tsx # Camera capture button
│   │   ├── ScanBrackets.tsx  # Scan area corner brackets
│   │   └── ScanLine.tsx      # Animated scan line
│   └── ui/                   # shadcn/ui components + NavBar
├── contexts/
│   └── AuthContext.tsx       # Auth state provider
├── data/
│   ├── govSchemes.ts         # Indian government waste schemes
│   └── mockResults.ts        # Mock scan results for testing
├── hooks/
│   ├── use-mobile.tsx        # Mobile detection hook
│   ├── use-toast.ts          # Toast notification hook
│   └── useUserStats.ts       # User stats aggregation hook
├── integrations/supabase/
│   ├── client.ts             # Auto-generated Supabase client
│   └── types.ts              # Auto-generated database types
├── lib/
│   ├── carbonCredit.ts       # Carbon credit calculation engine
│   ├── scanApi.ts            # Scan API + credit awarding logic
│   ├── utils.ts              # Utility functions (cn)
│   └── wasteanalysis.ts      # Waste analysis helpers
├── pages/
│   ├── Auth.tsx              # Login / Signup / Forgot Password
│   ├── CarbonWallet.tsx      # Carbon credits dashboard
│   ├── Facilities.tsx        # Recycling facility finder
│   ├── Friends.tsx           # Friends & scan streaks
│   ├── Index.tsx             # App index
│   ├── Landing.tsx           # Landing / home page
│   ├── Marketplace.tsx       # Marketplace browse
│   ├── MarketplaceDetail.tsx # Single listing detail
│   ├── MarketplaceNew.tsx    # Create new listing
│   ├── MyListings.tsx        # User's own listings
│   ├── MyLog.tsx             # Scan history log
│   ├── NotFound.tsx          # 404 page
│   ├── OrgDashboard.tsx      # School admin dashboard
│   ├── ResetPassword.tsx     # Password reset page
│   └── Scanner.tsx           # Camera scanner page
├── types/
│   └── index.ts              # TypeScript type definitions
└── main.tsx                  # App entry point

supabase/
├── config.toml               # Supabase project config
└── functions/
    ├── scan-waste/index.ts   # AI waste scanning edge function
    └── suggest-listing-title/index.ts  # AI listing title generator
```

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (display name, avatar, account type, XP, friend code) |
| `scan_history` | Every scan record (item, category, material, CO₂ saved, credits earned, org link) |
| `carbon_credits` | Per-user credit totals, streak tracking |
| `organizations` | Schools/companies with name, invite code, description |
| `organization_members` | Links users to organizations with role (admin/member) |
| `friendships` | Friend connections with streak tracking and scan sharing timestamps |
| `scan_shares` | Shared scans between friends with messages |
| `listings` | Marketplace upcycled item listings |
| `saved_listings` | User-saved/bookmarked listings |

### Enums

| Enum | Values |
|------|--------|
| `account_type` | `student`, `individual`, `company`, `school` |
| `org_role` | `admin`, `member` |
| `waste_category` | `recyclable`, `compostable`, `hazardous`, `landfill`, `upcyclable` |

### Key Database Functions

| Function | Description |
|----------|-------------|
| `create_org(_name text)` | Atomically creates org + assigns creator as admin (SECURITY DEFINER) |
| `join_org_by_code(_invite_code text)` | Looks up org by code, adds current user as member |
| `is_org_admin(_org_id, _user_id)` | Checks if user is admin of org |
| `is_org_member(_org_id, _user_id)` | Checks if user belongs to org |
| `remove_org_member(_member_user_id, _org_id)` | Admin removes a member |

### Key Triggers

| Trigger | Description |
|---------|-------------|
| `handle_new_user` | Auto-creates profile row on signup with metadata |
| `auto_set_scan_org` | Tags new scans with user's organization_id automatically |

---

## Edge Functions

### `scan-waste`
- **Purpose:** AI waste identification from camera images
- **Model:** Google Gemini 2.5 Flash (via Lovable AI Gateway)
- **Input:** Base64-encoded image
- **Output:** JSON with name, confidence, category, material, disposal steps, upcycle ideas, environmental impact
- **Auth:** Uses `LOVABLE_API_KEY` (auto-configured)

### `suggest-listing-title`
- **Purpose:** AI-generated marketplace listing titles
- **Model:** Google Gemini 3 Flash Preview
- **Input:** `waste_type` string
- **Output:** JSON with 3 creative upcycled product title suggestions

---

## Authentication & Roles

### Account Types
- **Individual** — Default user, can scan, use marketplace, add friends
- **Student** — Like individual + enters school code at signup → auto-linked to organization, appears on school leaderboard
- **School** — Organization admin, sees Students tab instead of Friends, manages student leaderboard
- **Company** — Same as School (organization management)

### Auth Flow
1. **Sign Up:** Email + password + display name + account type
2. **Auto-confirm:** Email verification is disabled for frictionless onboarding
3. **Login:** Email + password
4. **Password Reset:** Email-based reset link
5. **Google OAuth:** Available via Lovable Cloud auth configuration

### Organization Flow
1. School admin signs up (account type: `school`)
2. Creates organization → gets unique invite code
3. Shares code with students
4. Students enter code at signup → `join_org_by_code()` links them
5. Student scans auto-tagged to org via `auto_set_scan_org` trigger
6. Admin sees real-time leaderboard, stats, and can export CSV reports

---

## Carbon Credit Algorithm

Based on Life Cycle Analysis (LCA) data and IPCC emissions factors.

### Formula
```
CC = (EmissionFactor_landfill - EmissionFactor_proper) × MaterialWeight × ActivityMultiplier
```

### Credit Rates by Category
| Category | Base Credits | CO₂e Factor (landfill vs proper) |
|----------|-------------|----------------------------------|
| Recyclable | 10 | 2.1 → 0.4 kg/kg |
| Compostable | 8 | 1.8 → 0.05 kg/kg |
| Upcyclable | 12 | 3.0 → 0.1 kg/kg |
| Hazardous | 15 | 5.2 → 0.3 kg/kg |
| Landfill | 2 | 1.5 → 1.5 kg/kg |

### Streak Multipliers
| Streak Days | Multiplier |
|-------------|-----------|
| 0-2 days | 1.0x |
| 3-4 days | 1.5x |
| 5-6 days | 2.0x |
| 7+ days | 3.0x |

---

## Gamification System

### XP Levels
| Level | Name | Min Points | Icon |
|-------|------|-----------|------|
| 1 | Waste Rookie | 0 | 🌱 |
| 2 | Green Starter | 100 | 🍃 |
| 3 | Eco Warrior | 300 | 🌿 |
| 4 | Planet Protector | 600 | 🌍 |
| 5 | Carbon Crusher | 1000 | ⚡ |
| 6 | Zero Waste Hero | 2000 | 🏆 |

### Friend Streaks
- Both friends must share scans within 24 hours to maintain streak
- Streak resets if either side misses a day
- Fire 🔥 indicator with streak count displayed per friend

---

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- A Lovable account (for backend)

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Running Tests
```bash
# Unit tests (Vitest)
npm test

# E2E tests (Playwright)
npx playwright test
```

---

## Environment Variables

All environment variables are auto-managed by Lovable Cloud:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anon key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |
| `LOVABLE_API_KEY` | AI Gateway key (edge functions only) |

> ⚠️ Never edit the `.env` file manually — it's auto-generated.

---

## Pages & Routes

| Route | Page | Auth Required | Description |
|-------|------|:---:|-------------|
| `/` | Landing | ❌ | Hero, decay timeline, how-it-works |
| `/auth` | Auth | ❌ | Login / Signup / Forgot Password |
| `/reset-password` | ResetPassword | ❌ | Password reset form |
| `/scan` | Scanner | ❌ | Camera scanner + results |
| `/facilities` | Facilities | ❌ | Map-based facility finder |
| `/marketplace` | Marketplace | ❌ | Browse upcycled listings |
| `/marketplace/new` | MarketplaceNew | ✅ | Create new listing |
| `/marketplace/my` | MyListings | ✅ | Manage own listings |
| `/marketplace/:id` | MarketplaceDetail | ❌ | Single listing detail |
| `/log` | MyLog | ✅ | Scan history & stats |
| `/wallet` | CarbonWallet | ✅ | Carbon credits dashboard |
| `/friends` | Friends | ✅ | Friends & streaks |
| `/org` | OrgDashboard | ✅ | School admin dashboard |

---

## Design System

- **Typography:** Space Grotesk (display), Instrument Sans (body), JetBrains Mono (data/monospace)
- **Color Theme:** Dark green + teal palette with HSL-based semantic tokens
- **Categories:** Each waste type has a distinct color (`category-recycle`, `category-compost`, `category-hazard`, `category-landfill`, `category-upcycle`)
- **Components:** shadcn/ui with custom variants, glass-card effects, Framer Motion animations
- **Mobile-first:** Bottom nav on mobile, top nav on desktop

---

Team Name: TrashToTreasure
Track: Sustainability / Waste Management
Project Name: Waste2Worth (W2W)
Team Members:
Sarvesh Tripathi — Team Lead, Full-Stack Developer & AI Integrator
Contact: 6387674345
Adityaraj Dwivedi — Team Member, Database Management and AI integration review 
Contact: +91 73181 24388
Ravi Kumar — Team Member, Research and Development, Frontend designs 
Contact: +91 91205 70016
# revibe-hub
