# Project: maripána Tokana PWA (Weather App)
**Goal:** Multi-framework weather app with three parallel implementations (SvelteKit, React, Angular) — ports of the Android app with simultaneous Metric/Imperial display.

## Tech Stack

### Svelte App (Primary)
- **Framework:** SvelteKit with Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`), TypeScript
- **Adapter:** `@sveltejs/adapter-static` (fully static, no server-side logic)
- **i18n:** `svelte-i18n` — reactive `$_()` store, 8 JSON locale files in `src/lib/i18n/locales/`
- **Screenshots:** `html2canvas` — captures DOM sections, composites onto branded canvas, shares via Web Share API
- **Styling:** Plain CSS with custom properties (`--font-display`, `--font-body`, `--font-features`), no CSS framework
- **Build optimization:** `manualChunks` consolidates JS into one bundle; `scripts/inline-assets.js` inlines CSS into HTML

### React App (`/re` path)
- **Framework:** React 19 with Vite build tool
- **i18n:** `react-i18next` with same 8 locale JSON files
- **Screenshots:** `html2canvas` for sharing
- **Build optimization:** Vite with `minify: 'terser'`, `cssCodeSplit: false`, single bundle via `manualChunks`
- **Base path:** `/re/` configured in vite.config.ts

### Angular App (`/an` path)
- **Framework:** Angular 19 with CLI build
- **i18n:** Custom translation service with same 8 locale JSON files
- **Screenshots:** `html2canvas` for sharing
- **Build optimization:** AOT compilation, build optimizer, no vendor chunks
- **Base href:** `/an/` configured in angular.json

### Shared
- **Weather API:** [Open-Meteo](https://open-meteo.com) — free, no API key
- **Reverse Geocoding:** [Nominatim](https://nominatim.openstreetmap.org) — free, no API key

## Build & Run

### Svelte App (Root)
```bash
npm install          # Install dependencies (root only)
npm run dev          # Dev server at localhost:5173
npm run build        # Production build to build/ (vite build + CSS inlining)
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
```

### React App
```bash
cd react
npm install          # Install dependencies
npm run dev          # Dev server at localhost:5174
npm run build        # Production build to react/dist/
npm run preview      # Preview production build
```

### Angular App
```bash
cd angular
npm install          # Install dependencies
npm run start        # Dev server (ng serve)
npm run build        # Production build to angular/dist/
npm run watch        # Build in watch mode
```

### All Apps (Docker)
```bash
npm run build:all    # Builds Svelte, React, and Angular
docker compose up -d --build
```

## Deployment
```bash
docker compose up -d --build          # Default port 3080
PORT=8080 docker compose up -d --build  # Custom port via env
```
- **Dockerfile:** Multi-stage — builds all three apps (Svelte, React, Angular) in `node:22-alpine`, serves via `caddy:alpine`
- **Caddyfile:** Path-based routing with SPA fallback for each app (`/`, `/re/*`, `/an/*`), gzip compression, smart caching headers
- **docker-compose.yml:** Container `maripanaTokana.web`, port `${PORT:-3080}:80`, `restart: unless-stopped`
- Three apps served from single instance:
  - `/` → Svelte app (CSS inlined, single JS bundle)
  - `/re` → React app (base path `/re/`, single bundle, terser minification)
  - `/an` → Angular app (base href `/an/`, AOT compilation, build optimizer)
- Designed to sit behind a reverse proxy (e.g., Nginx Proxy Manager) that handles TLS

### Performance Features
- **Gzip compression**: All text assets automatically compressed
- **Aggressive caching**: Versioned assets (hash in filename) cached for 1 year; HTML/service-worker always revalidated
- **React**: Terser minification, no sourcemaps, single bundle, `cssCodeSplit: false`
- **Angular**: AOT compilation, build optimizer, no sourcemaps, `vendorChunk: false`
- **Svelte**: CSS inlined into HTML, single JS bundle via `manualChunks`

## Architecture

### Svelte App (Root) — Single-page SvelteKit app. No server-side logic — fully static.

```
src/
├── lib/
│   ├── api/             # Open-Meteo fetch client, types, mapper, WMO codes
│   ├── domain/          # Value classes: Temperature, Pressure, WindSpeed, Precipitation
│   ├── i18n/            # svelte-i18n setup + 8 locale JSON files
│   ├── stores/          # Svelte writable stores (preferences, weather state, location)
│   ├── fonts.ts         # 22 FontPairing definitions + Google Fonts URLs
│   ├── share.ts         # html2canvas capture + Web Share API / download fallback
│   └── components/      # All Svelte components (9 files)
├── routes/
│   ├── +page.svelte     # Single page — mounts WeatherScreen
│   └── +layout.svelte   # Root layout (font loading, RTL, i18n init)
├── service-worker.ts    # PWA caching (NetworkFirst for app + API, CacheFirst for fonts)
└── app.html             # Shell HTML with manifest link + page title
scripts/
└── inline-assets.js     # Post-build: inlines CSS into index.html
static/
├── manifest.json        # PWA manifest
└── ...                  # Icons, background image
```

### React App (`/re` path)

```
react/
├── src/
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point with service worker registration
│   ├── i18n.ts          # react-i18next configuration
│   ├── hooks/           # useWeather, usePreferences hooks
│   ├── components/      # React components (HeroCard, HourlyForecast, etc.)
│   └── App.css          # Styling
├── index.html           # HTML shell
├── vite.config.ts       # Vite config with base: '/re/'
└── package.json         # React dependencies
```

### Angular App (`/an` path)

```
angular/
├── src/
│   ├── app/
│   │   ├── app.component.ts     # Root component
│   │   ├── components/          # Angular components
│   │   ├── services/            # Weather, i18n, preferences services
│   │   ├── pipes/               # Custom pipes
│   │   └── app.css
│   ├── main.ts                  # Entry point with service worker registration
│   ├── index.html               # HTML shell
│   └── styles.css               # Global styling
├── angular.json                 # Angular config with baseHref: '/an/'
└── package.json                 # Angular dependencies
```

### Root Directory

```
maripanaTokana.web/
├── src/                 # Svelte app source
├── react/              # React app (separate package.json, vite.config.ts)
├── angular/            # Angular app (separate package.json, angular.json)
├── Dockerfile          # Multi-stage build (all three apps)
├── Caddyfile           # Path-based routing + gzip + caching
├── docker-compose.yml  # Container configuration
├── package.json        # Root scripts (build:all, build:react, build:angular)
└── CLAUDE.md           # This file
```

## Core Features
- **Dual Units with Toggle:** Every measurement shows both metric and imperial. Tap any value (`DualUnitText`) to swap primary (bold/large) vs secondary (smaller/dimmer). Preference stored in `localStorage`.
- **Font Cycling:** 22 font pairings loaded from Google Fonts. Cycled via font icon in footer. Default (index 0) uses system-ui. CSS custom properties set via `$effect` in `+layout.svelte`.
- **In-App Language Cycling:** 8 languages (mg, ar, en, es, fr, hi, ne, zh) cycled via flag button in footer. Locale index stored in `localStorage`. Default: Malagasy (mg, index 0).
- **i18n:** All strings in JSON locale files (~75 keys + 2 arrays: `cardinal_directions`, `uv_labels`). `$_('key')` via svelte-i18n. WMO descriptions return i18n key strings.
- **Native Digit Rendering:** `localizeDigits(s, locale)` replaces ASCII 0-9 with native digits for ar (U+0660), hi/ne (U+0966). Also replaces decimal separator for mg/es/fr (`,`) and ar (`٫`). No `toLocaleString()` used.
- **RTL Support:** `document.documentElement.dir = 'rtl'` when locale is `ar`, `ltr` otherwise. Footer forced LTR via `dir="ltr"`.
- **Two-Step Location:** Cached coords from localStorage → fresh `navigator.geolocation` → re-fetch if moved >0.045° (~5 km).
- **Auto-refresh:** `visibilitychange` event triggers `refreshIfStale()` if data >30 min old.
- **Pull-to-Refresh:** Touch event handling on scroll container (touchstart/touchmove/touchend) in `WeatherScreen.svelte`.
- **Screenshot Sharing:** `html2canvas` captures header (location + date) and content section, composites onto a branded canvas with `#0E0B3D` background and copyright watermark. Uses `navigator.share({ files })` with PNG download fallback. Share buttons on HeroCard and each CollapsibleSection.
- **Service Worker:** NetworkFirst for all same-origin requests (app shell + API). CacheFirst for Google Fonts. `skipWaiting()` + `clients.claim()` for instant activation. No precaching — cache populates naturally.
- **Collapsible Sections:** `transition:slide` with chevron rotation via CSS class toggle. Share button next to section title.
- **Dual-Language Error Screen:** When the browser language differs from the app language, the error screen shows a faded secondary translation of the title, message, and retry button.

## Component Details
- **WeatherScreen.svelte:** State machine switch (`loading | success | error`), pull-to-refresh, `loc()` for digit localization, dual-language error screen with browser locale detection, auto-fetch on mount.
- **HeroCard.svelte:** Emoji+description (left), temperature with `DualUnitText` (right), feels-like (bottom-left), precipitation (bottom-right), share button (top-right), copyright watermark.
- **HourlyForecast.svelte:** Horizontal flex scroll with `scroll-snap-type`. `isNightForHour()` uses `dailySunrise`/`dailySunset` arrays for day/night emoji selection.
- **DailyForecast.svelte:** Vertical list with `Intl.DateTimeFormat` for localized day names. Precip probability shown only when >0%.
- **CurrentConditions.svelte:** 5-row grid of DetailCard pairs. Special humidity+dewpoint combined card. Cardinal direction from `$_('cardinal_directions')` array. UV label from `$_('uv_labels')` array.
- **CollapsibleSection.svelte:** Uses Svelte 5 `Snippet` for children. Share button next to title (visible when expanded). `let isExpanded = $state(expanded)` captures initial prop (intentional `state_referenced_locally` warning).

## Visual Style
- Dark theme, Blue Marble background at 12% opacity
- Translucent cards (base: `rgba(42, 31, 165, 0.6)`, hero: `rgba(42, 31, 165, 0.8)`)
- Theme color: `#0E0B3D`
- Edge-to-edge with safe area padding (`env(safe-area-inset-top)`)

## Key Android→Web Mappings
| Android | SvelteKit |
|---------|-----------|
| `SharedPreferences` | `localStorage` via persisted stores |
| `StateFlow` + `collectAsState()` | Svelte writable stores + `$store` |
| `AnimatedVisibility(expandVertically)` | `transition:slide` |
| `LazyRow` | `display: flex; overflow-x: auto; scroll-snap-type` |
| `GraphicsLayer.toImageBitmap()` | `html2canvas` + canvas compositing |
| `Intent.ACTION_SEND` | `navigator.share()` with download fallback |
| `FusedLocationProvider` | `navigator.geolocation` |
| `android.location.Geocoder` | Nominatim reverse geocoding API |
| `Lifecycle.ON_RESUME` | `document.visibilitychange` |
| `R.string.xxx` | `$_('xxx')` via svelte-i18n |

## Svelte 5 Specifics
- **`{@const}` placement:** Must be immediate child of block constructs (`{#each}`, `{#if}`, etc.), NOT nested inside elements. Use `$derived()` in script block as alternative.
- **`bind:this`:** Variable must be declared with `$state()` (e.g., `let el = $state<HTMLElement | null>(null)`).
- **Props:** Use `interface Props` + `$props()` (not `export let`).
- **Children:** Use `Snippet` type + `{@render children()}` (not `<slot />`).
- **Effects:** `$effect()` replaces `afterUpdate`/reactive statements.

## Known Issues
- **CollapsibleSection warning:** `state_referenced_locally` — intentional, captures initial prop value.

## Developer Context
- Owner is an experienced C#, Java, C++ developer.
- Prefer concise, technically accurate code.
- Avoid redundant explanations; focus on implementation details and logic.
- Port from Android source at `../maripanaTokana/` — same logic, different platform APIs.
