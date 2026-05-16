/**
 * Multi-field elastic search engine.
 *
 * Scoring priority (descending):
 *   Product Name — 125 pts (exact word) / 100 pts (contains) / +25 starts-with bonus
 *   Article Code — 100 pts (exact) / 75 pts (contains)
 *   Category     — 25 pts (contains)
 *   Dimensions   — 20 pts (contains) — when column present
 *   Fuzzy (name) — 10 pts (edit dist=1) / 5 pts (edit dist=2), only when score=0
 *
 * Margin %, Cost, GST are never part of scoring (filter-only fields).
 * _score is stripped from returned objects.
 */

export function searchEngine(query, products, filters) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const scored = products
    .map((product) => ({
      ...product,
      _score: terms.length > 0 ? scoreProduct(product, terms) : 1,
    }))
    .filter((p) => p._score > 0);

  return applyFilters(scored, filters)
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...rest }) => rest);
}

function scoreProduct(product, terms) {
  let score = 0;

  terms.forEach((term) => {
    const name = (product.articleName ?? '').toLowerCase();
    const code = (product.articleCode ?? '').toLowerCase();
    const category = (product.category ?? '').toLowerCase();
    const dimensions = (product.dimensions ?? '').toLowerCase();

    // ── Product Name — highest priority ─────────────────────────────
    if (name.includes(term)) {
      const words = name.split(/\s+/);
      score += words.some((w) => w === term) ? 125 : 100;
      if (words.some((w) => w.startsWith(term) && w !== term)) score += 25;
    }

    // ── Article Code ─────────────────────────────────────────────────
    if (code === term) score += 100;
    else if (code.includes(term)) score += 75;

    // ── Category ─────────────────────────────────────────────────────
    if (category.includes(term)) score += 25;

    // ── Dimensions ───────────────────────────────────────────────────
    if (dimensions && dimensions.includes(term)) score += 20;

    // ── Fuzzy fallback ───────────────────────────────────────────────
    if (score === 0 && term.length >= 3) {
      score += bestFuzzyScore(term, name);
    }
  });

  return score;
}

export function levenshtein(a, b) {
  const rows = b.length + 1;
  const cols = a.length + 1;
  const m = [];
  for (let i = 0; i < rows; i++) {
    m[i] = [i];
    for (let j = 1; j < cols; j++) {
      m[i][j] =
        i === 0
          ? j
          : b[i - 1] === a[j - 1]
            ? m[i - 1][j - 1]
            : 1 + Math.min(m[i - 1][j], m[i][j - 1], m[i - 1][j - 1]);
    }
  }
  return m[b.length][a.length];
}

function bestFuzzyScore(term, text) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const best = Math.min(...words.map((w) => levenshtein(term, w)));
  if (best <= 1) return 10;
  if (best <= 2) return 5;
  return 0;
}

function applyFilters(products, filters) {
  return products.filter((p) => {
    if (filters.categories?.length > 0 && !filters.categories.includes(p.category)) return false;
    if (filters.mrpRange?.min != null && p.mrp < filters.mrpRange.min) return false;
    if (filters.mrpRange?.max != null && p.mrp > filters.mrpRange.max) return false;
    if (filters.rrpRange?.min != null && p.rrp < filters.rrpRange.min) return false;
    if (filters.rrpRange?.max != null && p.rrp > filters.rrpRange.max) return false;
    if (filters.marginRange?.min != null && p.marginPercent < filters.marginRange.min) return false;
    if (filters.marginRange?.max != null && p.marginPercent > filters.marginRange.max) return false;
    if (filters.dimensions?.length > 0 && !filters.dimensions.includes(p.dimensions)) return false;
    return true;
  });
}
