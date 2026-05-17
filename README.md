# Smart Quote Generator

A production-grade React web app for searching a Google Drive-hosted product catalogue and generating professional quote images that can be shared natively on iOS, Android, and desktop.

**Live app:** [smart-quote-one.vercel.app](https://smart-quote-one.vercel.app)
**Repo:** [github.com/SandeshKale/product-quote-app](https://github.com/SandeshKale/product-quote-app)

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Excel Catalogue Format](#excel-catalogue-format)
5. [Features In Detail](#features-in-detail)
6. [Project Structure](#project-structure)
7. [Data Flow](#data-flow)
8. [Search Engine](#search-engine)
9. [Margin Slider Formula](#margin-slider-formula)
10. [Quote Export Pipeline](#quote-export-pipeline)
11. [Environment Variables](#environment-variables)
12. [Local Development](#local-development)
13. [Scripts Reference](#scripts-reference)
14. [Testing and Coverage](#testing-and-coverage)
15. [CI/CD Pipeline](#cicd-pipeline)
16. [Deployment — Vercel](#deployment--vercel)
17. [Updating the Catalogue](#updating-the-catalogue)
18. [Margin Visibility Rules](#margin-visibility-rules)

---

## What It Does

Smart Quote Generator lets a dealer:

1. **Search 81+ products** by name, code, category, or dimensions using a multi-field elastic scoring engine
2. **Filter** by category, stock status, dimensions, MRP/RRP range, and margin %
3. **Build a quote** by adding products to a cart and adjusting quantities
4. **Adjust margins per item** using a touch-friendly slider — prices recalculate live from the Excel cost formula
5. **Generate a professional quote image** (PNG, 2x resolution) captured off-screen
6. **Share instantly** via the native iOS/Android share sheet, or download directly on desktop

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Vite 7 + React 18 | SPA, CSS Modules |
| Excel parsing | SheetJS (xlsx 0.18) | Row 1 headers, Indian number format handling |
| Quote image | html2canvas 1.4 | 2x scale, off-screen render |
| Icons | lucide-react 0.383 | Tree-shaken |
| Prop validation | prop-types | ESLint-enforced |
| Tests | Vitest 1.6 + Testing Library | jsdom environment |
| Coverage | @vitest/coverage-v8 | 80% gate on all 4 metrics |
| Linting | ESLint 8 + Prettier 3 | Zero warnings policy |
| CI | GitHub Actions | Ubuntu 22, Node 20 |
| Hosting | Vercel | Serverless functions for Drive proxy |
| Data source | Google Drive (.xlsx) | API v3, fetched server-side |

---

## Architecture

```
BROWSER (React SPA)
  useDataSync --> /api/excel     --> Google Drive v3  (Excel binary)
              --> /api/metadata  --> Google Drive v3  (name + modifiedTime)

  useSearch   --> searchEngine.js  (multi-field scoring + filter pipeline)
  useQuote    --> enrichedItems    (per-item margin overrides)
              --> adjustedTotals   (orig + adj split, margin rupee value)

  QuoteTemplate (off-screen DOM) --> html2canvas --> PNG blob
    --> navigator.share({ files: [png] })    mobile share sheet
    --> anchor.click()                        desktop download fallback

         auto-deploys on push to main
VERCEL
  api/excel.js    -- proxies Drive file fetch (no CORS restrictions)
  api/metadata.js -- proxies Drive metadata   (no CORS restrictions)
  dist/           -- static React SPA

         every push triggers
GITHUB ACTIONS
  ESLint -> Prettier -> Vitest (80% gate) -> Vite build
```

### Why a Vercel serverless proxy?

Google Drive's download API blocks direct browser fetches from third-party origins (CORS). The two serverless functions fetch from googleapis.com **server-side** — no CORS restrictions apply — then stream the response to the browser. The API key never appears in the client bundle.

---

## Excel Catalogue Format

The app reads a single `.xlsx` file from Google Drive. **Row 1 must be the header row.**

| Column | Header | Type | Notes |
|---|---|---|---|
| A | `Sr. No.` | Integer | Row sequence number |
| B | `Article Code` | String | e.g. `534.84.523` |
| C | `ArticleName` | String | Full product name |
| D | `ProductGroup` | String | e.g. `Appliances` |
| E | `ProductCategory` | String | e.g. `Cooker Hoods`, `Hobs`, `Ovens` |
| F | `Dimensions` | String | e.g. `Chimney - 90cm`, `Hob - 30cm` |
| G | `StockStatus` | String | `Good` or `Discntd` |
| H | `Stock` | Integer | Warehouse quantity |
| I | `Q2 MRP` | Number | Maximum retail price |
| J | `Q2 RRP` | Number | Recommended retail price (may be Indian-formatted string) |
| K | `Dealer Price - pre-tax` | Formula | `= Dealer Post-Tax / 1.18` |
| L | `Dealer Price Post tax` | Formula | `= Avg Landing / (1 - Margin)` |
| M | `Margin` | Decimal | e.g. `0.13` = 13% |
| N | `Avg Landing` | Number | Cost/landing price (formerly `Cost`) |

### Key formula relationships

```
Dealer Post-Tax  =  Avg Landing  /  (1 - Margin)
Dealer Pre-Tax   =  Dealer Post-Tax  /  1.18       <- GST hardcoded at 18%
```

GST is no longer a per-row column. The parser recalculates both dealer prices from `Avg Landing` and `Margin` to ensure consistency regardless of what is in the formula columns.

### Edge cases handled

- Some `Q2 RRP` cells are Indian-formatted strings (`"1,12,442"`) — commas are stripped before parsing
- Rows where both `Article Code` and `ArticleName` are empty are silently discarded

---

## Features In Detail

### 1. Elastic Product Search

- Single search bar — auto-searches every keystroke with a **200 ms debounce**
- Searches all text fields simultaneously using the scoring engine below
- Result count shown: `81 products found` / `1 product found` / `No products found`
- Search bar is **position:sticky** to the top of the product column while scrolling
- On mobile, the Filters button pins alongside the search bar

### 2. Sidebar Filters

All filters compose with AND logic. The sidebar fills the viewport height and scrolls independently, staying pinned while the product list scrolls.

| Filter | UI | Behaviour |
|---|---|---|
| Stock Status | Checkboxes | `In Stock` / `Discontinued` |
| Category | Checkboxes | Dynamically populated from data |
| Dimensions | Searchable multi-select dropdown | Live search, count badge, clear button |
| MRP Range | Number inputs (min / max) | Filters by `Q2 MRP` |
| RRP Range | Number inputs (min / max) | Filters by `Q2 RRP` |
| Margin % | Number inputs (min / max) | Filters by `Margin` decimal |

GST rate filter was removed — GST is always 18%.

### 3. Product Cards

Each card displays:

- Article code (monospace font)
- Stock status badge: `In Stock: 125` (green) or `Discontinued · Stock: 5` (red, dashed border)
- Category badge
- Product name
- Dimensions (when present in data)
- MRP, RRP, Dealer Post-Tax, Margin %
- GST rate
- **Add to Quote** button — shows **`In cart: N`** with the live quantity once added

### 4. Quote Builder (Quote Panel)

Opens as a slide-in panel from the right edge.

**Per-item controls:**

- Article code and product name
- **Price comparison table** with two columns when margin is overridden:
  - `Original (X%)` — Pre-Tax and Post-Tax at Excel margin
  - `Adjusted (Y%)` — Pre-Tax and Post-Tax at slider margin
- **Per-item margin slider** — range 0–50%, step 0.5%
  - 28 px circular thumb with white border and drop shadow for ergonomic mobile touch
  - 6 px track height
  - 8 px vertical padding (36 px total touch area)
  - Live price recalculation as slider moves
  - Shows current margin % and a reset (rotateCCW) button when overridden
- Quantity `−` / `+` controls — decrementing below 1 **removes the item entirely**
- Line total shown as adjusted post-tax × qty
- Trash icon to remove item

**Panel-level features:**

- **Editable quote title** — pencil icon, defaults to app name, flows into the generated image header
- **Template selector** — Detailed or Simple
- **Weighted average margin** (shown when any item is overridden):
  ```
  Weighted avg margin:   18%   ₹12,345
  ```
  Percentage formula: `1 - sum(avgLanding × qty) / sum(adjPostTax × qty)`
  Rupee value: `sum(adjPostTax × qty) - sum(avgLanding × qty)`
- **Totals section** — four rows (MRP, RRP, Dealer Pre-Tax, Dealer Post-Tax), shown as two columns (Original / Adjusted) when overrides are active
- **Share button** — triggers native iOS/Android share sheet with PNG attached; shows `Loader2` spinner and text `Sharing…` immediately on click
- **Download button** — icon-only, bypasses share sheet, triggers direct PNG download; shows `Loader2` spinner immediately on click
- Both buttons disable while either is in progress

### 5. Quote Image Generation

`QuoteTemplate` renders off-screen as a real DOM node (`left: -9999px`). `html2canvas` captures it at 2× scale for crisp Retina output.

**Detailed template:**
- Dark navy header: title + date
- Table columns: `#` / Code / Product (name + category + dimensions) / Qty / MRP / RRP / Dealer Pre-Tax / Dealer Post-Tax
- Styled `TOTALS` footer row in `<tfoot>`, aligned under each column

**Simple template:**
- Plain table only — no header, no footer
- 1 px solid black borders on all cells
- No alternating row colours, no colour fills

**What the image never contains:**
- Margin % or cost/Avg Landing
- Quote number
- Expiry date
- `(Orig)` or `(Adj)` column labels — prices shown are always the final adjusted values with plain column names

### 6. Google Drive Sync

- Excel fetched via Vercel serverless proxy (no browser CORS issue)
- **2-hour cache** in `localStorage` — keys `pq_products_v1`, `pq_metadata_v1`, `pq_timestamp_v1`
- On cache hit: data served instantly with no background refresh
- On cache miss or manual refresh: fetches fresh data and updates cache
- On fetch failure: serves stale cache with warning banner in header
- **Version badge** in header shows filename and last-modified time:
  `TestData.xlsx · Updated 17 May 2026 at 2:12 AM`
- Manual **Refresh** button always visible in header

### 7. Dark / Light Mode

- Toggle button in header (Moon / Sun icon)
- Full CSS variable token set (`[data-theme="dark"]`) — no hardcoded colours in components
- Persisted to `localStorage` key `pq_dark`
- Applied via `data-theme` attribute on `<html>` element

### 8. App Version Badge

- Shown in header as `v1a2b3c4` (first 7 characters of git commit SHA)
- Injected at build time via `VITE_APP_VERSION=$VERCEL_GIT_COMMIT_SHA` in `vercel.json`
- Shows `vdev` in local development

### 9. Easter Egg

Click the version badge **5 times** to reveal an animated link to the developer's GitHub profile. A tooltip counts down with each click (`4 more…`, `3 more…`, …). Clicking the revealed link closes it.

---

## Project Structure

```
product-quote-app/
|
+-- api/
|   +-- excel.js              Vercel serverless: proxies Google Drive file download
|   +-- metadata.js           Vercel serverless: proxies Google Drive metadata
|
+-- src/
|   +-- App.jsx               Root component -- wires all hooks and components
|   +-- App.module.css        Full-page layout, sticky search + quote bars
|   +-- index.css             Global design tokens (light + dark themes), reset
|   +-- main.jsx              React 18 createRoot entry point
|   |
|   +-- constants/
|   |   +-- columnMap.js      Excel column -> JS property mapping, GST_RATE, APP_NAME, APP_VERSION
|   |
|   +-- components/
|   |   +-- Header/           App name, version badge (easter egg), timestamp, dark toggle, refresh
|   |   +-- SearchBar/        Debounced input, sticky to top of main column
|   |   +-- FilterSidebar/    All filters, searchable Dimensions dropdown with outside-click close
|   |   +-- ProductList/      ProductCard with stock badges and live cart count
|   |   +-- QuotePanel/       Per-item sliders, price table, share + download with spinners
|   |   +-- QuoteTemplate/    Off-screen html2canvas capture target (margin-free)
|   |
|   +-- hooks/
|   |   +-- useDataSync.js    Drive fetch, 2h localStorage cache, stale fallback
|   |   +-- useSearch.js      200ms debounce, filter state, derived category/dimension lists
|   |   +-- useQuote.js       Cart, per-item margin overrides, enrichedItems, adjustedTotals
|   |
|   +-- services/
|   |   +-- driveService.js   fetch('/api/excel') and fetch('/api/metadata')
|   |   +-- searchEngine.js   Multi-field scoring, Levenshtein fuzzy, filter pipeline
|   |   +-- quoteExporter.js  html2canvas -> PNG -> navigator.share() or download
|   |
|   +-- utils/
|       +-- excelParser.js    SheetJS -> normalised products, formula recalculation, Indian numbers
|       +-- formatters.js     formatCurrency, formatMargin, formatDateTime, formatDateShort
|
+-- .github/workflows/ci.yml  GitHub Actions: lint -> format -> test (80% gate) -> build
+-- .env.example              Local secrets template
+-- .eslintrc.cjs             ESLint: react, hooks, no-unused-vars (^_ exempted)
+-- .prettierrc               Formatting config
+-- CHANGELOG.md              Version history
+-- index.html                Google Fonts preconnect, root div
+-- package.json
+-- vercel.json               Build command, SPA rewrite, api/ exclusion from rewrite
+-- vite.config.js            Vitest config, 80% coverage thresholds, dev proxy for /api/*
```

---

## Data Flow

```
App load
  useDataSync.load()
    Cache valid? Yes -> setProducts(cached), status='ready', no network call
    No           -> fetch('/api/excel') + fetch('/api/metadata') in parallel
                     Success -> parseExcel(buffer), writeCache, status='ready'
                     Failure -> stale cache? status='stale' : status='error'

User types in search bar
  useSearch: setQuery(term)
    200ms debounce fires -> searchEngine(term, products, filters)
      scoreProduct() * N -> sort by _score desc -> applyFilters() -> results

User adds product
  useQuote.addItem(product)
    enrichedItems recomputes -> adjustedTotals recomputes
    Quote bar shows itemCount + adjusted dealer post-tax total

User moves margin slider on item X
  useQuote.setItemMargin(articleCode, pct)
    marginOverrides[articleCode] = pct
    enrichedItems: adjPostTax = avgLanding / (1 - pct/100)
                   adjPreTax  = adjPostTax / 1.18
    adjustedTotals: orig + adj column totals + totalMarginValue
    weightedMarginPct: 1 - sum(landing*qty) / sum(adjPost*qty)

User taps Share
  handleShare() -> setIsSharing(true) -> Loader2 spinner appears immediately
    exportAndShare(templateRef, quoteNumber, forceDownload=false)
      html2canvas(templateRef.current, { scale: 2 })
      canvas.toBlob() -> File('QT-xxx.png')
      navigator.canShare({ files }) ?
        Yes -> navigator.share({ title, files })   -- iOS/Android sheet
        No  -> anchor.download click               -- desktop fallback
```

---

## Search Engine

File: `src/services/searchEngine.js`

### Scoring

| Field | Match type | Points |
|---|---|---|
| `ArticleName` | Exact word | **125** |
| `ArticleName` | Partial contains | **100** |
| `ArticleName` | Word starts with term | +25 bonus |
| `Article Code` | Exact | **100** |
| `Article Code` | Partial contains | **75** |
| `ProductCategory` | Contains | **25** |
| `Dimensions` | Contains | **20** |
| Fuzzy on `ArticleName` | Levenshtein distance 1 | 10 |
| Fuzzy on `ArticleName` | Levenshtein distance 2 | 5 |

Fuzzy matching fires only when `score === 0` AND `term.length >= 3`. It checks against individual words in the product name only — not code or category — to prevent false positives while catching obvious typos.

### Filter pipeline

After scoring, `applyFilters()` removes any product failing any active filter (all ANDed):

- `categories[]` — product category must be in the selected list
- `mrpRange.{min,max}` — MRP within range
- `rrpRange.{min,max}` — RRP within range
- `marginRange.{min,max}` — margin decimal within range
- `dimensions[]` — product dimensions value must be in selected list
- `stockStatus[]` — `Good` or `Discntd` must match

---

## Margin Slider Formula

Derived directly from the Excel formula column definitions:

```
Dealer Post-Tax  =  Avg Landing  /  (1 - margin_decimal)
Dealer Pre-Tax   =  Dealer Post-Tax  /  1.18
```

`margin_decimal` is clamped to `[0, 0.99]`.

**Example** — `Avg Landing = 47,482`, slider at `20%`:

```
Post-Tax  = 47,482 / (1 - 0.20)  = 47,482 / 0.80  = 59,352
Pre-Tax   = 59,352 / 1.18                           = 50,298
```

### Weighted average margin

When any item has a margin override, the panel shows:

```
weightedMarginPct  =  1  -  sum(avgLanding_i * qty_i)  /  sum(adjPostTax_i * qty_i)
totalMarginValue   =  sum(adjPostTax_i * qty_i)  -  sum(avgLanding_i * qty_i)
```

Displayed as `18% · Rs.12,345`.

---

## Quote Export Pipeline

```
src/services/quoteExporter.js

exportAndShare(templateRef, quoteNumber, forceDownload = false)
  |
  +-- html2canvas(templateRef.current, {
  |     scale: 2,            <- 2x for Retina/HDPI clarity
  |     useCORS: true,
  |     backgroundColor: '#ffffff',
  |     logging: false
  |   })
  |
  +-- canvas.toBlob(cb, 'image/png', 1.0)
  |
  +-- new File([blob], `${quoteNumber}.png`, { type: 'image/png' })
  |
  +-- if (!forceDownload && navigator.canShare({ files: [file] }))
  |     navigator.share({ title: quoteNumber, files: [file] })
  |       AbortError -> { method: 'share', aborted: true }
  |       Success    -> { method: 'share', success: true }
  |
  +-- else (forceDownload=true OR canShare=false)
        URL.createObjectURL -> anchor.click() -> URL.revokeObjectURL()
        -> { method: 'download', success: true }
```

---

## Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `VITE_DRIVE_FILE_ID` | `.env.local`, GitHub Secrets, Vercel dashboard | Google Drive file ID |
| `VITE_DRIVE_API_KEY` | `.env.local`, GitHub Secrets, Vercel dashboard | Google Drive API key |
| `VITE_APP_NAME` | `.env.local` (optional) | Header title (default: `Smart Quote Generator`) |
| `VITE_APP_VERSION` | Injected by CI and Vercel build | Git SHA shown in header |
| `VERCEL_GIT_COMMIT_SHA` | Vercel system variable | Source for version — never set manually |

`.env.local` template:

```bash
VITE_DRIVE_FILE_ID=your_google_drive_file_id
VITE_DRIVE_API_KEY=your_google_drive_api_key
VITE_APP_NAME=Smart Quote Generator
```

`.env.local` is gitignored and never committed. The API key is only used inside Vercel serverless functions and is never included in the client-side JS bundle.

---

## Local Development

### Prerequisites

- Node.js 20+
- npm 9+

### Setup

```bash
git clone https://github.com/SandeshKale/product-quote-app.git
cd product-quote-app
npm install
cp .env.example .env.local
# Edit .env.local with your Drive file ID and API key
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### How the Drive proxy works locally

`vite.config.js` sets up a dev-server proxy so `/api/*` routes are transparently rewritten to googleapis.com using the env vars from `.env.local`:

```
GET /api/excel    -> https://www.googleapis.com/drive/v3/files/{ID}?alt=media&key={KEY}
GET /api/metadata -> https://www.googleapis.com/drive/v3/files/{ID}?fields=name,modifiedTime&key={KEY}
```

The app behaves identically to production without needing `vercel dev`.

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with HMR at localhost:5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint — max-warnings 0 |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier — write all `src/` files |
| `npm run format:check` | Prettier — check only (used in CI) |
| `npm run test` | Run all 216 tests once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Tests + V8 coverage report in `coverage/index.html` |
| `npm run test:ui` | Open Vitest browser UI |
| `npm run ci` | Full local CI: lint -> format:check -> test:coverage -> build |

---

## Testing and Coverage

### Run

```bash
npm run test             # fast, no coverage
npm run test:coverage    # generates coverage/index.html
```

### Current numbers

**216 tests across 15 test files**

| Metric | Threshold | Current |
|---|---|---|
| Statements | 80% | 98.6% |
| Branches | 80% | 87.9% |
| Functions | 80% | 87.8% |
| Lines | 80% | 98.6% |

The CI pipeline fails and the build is blocked if any metric drops below 80%.
Coverage is configured in `vite.config.js`. The `api/` directory is excluded (Vercel serverless functions are not testable in jsdom).

### What's covered

| Module | Key scenarios |
|---|---|
| `searchEngine` | Name priority, partial code, category, dimensions, fuzzy, all filter types, `_score` stripped |
| `excelParser` | Column mapping, formula recalculation, Indian number strings, discontinued rows, empty row filtering |
| `driveService` | Proxy URLs (`/api/excel`, `/api/metadata`), HTTP errors, network failures |
| `quoteExporter` | html2canvas at scale 2, `navigator.share`, `AbortError`, `forceDownload=true`, download fallback |
| `useSearch` | 200ms debounce timing, all filter types, `availableDimensions`, `clearFilters` |
| `useQuote` | Add/increment, qty 0 removes item, per-item margin override, `enrichedItems`, `adjustedTotals`, weighted margin, `quoteTemplateItems` never contains `marginPercent` or `avgLanding` |
| `useDataSync` | Cache hit/miss, stale fallback on error, `forceRefresh`, localStorage write |
| `QuoteTemplate` | Never renders margin, never renders expiry, `TOTALS` in tfoot, plain column headers, no `(Adj)` labels |
| `QuotePanel` | Per-item slider calls `setItemMargin`, download calls `exportAndShare(_, _, true)`, per-button spinner state |
| `Header` | Easter egg: 5 clicks reveals GitHub link, tooltip countdown |
| `FilterSidebar` | Dimensions dropdown search, outside-click close, all range inputs, stockStatus toggle |

---

## CI/CD Pipeline

Every push to any branch, and every PR to `main`, triggers the pipeline:

```
GitHub Actions (ubuntu-latest, Node 20)

  npm ci
  ESLint          -- max-warnings 0
  Prettier check  -- format:check
  Vitest          -- 80% gate on statements, branches, functions, lines
  Upload coverage artifact (7-day retention)
  Vite build
  Upload dist artifact (1-day retention)
```

### Recommended branch protection for `main`

Settings -> Branches -> Add rule:

```
Required status check: "Lint · Test · Build"
Require branches to be up to date before merging
Do not allow bypassing the above settings
```

---

## Deployment — Vercel

### vercel.json

```json
{
  "buildCommand": "VITE_APP_VERSION=$VERCEL_GIT_COMMIT_SHA npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

- `VERCEL_GIT_COMMIT_SHA` is a Vercel system environment variable — available automatically in the build shell
- The rewrite rule excludes `/api/*` so serverless functions are not caught by the SPA fallback

### Required environment variables in Vercel dashboard

Settings -> Environment Variables -> add for Production + Preview + Development:

| Name | Value |
|---|---|
| `VITE_DRIVE_FILE_ID` | your Drive file ID |
| `VITE_DRIVE_API_KEY` | your Drive API key |

### Google Cloud API key settings

The API key is called only from Vercel serverless functions (server-to-server). Recommended settings in Google Cloud Console:

- **Application restrictions:** None (server-side calls have no browser referrer header)
- **API restrictions:** Google Drive API only

---

## Updating the Catalogue

```
1. Edit your Excel file locally (add/update products, change prices)
2. Go to drive.google.com
3. Right-click the existing file -> "Upload new version" (keep the same file)
4. Open the app -> click the Refresh button in the header
5. Version badge updates: "TestData.xlsx · Updated 17 May 2026 9:00 AM"
```

Other users get the new data automatically when their 2-hour cache expires, or immediately if they click Refresh.

---

## Margin Visibility Rules

Margin % and cost price (`Avg Landing`) are confidential. The app enforces these rules in code:

| Location | Margin visible? | Notes |
|---|---|---|
| Product card | Yes | Shows `13%` under Dealer Post-Tax |
| Margin filter (sidebar) | Yes | Filter by min and max % |
| Quote panel per-item | Yes | Original % in slider header, overridden % in adjusted column |
| Quote panel weighted avg | Yes | Shown only when a slider is moved |
| `quoteTemplateItems` (hook output) | No | Fields stripped before passing to QuoteTemplate |
| `adjustedTotals` (hook output) | No | No margin field in totals object |
| Generated PNG (Detailed template) | No | Plain "Dealer Pre-Tax" / "Dealer Post-Tax" columns only |
| Generated PNG (Simple template) | No | Same, plain borders, no colour |
| Any `(Adj)` / `(Orig)` label in PNG | No | Column names are always unqualified |

Tests in `QuoteTemplate.test.jsx` explicitly assert that the strings `margin`, `avgLanding`, `(Adj)`, `expir`, and any expiry label are never present in the rendered output.

---

## License

Private — internal use only.
