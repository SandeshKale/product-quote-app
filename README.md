# Smart Quote Generator

A React web app that searches a daily-updated Excel product catalogue from Google Drive and generates professional shareable quote images via the native device share sheet.

---

## Features

- **Elastic search** across product name (highest priority), article code, and category — debounced at 200ms
- **Sidebar filters** — category, MRP range, RRP range, margin %, GST rate
- **Quote builder** — add products, adjust quantities, see margin % per item
- **Quote image export** — professional PNG captured by html2canvas, shared via native iOS/Android share sheet or downloaded on desktop
- **Google Drive sync** — 2-hour cache TTL with manual refresh, Excel version badge in header
- **Quote number format** — `QT-<Date.now()>` e.g. `QT-1747295834123` (no expiry date)
- **Margin % rule** — visible to the user throughout the app; strictly excluded from the generated quote image

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 |
| Styling | CSS Modules |
| Excel parsing | SheetJS (xlsx) |
| Quote image | html2canvas |
| Icons | lucide-react |
| Tests | Vitest + Testing Library |
| CI/CD | GitHub Actions → Vercel |

---

## Quick Start (Local Dev)

### 1. Prerequisites

- Node.js 20+
- npm 9+

### 2. Clone the repo

```bash
git clone https://github.com/SandeshKale/product-quote-app.git
cd product-quote-app
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set environment variables

```bash
cp .env.example .env.local
# Then edit .env.local with your actual values
```

`.env.local` contents:
```
VITE_DRIVE_FILE_ID=1t6nkgdqDTXRexPP1aS7BVwH6mx7eHb45
VITE_DRIVE_API_KEY=your_google_drive_api_key
VITE_APP_NAME=Smart Quote Generator
```

> `.env.local` is gitignored and never committed.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server (HMR) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint (0 warnings allowed) |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier format all source files |
| `npm run format:check` | Prettier check (used in CI) |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests + generate coverage report |
| `npm run test:ui` | Open Vitest UI in browser |
| `npm run ci` | Full CI pipeline (lint + format check + test + build) |

---

## Testing

### Run tests

```bash
npm run test
```

### Coverage report

```bash
npm run test:coverage
```

Coverage thresholds (all four must pass or CI fails):

| Metric | Threshold |
|---|---|
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |
| Statements | 80% |

HTML report is generated in `coverage/index.html`.

---

## Project Structure

```
src/
├── components/
│   ├── Header/          — App name, Excel version badge, refresh button
│   ├── SearchBar/       — Debounced search input + result count
│   ├── FilterSidebar/   — Category, price, margin %, GST filters
│   ├── ProductList/     — Product cards (shows margin % to user)
│   ├── QuotePanel/      — Cart with qty controls (shows margin % per item)
│   └── QuoteTemplate/   — Off-screen quote for html2canvas (NO margin %)
│
├── hooks/
│   ├── useDataSync.js   — Google Drive sync, 2h cache TTL
│   ├── useSearch.js     — 200ms debounced search + filter state
│   └── useQuote.js      — Cart state, totals (no margin in totals)
│
├── services/
│   ├── driveService.js  — Google Drive API v3 fetch + metadata
│   ├── searchEngine.js  — Multi-field scoring (name > code > category)
│   └── quoteExporter.js — html2canvas capture + navigator.share()
│
├── utils/
│   ├── formatters.js    — Currency, margin, date formatters
│   └── excelParser.js   — SheetJS → normalised product array
│
└── constants/
    └── columnMap.js     — Excel column → property name mapping
```

---

## Search Scoring

| Match | Points |
|---|---|
| Product name — exact word | 125 |
| Product name — partial contains | 100 |
| Product name — word starts with term | +25 bonus |
| Article code — exact | 100 |
| Article code — partial | 75 |
| Category — contains | 25 |
| Fuzzy (edit distance = 1) | 10 |
| Fuzzy (edit distance = 2) | 5 |

Fuzzy matching only fires when no direct match was found for a term.

---

## Margin % Rule

| Location | Margin % visible? |
|---|---|
| Product card (search results) | ✅ Yes |
| Margin % filter (sidebar) | ✅ Yes |
| Quote builder panel | ✅ Yes (per item) |
| Quote image (PNG) | ❌ Never |
| Totals object | ❌ Never |

---

## CI/CD Pipeline

Every push and pull request triggers GitHub Actions:

```
1. npm ci
2. ESLint    — max-warnings 0
3. Prettier  — format check
4. Vitest    — 80% coverage gate (fails build if below)
5. Vite      — production build
```

Merging to `main` automatically deploys to Vercel.

---

## Environment Variables

| Variable | Where to set | Purpose |
|---|---|---|
| `VITE_DRIVE_FILE_ID` | `.env.local` + GitHub Secrets + Vercel | Google Drive file ID |
| `VITE_DRIVE_API_KEY` | `.env.local` + GitHub Secrets + Vercel | Google Drive API key |
| `VITE_APP_NAME` | `.env.local` (optional) | App display name |

---

## Updating the Product Catalogue

```
1. Edit TestData.xlsx locally
2. Go to drive.google.com → right-click file → Upload new version
3. Open the app → click 🔄 Refresh in the header
4. Version badge updates immediately
```

The 2-hour cache auto-refreshes for other users without manual intervention.

---

## Daily Quote Number Format

```
QT-1747295834123
     └──────────── Date.now() in milliseconds (long integer)
```

- Guaranteed unique per session
- No expiry date on any quote

---

## License

Private — internal use only.
