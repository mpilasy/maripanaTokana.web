# Project: maripànaTokana PWA (Weather App)
**Goal:** SvelteKit PWA weather app — port of the Android app with simultaneous Metric/Imperial display.

## Tech Stack
- **Framework:** SvelteKit with Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`), TypeScript
- **Adapter:** `@sveltejs/adapter-static` (fully static, no server-side logic)
- **i18n:** `svelte-i18n` — reactive `$_()` store, 8 JSON locale files in `src/lib/i18n/locales/`
- **Screenshot:** `html2canvas` — installed but share UI not yet wired
- **Styling:** Plain CSS with custom properties (`--font-display`, `--font-body`, `--font-features`), no CSS framework
- **Weather API:** [Open-Meteo](https://open-meteo.com) — free, no API key
- **Reverse Geocoding:** [Nominatim](https://nominatim.openstreetmap.org) — free, no API key

## Build & Run
```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:5173
npm run build        # Production build to build/
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
```

## Architecture
Single-page SvelteKit app. No server-side logic — fully static.

```
src/
├── lib/
│   ├── api/             # Open-Meteo fetch client, types, mapper, WMO codes
│   ├── domain/          # Value classes: Temperature, Pressure, WindSpeed, Precipitation
│   ├── i18n/            # svelte-i18n setup + 8 locale JSON files
│   ├── stores/          # Svelte writable stores (preferences, weather state, location)
│   ├── fonts.ts         # 22 FontPairing definitions + Google Fonts URLs
│   └── components/      # All Svelte components (10 files)
├── routes/
│   ├── +page.svelte     # Single page — mounts WeatherScreen
│   └── +layout.svelte   # Root layout (font loading, RTL, i18n init)
├── service-worker.ts    # PWA offline caching (3 strategies)
└── app.html             # Shell HTML with manifest link
```

## Core Features
- **Dual Units with Toggle:** Every measurement shows both metric and imperial. Tap any value (`DualUnitText`) to swap primary (bold/large) vs secondary (smaller/dimmer). Preference stored in `localStorage`.
- **Font Cycling:** 22 font pairings loaded from Google Fonts. Cycled via font icon in footer. Default (index 0) uses system-ui. CSS custom properties set via `$effect` in `+layout.svelte`.
- **In-App Language Cycling:** 8 languages (mg, ar, en, es, fr, hi, ne, zh) cycled via flag button in footer. Locale index stored in `localStorage`. Default: Malagasy (mg, index 0).
- **i18n:** All strings in JSON locale files (~73 keys + 2 arrays: `cardinal_directions`, `uv_labels`). `$_('key')` via svelte-i18n. WMO descriptions return i18n key strings.
- **Native Digit Rendering:** `localizeDigits(s, locale)` replaces ASCII 0-9 with native digits for ar (U+0660), hi/ne (U+0966). Also replaces decimal separator for mg/es/fr (`,`) and ar (`٫`). No `toLocaleString()` used.
- **RTL Support:** `document.documentElement.dir = 'rtl'` when locale is `ar`, `ltr` otherwise. Footer forced LTR via `dir="ltr"`.
- **Two-Step Location:** Cached coords from localStorage → fresh `navigator.geolocation` → re-fetch if moved >0.045° (~5 km).
- **Auto-refresh:** `visibilitychange` event triggers `refreshIfStale()` if data >30 min old.
- **Pull-to-Refresh:** Touch event handling on scroll container (touchstart/touchmove/touchend) in `WeatherScreen.svelte`.
- **Service Worker:** App shell cached on install (`CACHE_APP`). NetworkFirst for API (`CACHE_API`). CacheFirst for Google Fonts (`CACHE_FONTS`).
- **Collapsible Sections:** `transition:slide` with chevron rotation via CSS class toggle.

## Component Details
- **WeatherScreen.svelte:** State machine switch (`permission | loading | success | error`), pull-to-refresh, `loc()` for digit localization, auto-fetch on mount if permission already granted.
- **HeroCard.svelte:** Emoji+description (left), temperature with `DualUnitText` (right), feels-like (bottom-left), precipitation (bottom-right), copyright watermark.
- **HourlyForecast.svelte:** Horizontal flex scroll with `scroll-snap-type`. `isNightForHour()` uses `dailySunrise`/`dailySunset` arrays for day/night emoji selection.
- **DailyForecast.svelte:** Vertical list with `Intl.DateTimeFormat` for localized day names. Precip probability shown only when >0%.
- **CurrentConditions.svelte:** 5-row grid of DetailCard pairs. Special humidity+dewpoint combined card. Cardinal direction from `$_('cardinal_directions')` array. UV label from `$_('uv_labels')` array.
- **CollapsibleSection.svelte:** Uses Svelte 5 `Snippet` for children. `let isExpanded = $state(expanded)` captures initial prop (intentional `state_referenced_locally` warning).

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
| `GraphicsLayer.toImageBitmap()` | `html2canvas` (not yet wired) |
| `Intent.ACTION_SEND` | `navigator.share()` (not yet wired) |
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
- **Placeholder assets:** `bg-blue-marble.webp`, `favicon.png`, `icon-192.png`, `icon-512.png` are placeholder images.
- **Share feature:** `html2canvas` installed but share buttons not added to UI yet.
- **CollapsibleSection warning:** `state_referenced_locally` — intentional, captures initial prop value.

## Developer Context
- Owner is an experienced C#, Java, C++ developer.
- Prefer concise, technically accurate code.
- Avoid redundant explanations; focus on implementation details and logic.
- Port from Android source at `../maripanaTokana/` — same logic, different platform APIs.
