# Changelog

All notable changes to Smart Quote Generator are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — In Progress

### Added
- Dark / light mode toggle with localStorage persistence
- App version badge in header (git SHA, injected at CI build time)
- Margin slider in Quote Panel — recalculates dealer prices live using Excel formula
  `Post-Tax = Cost / (1 - Margin%)` and `Pre-Tax = Post-Tax / (1 + GST)`
- Side-by-side original vs adjusted price comparison in Quote Panel totals
- Quote title rename — editable before sharing
- Template type selector (Detailed / Simple)
- Dimensions column support in parser, search scoring, product cards, and filter dropdown
- `getAdjustedItems` hook for margin-based recalculation

### Changed
- **CRITICAL FIX**: Excel parser now reads Row 3 as headers (`range: 2`) —
  previous parser read Row 1 (display labels), causing 0 products to load
- Quote bar (`View Quote`) is now `position: fixed` to the bottom viewport edge
- Search bar is now `position: sticky` to the top of the product column
- Filter sidebar is now `position: sticky` — stays in place while products scroll
- Quote number removed from generated quote image
- Totals row now appears in `<tfoot>` aligned below each column
- Each quote line now shows Dealer Pre-Tax value
- Cart button shows live count ("In cart: 3") instead of "Add Again"
- Qty decrease to 0 now removes item from cart (no minimum-of-1 clamp)
- GST rate filter removed from sidebar
- Last-updated timestamp now visible on mobile
- Dimensions filter is a multi-select dropdown (only shown when data has the column)

### Removed
- GST rate filter
- Quote number from quote image

---

## [1.0.0] — 2026-05-16

### Added
- Initial release — elastic search, quote builder, Google Drive sync,
  html2canvas PNG export, native Web Share API, Vercel serverless proxy,
  GitHub Actions CI with 80% coverage gate
