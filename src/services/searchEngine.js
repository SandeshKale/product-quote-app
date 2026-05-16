/**
 * Multi-field elastic search engine.
 *
 * Scoring priority:
 *   Product Name — 125 (exact word) / 100 (contains) / +25 starts-with bonus
 *   Article Code — 100 (exact) / 75 (contains)
 *   Category     — 25 (contains)
 *   Dimensions   — 20 (contains)
 *   StockStatus  — 15 (contains)
 *   Fuzzy (name) — 10/5 (edit dist 1/2), only when score=0
 */
export function searchEngine(query, products, filters) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const scored = products
    .map((p) => ({ ...p, _score: terms.length ? scoreProduct(p, terms) : 1 }))
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
    const cat = (product.category ?? '').toLowerCase();
    const dim = (product.dimensions ?? '').toLowerCase();

    // Product Name — highest priority
    if (name.includes(term)) {
      const words = name.split(/\s+/);
      score += words.some((w) => w === term) ? 125 : 100;
      if (words.some((w) => w.startsWith(term) && w !== term)) score += 25;
    }
    // Article Code
    if (code === term) score += 100;
    else if (code.includes(term)) score += 75;
    // Category
    if (cat.includes(term)) score += 25;
    // Dimensions
    if (dim && dim.includes(term)) score += 20;
    // Fuzzy fallback
    if (score === 0 && term.length >= 3) score += bestFuzzyScore(term, name);
  });
  return score;
}

export function levenshtein(a, b) {
  const m = [];
  for (let i = 0; i <= b.length; i++) {
    m[i] = [i];
    for (let j = 1; j <= a.length; j++) {
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
  return best <= 1 ? 10 : best <= 2 ? 5 : 0;
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
    if (filters.stockStatus?.length > 0 && !filters.stockStatus.includes(p.stockStatus))
      return false;
    return true;
  });
}
