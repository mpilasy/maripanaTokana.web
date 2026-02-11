# Testing Instructions — maripànaTokana PWA

## Prerequisites

```bash
npm install
npm run build    # Verify clean build (no errors)
```

The build should complete with zero errors. One non-blocking warning is expected:
- `state_referenced_locally` in `CollapsibleSection.svelte` — intentional behavior.

---

## 1. Build Verification

```bash
npm run build
npm run check
```

- `npm run build` produces output in `build/` directory
- `npm run check` runs `svelte-check` with no type errors
- The `build/` directory should contain `index.html`, JS bundles, and static assets

---

## 2. Dev Server

```bash
npm run dev
```

- Open `http://localhost:5173` in Chrome/Firefox
- Browser should prompt for geolocation permission
- After granting, weather data should load and display

---

## 3. Geolocation

| Test | Expected |
|------|----------|
| First visit (no cached location) | Permission screen shows with explanation text and "Allow" button |
| Click "Allow" | Browser shows native geolocation prompt |
| Grant geolocation | Loading spinner → weather data loads |
| Deny geolocation | Error screen with retry button |
| Subsequent visit (permission already granted) | Skips permission screen, loads weather immediately |
| Cached location available | Instant display from cache, then updates if position changed >5 km |

---

## 4. Weather Data Display

After granting location, verify the following sections render:

### Hero Card
- [ ] Weather emoji (day/night appropriate)
- [ ] Weather description text (localized)
- [ ] Current temperature in large text (e.g., `24.3°C`)
- [ ] Secondary unit below primary (e.g., `75.7°F` dimmed)
- [ ] "Feels like" label with dual-unit temperature
- [ ] Precipitation display (rain/snow emoji + amount, or "no precipitation")
- [ ] "© Orinasa Njarasoa" watermark at bottom

### Hourly Forecast (collapsible, expanded by default)
- [ ] Horizontal scrollable row of hourly cards
- [ ] Each card: time (HH:mm), weather emoji, temperature, precip probability
- [ ] Scroll snap works (cards snap into position)
- [ ] Day/night emoji changes correctly based on sunrise/sunset

### Daily Forecast (collapsible, collapsed by default)
- [ ] Click section header to expand
- [ ] 10 rows with: day name, date, weather emoji + description, precip %, hi/lo temps
- [ ] Day names localized to current language

### Current Conditions (collapsible, collapsed by default)
- [ ] Min/Max temperature cards
- [ ] Wind speed + direction (cardinal compass) and wind gust (if available)
- [ ] Pressure (hPa primary if metric)
- [ ] Humidity (%) + dew point
- [ ] UV index with severity label (Low/Moderate/High/Very High/Extreme)
- [ ] Visibility (km/mi)
- [ ] Sunrise/sunset times

---

## 5. Dual Units & Toggle

- [ ] All temperature values show both °C and °F
- [ ] All wind values show both m/s and mph
- [ ] Pressure shows both hPa and inHg
- [ ] Visibility shows both km and mi
- [ ] Precipitation shows both mm and in
- [ ] **Tap any dual value** → primary and secondary swap (e.g., °F becomes bold, °C becomes dimmed)
- [ ] Toggle persists across page reload (stored in `localStorage`)

Verify in localStorage:
```js
localStorage.getItem('metricPrimary')  // "true" or "false"
```

---

## 6. Internationalization (8 Languages)

Tap the flag emoji in the footer to cycle through languages:

| # | Flag | Language | Verify |
|---|------|----------|--------|
| 0 | 🇲🇬 | Malagasy | Default language, comma decimal separator |
| 1 | 🇸🇦 | Arabic | RTL layout, Eastern Arabic digits (٠١٢...), Arabic decimal `٫` |
| 2 | 🇬🇧 | English | LTR, standard digits |
| 3 | 🇪🇸 | Spanish | LTR, comma decimal separator |
| 4 | 🇫🇷 | French | LTR, comma decimal separator |
| 5 | 🇮🇳 | Hindi | LTR, Devanagari digits (०१२...) |
| 6 | 🇳🇵 | Nepali | LTR, Devanagari digits (०१२...) |
| 7 | 🇨🇳 | Chinese | LTR, standard digits |

### Per-language checks:
- [ ] All UI labels change to the selected language
- [ ] Weather descriptions are localized
- [ ] Day/month names are localized (via `Intl.DateTimeFormat`)
- [ ] Cardinal directions are localized (N, S, E, W, etc.)
- [ ] UV severity labels are localized
- [ ] Digits are replaced for ar/hi/ne
- [ ] Decimal separators are correct per locale
- [ ] Language persists across reload (check `localStorage.getItem('localeIndex')`)

### Arabic (RTL) specific:
- [ ] `<html dir="rtl">` is set when Arabic is selected
- [ ] Layout mirrors (text right-aligned, scroll directions correct)
- [ ] Footer remains LTR (`dir="ltr"` attribute)
- [ ] Switching away from Arabic restores `dir="ltr"`

---

## 7. Font Pairings (22 fonts)

Tap the font icon (Aa) in the footer to cycle through 22 font pairings.

