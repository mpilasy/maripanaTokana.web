# maripána Tokana PWA

**maripána Tokana** (Malagasy for "a single thermometer") is a Progressive Web App weather dashboard that shows current conditions, hourly forecasts, and a 10-day outlook. It always displays both metric and imperial units side by side, and supports 8 languages with 22 font pairings.

This is the web port of the [Android app](../maripanaTokana/), built with SvelteKit.

## Features

- Real-time weather data from [Open-Meteo](https://open-meteo.com) API (no key required)
- GPS location with two-step strategy (instant cached + fresh background)
- **Dual-unit display**: every measurement shows both metric and imperial simultaneously
- **Tap to toggle**: tap any value to swap which unit is primary (bold/large) vs secondary (dimmer)
- **8 languages**: Malagasy, Arabic, English, Spanish, French, Hindi, Nepali, Chinese — cycled via flag button in footer
- **22 font pairings** loaded from Google Fonts: cycled via font icon in footer
- Native digit rendering for Arabic, Hindi, and Nepali
- RTL support (Arabic)
- Auto-refresh when tab becomes visible (if data >30 min old)
- Pull-to-refresh via touch gestures
- Edge-to-edge Blue Marble background
- **Screenshot sharing**: capture any section as a branded PNG via `html2canvas` + Web Share API (with download fallback)
- **Installable PWA** with offline support (service worker with NetworkFirst caching)
- Collapsible sections with slide animation for hourly, daily, and conditions
- **Dual-language error screen**: shows browser language as secondary when different from app language
- **Single-file build**: CSS inlined into HTML, JS consolidated into one bundle via `manualChunks`
- Detailed weather information:
  - Temperature with 1 decimal on hero card (current, feels like, min/max)
  - Pressure (hPa / inHg)
  - Humidity (%) with dew point (°C / °F)
  - Wind speed and direction with cardinal compass (m/s / mph)
  - Wind gusts (when available)
  - UV index with severity label
  - Precipitation (rain/snow in mm / inches)
  - Visibility (km / mi)
  - Sunrise/sunset times
  - Hourly forecast (24h horizontal scroll)
  - 10-day daily forecast

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | SvelteKit + Svelte 5 (runes) |
| Language | TypeScript |
| Adapter | `@sveltejs/adapter-static` |
| i18n | `svelte-i18n` |
| Screenshots | `html2canvas` |
| Weather API | Open-Meteo (free, no key) |
| Geocoding | Nominatim (free, no key) |

## Build & Run

```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:5173
npm run build        # Production build to build/ (includes CSS inlining)
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
```

The build step runs `vite build` followed by `scripts/inline-assets.js`, which inlines CSS into `index.html` to reduce HTTP requests.

## Deployment (Docker)

Multi-stage Docker build: node builds the static site, Caddy serves it.

```bash
docker compose up -d --build    # Build and run on port 3080 (default)
```

To use a custom port, create a `.env` file or pass it inline:

```bash
PORT=8080 docker compose up -d --build
```

The container (`maripanaTokana.web`) exposes port 80, mapped to host port `$PORT` (default 3080). Point your reverse proxy (e.g., Nginx Proxy Manager) at `http://<host>:<port>`.

```
Dockerfile          # Multi-stage: node:22-alpine → caddy:alpine
Caddyfile           # SPA fallback + no-cache for service worker
docker-compose.yml  # Container config (port 3080)
.dockerignore       # Excludes node_modules, .git, build, .svelte-kit
```

## Architecture

Single-page static SvelteKit app. No server-side logic.

```
src/
├── lib/
│   ├── api/
│   │   ├── openMeteo.ts          # fetch client
│   │   ├── openMeteoTypes.ts     # API response interfaces
│   │   ├── openMeteoMapper.ts    # response → domain mapping
│   │   └── wmoWeatherCode.ts     # WMO code → emoji + i18n key
│   ├── domain/
│   │   ├── temperature.ts        # Temperature class with displayDual()
│   │   ├── pressure.ts           # Pressure class with displayDual()
│   │   ├── windSpeed.ts          # WindSpeed class with displayDual()
│   │   ├── precipitation.ts      # Precipitation class with displayDual()
│   │   └── weatherData.ts        # WeatherData, HourlyForecast, DailyForecast interfaces
│   ├── i18n/
│   │   ├── index.ts              # svelte-i18n setup + localizeDigits()
│   │   └── locales/              # 8 locale JSON files
│   │       ├── en.json  ├── mg.json  ├── ar.json  ├── es.json
│   │       ├── fr.json  ├── hi.json  ├── ne.json  └── zh.json
│   ├── stores/
│   │   ├── preferences.ts        # Persisted stores (metricPrimary, fontIndex, localeIndex)
│   │   ├── weather.ts            # Weather state machine + fetch logic
│   │   └── location.ts           # Geolocation + Nominatim reverse geocoding
│   ├── fonts.ts                  # 22 FontPairing definitions + Google Fonts URLs
│   ├── share.ts                  # html2canvas capture + Web Share API / download fallback
│   └── components/
│       ├── WeatherScreen.svelte      # Root container (state switch, pull-to-refresh, dual-language error)
│       ├── HeroCard.svelte           # Main weather card (emoji, temp, feels-like, precip, share btn)
│       ├── HourlyForecast.svelte     # Horizontal scrolling hourly row (24h)
│       ├── DailyForecast.svelte      # 10-day vertical list
│       ├── CurrentConditions.svelte  # Detail cards grid (5 rows × 2 columns)
│       ├── DetailCard.svelte         # Reusable detail card
│       ├── DualUnitText.svelte       # Primary + secondary unit display (clickable)
│       ├── CollapsibleSection.svelte # Animated expand/collapse with slide transition + share btn
│       └── Footer.svelte             # Font cycle / credits / language cycle
├── routes/
│   ├── +page.svelte     # Single page — mounts WeatherScreen
│   └── +layout.svelte   # Root layout (font loading, RTL, i18n init, auto-refresh)
├── service-worker.ts    # PWA caching (NetworkFirst for app + API, CacheFirst for fonts)
└── app.html             # Shell HTML with manifest + meta tags + page title
```

## Internationalization

| Language | Tag | Native Digits | Decimal Sep |
|----------|-----|---------------|-------------|
| Malagasy | mg | — | `,` |
| Arabic | ar | Eastern Arabic (٠١٢٣٤٥٦٧٨٩) | `٫` |
| English | en | — | `.` |
| Spanish | es | — | `,` |
| French | fr | — | `,` |
| Hindi | hi | Devanagari (०१२३४५६७८९) | `.` |
| Nepali | ne | Devanagari (०१२३४५६७८९) | `.` |
| Chinese | zh | — | `.` |

All numeric formatting uses ASCII digits internally. Native digits are applied via character replacement at display time (`localizeDigits()`) — same approach as the Android app.

## Font Pairings

| # | Name | Display Font | Body Font |
|---|------|-------------|-----------|
| 0 | Default | system-ui | system-ui |
| 1 | Orbitron + Outfit | Orbitron | Outfit |
| 2 | Rajdhani + Inter | Rajdhani | Inter |
| 3 | Oxanium + Nunito | Oxanium | Nunito |
| 4 | Space Grotesk + DM Sans | Space Grotesk | DM Sans |
| 5 | Sora + Source Sans | Sora | Source Sans 3 |
| 6 | Manrope + Rubik | Manrope | Rubik |
| 7 | Josefin Sans + Lato | Josefin Sans | Lato |
| 8 | Cormorant + Fira Sans | Cormorant Garamond | Fira Sans |
| 9 | Playfair + Work Sans | Playfair Display | Work Sans |
| 10 | Quicksand + Nunito Sans | Quicksand | Nunito Sans |
| 11 | Comfortaa + Karla | Comfortaa | Karla |
| 12 | Baloo 2 + Poppins | Baloo 2 | Poppins |
| 13 | Exo 2 + Barlow | Exo 2 | Barlow |
| 14 | Michroma + Saira | Michroma | Saira |
| 15 | Jost + Atkinson | Jost | Atkinson Hyperlegible |
| 16 | Roboto + Fira Code | system-ui | Fira Code |
| 17 | Montserrat + Open Sans | Montserrat | Open Sans |
| 18 | Space Grotesk + Space Mono | Space Grotesk | Space Mono |
| 19 | Plus Jakarta Sans + Inter | Plus Jakarta Sans | Inter |
| 20 | Archivo + Archivo Narrow | Archivo | Archivo Narrow |
| 21 | Roboto + Lora | system-ui | Lora |

Pairings 16–20 use `font-feature-settings: "tnum"` (tabular numbers) for the body font.

## License

MIT License — (c) Orinasa Njarasoa
