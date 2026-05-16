import { useState, useCallback, useMemo } from 'react';

/**
 * Manages the quote cart.
 *
 * Rules:
 * - marginPercent and cost available on items for quote panel display + slider.
 * - Neither appears in totals or quoteTemplateItems.
 * - If qty is 1 and user presses minus → item is removed automatically.
 *
 * Margin slider recalculation formula (from Excel):
 *   newPostTax = cost / (1 - newMarginDecimal)
 *   newPreTax  = newPostTax / (1 + gstRate)
 */
export function useQuote() {
  const [items, setItems] = useState([]);

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
  }, []);

  const updateQuantity = useCallback((articleCode, quantity) => {
    const qty = Math.floor(quantity);
    // If qty drops to 0 or below → remove item (change #4)
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.articleCode !== articleCode));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.articleCode === articleCode ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearQuote = useCallback(() => setItems([]), []);

  // Standard totals — no margin
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
   * Calculate adjusted totals and per-item prices for a given margin %.
   * Uses the Excel formula: PostTax = Cost/(1-m), PreTax = PostTax/(1+GST)
   */
  const getAdjustedItems = useCallback(
    (marginPercent) => {
      return items.map(({ product, quantity }) => {
        const m = Math.min(Math.max(marginPercent / 100, 0), 0.99);
        const adjPostTax = product.cost > 0 ? product.cost / (1 - m) : product.dealerPricePostTax;
        const adjPreTax = adjPostTax / (1 + product.gstRate);
        return {
          ...product,
          quantity,
          origDealerPostTax: product.dealerPricePostTax,
          origDealerPreTax: product.dealerPricePreTax,
          origMarginPercent: product.marginPercent,
          adjDealerPostTax: adjPostTax,
          adjDealerPreTax: adjPreTax,
          adjMarginPercent: m,
          adjLineTotal: adjPostTax * quantity,
          origLineTotal: product.dealerPricePostTax * quantity,
        };
      });
    },
    [items]
  );

  // Items for QuoteTemplate — all margin/cost fields stripped
  const quoteTemplateItems = useMemo(
    () =>
      items.map(({ product, quantity }) => ({
        serialNo: product.serialNo,
        articleCode: product.articleCode,
        articleName: product.articleName,
        category: product.category,
        dimensions: product.dimensions,
        mrp: product.mrp,
        rrp: product.rrp,
        dealerPricePreTax: product.dealerPricePreTax,
        gstRate: product.gstRate,
        dealerPricePostTax: product.dealerPricePostTax,
        quantity,
        lineTotal: product.dealerPricePostTax * quantity,
        // marginPercent and cost intentionally absent
      })),
    [items]
  );

  return {
    items,
    totals,
    quoteTemplateItems,
    addItem,
    removeItem,
    updateQuantity,
    clearQuote,
    getAdjustedItems,
    itemCount: items.length,
  };
}
