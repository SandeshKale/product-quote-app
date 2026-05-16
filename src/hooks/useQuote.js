import { useState, useCallback, useMemo } from 'react';

/**
 * Manages the quote cart state.
 * marginPercent is available on each item for display in the quote panel.
 * It must never appear in the totals object or be passed to QuoteTemplate.
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
    const qty = Math.max(1, Math.floor(quantity));
    setItems((prev) =>
      prev.map((i) => (i.product.articleCode === articleCode ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearQuote = useCallback(() => setItems([]), []);

  // Computed totals — margin % intentionally excluded
  const totals = useMemo(() => {
    return items.reduce(
      (acc, { product, quantity }) => ({
        totalMRP: acc.totalMRP + product.mrp * quantity,
        totalRRP: acc.totalRRP + product.rrp * quantity,
        totalDealerPreTax: acc.totalDealerPreTax + product.dealerPricePreTax * quantity,
        totalDealerPostTax: acc.totalDealerPostTax + product.dealerPricePostTax * quantity,
      }),
      { totalMRP: 0, totalRRP: 0, totalDealerPreTax: 0, totalDealerPostTax: 0 }
    );
  }, [items]);

  // Items shaped for QuoteTemplate — margin fields stripped
  const quoteTemplateItems = useMemo(
    () =>
      items.map(({ product, quantity }) => ({
        serialNo: product.serialNo,
        articleCode: product.articleCode,
        articleName: product.articleName,
        category: product.category,
        mrp: product.mrp,
        rrp: product.rrp,
        dealerPricePreTax: product.dealerPricePreTax,
        gstRate: product.gstRate,
        dealerPricePostTax: product.dealerPricePostTax,
        quantity,
        lineTotal: product.dealerPricePostTax * quantity,
        // marginPercent: intentionally absent — never passed to QuoteTemplate
      })),
    [items]
  );

  return {
    items, // full items with marginPercent for quote panel display
    totals, // price totals only — no margin
    quoteTemplateItems, // margin-free items for the quote image
    addItem,
    removeItem,
    updateQuantity,
    clearQuote,
    itemCount: items.length,
  };
}