- [ ] Font name displayed in footer updates on each tap
- [ ] Default (index 0) uses system fonts
- [ ] Google Fonts load correctly (check Network tab for `fonts.googleapis.com` requests)
- [ ] Display font applies to: location name, card values
- [ ] Body font applies to: labels, descriptions
- [ ] Pairings 16–20 use tabular numbers (`font-feature-settings: "tnum"`)
- [ ] Font index persists across reload (check `localStorage.getItem('fontIndex')`)

---

## 8. Collapsible Sections

- [ ] Hourly Forecast: expanded by default on load
- [ ] Daily Forecast: collapsed by default
- [ ] Current Conditions: collapsed by default
- [ ] Click header → section expands/collapses with slide animation (~300ms)
- [ ] Chevron rotates on expand/collapse

---

## 9. Pull-to-Refresh

- [ ] Scroll to top of the content area
- [ ] Touch and drag downward from the top
- [ ] Pull indicator appears
- [ ] Pull past threshold (~80px) → spinner becomes active
- [ ] Release → weather data refreshes
- [ ] During refresh, a small spinner shows at the top

---

## 10. Auto-Refresh on Tab Focus

1. Load the app and note the "Updated at HH:MM" time
2. Switch to another tab/app
3. Wait >30 minutes (or temporarily change the `STALE_THRESHOLD` in `weather.ts` to a shorter value like 5000ms for testing)
4. Switch back to the app tab
5. [ ] Weather data refreshes automatically
6. [ ] "Updated at" time updates

---

## 11. PWA / Installability

### Via npm preview:
```bash
npm run build && npm run preview
```
Open `http://localhost:4173` in Chrome.

### Via Docker:
```bash
docker compose up -d --build
```
Open `http://localhost:3080` in Chrome.

- [ ] Service worker registers (check DevTools → Application → Service Workers)
- [ ] Manifest is detected (check DevTools → Application → Manifest)
- [ ] Chrome shows "Install app" option (address bar or menu)
- [ ] After installing, app opens in standalone window (no browser chrome)
- [ ] Theme color `#0E0B3D` applies to title bar/status bar

### Lighthouse PWA Audit:
1. Open DevTools → Lighthouse
2. Select "Progressive Web App" category
3. Run audit
4. [ ] PWA score should be 100 (once placeholder icons are replaced with real ones)

---

## 12. Offline Support

### Production build required.

1. Load the app, allow geolocation, wait for weather to display
2. Open DevTools → Application → Service Workers → check "Offline"
3. Reload the page
4. [ ] App shell loads from cache (background, layout visible)
5. [ ] Weather data loads from API cache (last fetched data shown)
6. Uncheck "Offline"
7. Pull-to-refresh or reload
8. [ ] Fresh data loads from network

### Cache inspection (DevTools → Application → Cache Storage):
- `app-{version}`: Built JS/CSS/HTML assets
- `api-cache`: Open-Meteo and Nominatim responses
- `font-cache`: Google Fonts CSS and font files

---

## 13. Responsive Layout

Test at these viewport widths (DevTools → Device toolbar):

| Width | Device class |
|-------|-------------|
| 320px | Small phone (iPhone SE) |
| 375px | Standard phone (iPhone 12/13) |
| 414px | Large phone (iPhone 14 Plus) |
| 768px | Tablet portrait |

- [ ] Hero card scales without overflow
- [ ] Hourly forecast scrolls horizontally
- [ ] Daily forecast rows don't overflow
- [ ] Detail cards grid maintains 2-column layout
- [ ] Footer doesn't overlap content
- [ ] No horizontal scroll on the page body

---

## 14. Error Handling

- [ ] Deny geolocation → error screen with "Retry" button shows
- [ ] Block network requests to `api.open-meteo.com` → error screen with message
- [ ] Click "Retry" on error screen → retries the weather fetch

---

## 15. Edge Cases

- [ ] Reload the page rapidly — no duplicate API calls or state corruption
- [ ] Toggle units rapidly — values update correctly each time
- [ ] Cycle languages rapidly — all strings update, no missing translations
- [ ] Cycle fonts rapidly — no layout jank or loading errors
- [ ] Very long location names — truncated or wrapped gracefully
- [ ] Location with no wind gust data — gust card replaced with empty placeholder

---

## Placeholder Assets (to be replaced)

These files are placeholders and should be replaced with real assets before production:

| File | Current State | Required |
|------|--------------|----------|
| `static/bg-blue-marble.webp` | 256×256 dark blue gradient | Blue Marble earth photo, optimized WebP |
| `static/favicon.png` | 32×32 dark blue square | App icon at 32×32 |
| `static/icons/icon-192.png` | Dark blue square with "M" | App icon at 192×192 |
| `static/icons/icon-512.png` | Dark blue square with "M" | App icon at 512×512 |

---

## Not Yet Implemented (future work)

- **Share feature**: `html2canvas` is installed but share buttons are not yet added to HeroCard or CollapsibleSection. The Android app captures sections as bitmaps, composites them onto a branded canvas, and shares via `Intent.ACTION_SEND`. The web equivalent would use `html2canvas` to capture + `navigator.share({ files })` or fallback download.
