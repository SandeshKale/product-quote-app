import { useState, useCallback, useMemo } from 'react';
import { GST_RATE } from '../constants/columnMap';

/**
 * Manages quote cart with per-item margin overrides.
 *
 * Margin slider formula (Excel):
 *   adjPostTax = avgLanding / (1 - margin)
 *   adjPreTax  = adjPostTax / (1 + GST_RATE)   [GST hardcoded at 18%]
 *
 * marginPercent and avgLanding MUST NEVER appear in QuoteTemplate or totals.
 */
export function useQuote() {
  const [items, setItems] = useState([]);
  const [marginOverrides, setMarginOverrides] = useState({}); // { [articleCode]: 0-99 (%) }

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.articleCode === product.articleCode);
      if (existing) {
        return prev.map((i) =>
          i.product.articleCode === product.articleCode ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((articleCode) => {
    setItems((prev) => prev.filter((i) => i.product.articleCode !== articleCode));
    setMarginOverrides((prev) => {
      const next = { ...prev };
      delete next[articleCode];
      return next;
    });
  }, []);

  const updateQuantity = useCallback((articleCode, quantity) => {
    const qty = Math.floor(quantity);
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.articleCode !== articleCode));
      setMarginOverrides((prev) => {
        const n = { ...prev };
        delete n[articleCode];
        return n;
      });
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.articleCode === articleCode ? { ...i, quantity: qty } : i))
    );
  }, []);

  /** Set per-item margin override (value in %, e.g. 20 = 20%) */
  const setItemMargin = useCallback((articleCode, marginPct) => {
    setMarginOverrides((prev) => ({ ...prev, [articleCode]: marginPct }));
  }, []);

  /** Reset a single item's margin to the Excel value */
  const resetItemMargin = useCallback((articleCode) => {
    setMarginOverrides((prev) => {
      const n = { ...prev };
      delete n[articleCode];
      return n;
    });
  }, []);

  const clearQuote = useCallback(() => {
    setItems([]);
    setMarginOverrides({});
  }, []);

  /** Compute adjusted price for one item given a margin decimal (0-0.99) */
  function adjPrices(product, marginDecimal) {
    const m = Math.min(Math.max(marginDecimal, 0), 0.99);
    const postTax =
      product.avgLanding > 0 ? product.avgLanding / (1 - m) : product.dealerPricePostTax;
    return {
      adjDealerPostTax: postTax,
      adjDealerPreTax: postTax / (1 + GST_RATE),
    };
  }

  /**
   * Items enriched with adjusted prices, using per-item margin overrides.
   * Falls back to the product's original Excel margin when no override set.
   */
  const enrichedItems = useMemo(
    () =>
      items.map(({ product, quantity }) => {
        const overridePct = marginOverrides[product.articleCode];
        const effectiveMarginDecimal =
          overridePct != null ? overridePct / 100 : product.marginPercent;
        const { adjDealerPostTax, adjDealerPreTax } = adjPrices(product, effectiveMarginDecimal);
        const isOverridden = overridePct != null;
        return {
          product,
          quantity,
          effectiveMarginPct: Math.round(effectiveMarginDecimal * 1000) / 10, // 1 decimal
          effectiveMarginDec: effectiveMarginDecimal,
          adjDealerPostTax,
          adjDealerPreTax,
          origDealerPostTax: product.dealerPricePostTax,
          origDealerPreTax: product.dealerPricePreTax,
          origMarginPct: Math.round(product.marginPercent * 1000) / 10, // 1 decimal
          isOverridden,
          adjLineTotal: adjDealerPostTax * quantity,
          origLineTotal: product.dealerPricePostTax * quantity,
        };
      }),
    [items, marginOverrides]
  );

  /** Standard totals using original Excel prices — no margin fields */
  const totals = useMemo(
    () =>
      items.reduce(
        (acc, { product, quantity }) => ({
          totalMRP: acc.totalMRP + product.mrp * quantity,
          totalRRP: acc.totalRRP + product.rrp * quantity,
          totalDealerPreTax: acc.totalDealerPreTax + product.dealerPricePreTax * quantity,
          totalDealerPostTax: acc.totalDealerPostTax + product.dealerPricePostTax * quantity,
        }),
        { totalMRP: 0, totalRRP: 0, totalDealerPreTax: 0, totalDealerPostTax: 0 }
      ),
    [items]
  );

  /**
   * Adjusted totals — carries both original (Excel) and adjusted (slider) dealer prices.
   * totalMarginValue = adjusted post-tax revenue − avg landing cost (rupee profit).
   */
  const adjustedTotals = useMemo(() => {
    const acc = enrichedItems.reduce(
      (a, i) => ({
        totalMRP: a.totalMRP + i.product.mrp * i.quantity,
        totalRRP: a.totalRRP + i.product.rrp * i.quantity,
        // Original (Excel) dealer prices
        totalDealerPreTax: a.totalDealerPreTax + i.origDealerPreTax * i.quantity,
        totalDealerPostTax: a.totalDealerPostTax + i.origDealerPostTax * i.quantity,
        // Adjusted (slider) dealer prices
        totalAdjDealerPreTax: a.totalAdjDealerPreTax + i.adjDealerPreTax * i.quantity,
        totalAdjDealerPostTax: a.totalAdjDealerPostTax + i.adjDealerPostTax * i.quantity,
        // AvgLanding cost for margin-value calculation
        totalLandingCost:
          a.totalLandingCost +
          (i.product.avgLanding > 0 ? i.product.avgLanding : i.origDealerPostTax) * // fallback when avgLanding absent
            i.quantity,
      }),
      {
        totalMRP: 0,
        totalRRP: 0,
        totalDealerPreTax: 0,
        totalDealerPostTax: 0,
        totalAdjDealerPreTax: 0,
        totalAdjDealerPostTax: 0,
        totalLandingCost: 0,
      }
    );
    // Rupee margin = adjusted revenue − cost
    acc.totalMarginValue = acc.totalAdjDealerPostTax - acc.totalLandingCost;
    return acc;
  }, [enrichedItems]);

  /**
   * Weighted average effective margin across all items:
   *   = 1 - sum(avgLanding_i × qty_i) / sum(adjPostTax_i × qty_i)
   */
  const weightedMarginPct = useMemo(() => {
    const totalLanding = enrichedItems.reduce(
      (s, i) => s + (i.product.avgLanding || i.origDealerPostTax) * i.quantity,
      0
    );
    const totalAdj = enrichedItems.reduce((s, i) => s + i.adjDealerPostTax * i.quantity, 0);
    if (totalAdj === 0) return 0;
    return Math.round((1 - totalLanding / totalAdj) * 1000) / 10; // 1 decimal
  }, [enrichedItems]);

  const hasAnyOverride = useMemo(() => Object.keys(marginOverrides).length > 0, [marginOverrides]);

  /** Items for QuoteTemplate — sensitive fields stripped */
  const quoteTemplateItems = useMemo(
    () =>
      enrichedItems.map((ei) => ({
        serialNo: ei.product.serialNo,
        articleCode: ei.product.articleCode,
        articleName: ei.product.articleName,
        category: ei.product.category,
        dimensions: ei.product.dimensions,
        stockStatus: ei.product.stockStatus,
        mrp: ei.product.mrp,
        rrp: ei.product.rrp,
        dealerPricePreTax: ei.adjDealerPreTax,
        dealerPricePostTax: ei.adjDealerPostTax,
        quantity: ei.quantity,
        lineTotal: ei.adjLineTotal,
        origDealerPreTax: ei.origDealerPreTax,
        origDealerPostTax: ei.origDealerPostTax,
        origLineTotal: ei.origLineTotal,
        adjDealerPreTax: ei.adjDealerPreTax,
        adjDealerPostTax: ei.adjDealerPostTax,
        adjLineTotal: ei.adjLineTotal,
        isOverridden: ei.isOverridden,
        // marginPercent and avgLanding intentionally absent
      })),
    [enrichedItems]
  );

  return {
    items,
    enrichedItems,
    totals,
    adjustedTotals,
    quoteTemplateItems,
    marginOverrides,
    weightedMarginPct,
    hasAnyOverride,
    addItem,
    removeItem,
    updateQuantity,
    clearQuote,
    setItemMargin,
    resetItemMargin,
    itemCount: items.length,
  };
}
