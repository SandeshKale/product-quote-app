import { useState, useCallback, useMemo } from 'react';
import { GST_RATE } from '../constants/columnMap';

/**
 * Manages quote cart.
 *
 * Margin slider formula (from updated Excel):
 *   newPostTax = avgLanding / (1 - newMarginDecimal)
 *   newPreTax  = newPostTax / (1 + GST_RATE)   ← GST_RATE = 0.18 (hardcoded)
 *
 * marginPercent and avgLanding must never appear in QuoteTemplate or totals.
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
    if (qty <= 0) {
      // Remove item when qty drops to 0 (#4)
      setItems((prev) => prev.filter((i) => i.product.articleCode !== articleCode));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.articleCode === articleCode ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearQuote = useCallback(() => setItems([]), []);

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
   * Returns items with adjusted dealer prices for a given margin %.
   * Uses the Excel formula: PostTax = AvgLanding/(1-m), PreTax = PostTax/1.18
   */
  const getAdjustedItems = useCallback(
    (marginPercent) => {
      return items.map(({ product, quantity }) => {
        const m = Math.min(Math.max(marginPercent / 100, 0), 0.99);
        const adjPostTax =
          product.avgLanding > 0 ? product.avgLanding / (1 - m) : product.dealerPricePostTax;
        const adjPreTax = adjPostTax / (1 + GST_RATE);
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

  // Items for QuoteTemplate — sensitive fields stripped
  const quoteTemplateItems = useMemo(
    () =>
      items.map(({ product, quantity }) => ({
        serialNo: product.serialNo,
        articleCode: product.articleCode,
        articleName: product.articleName,
        category: product.category,
        dimensions: product.dimensions,
        stockStatus: product.stockStatus,
        mrp: product.mrp,
        rrp: product.rrp,
        dealerPricePreTax: product.dealerPricePreTax,
        dealerPricePostTax: product.dealerPricePostTax,
        quantity,
        lineTotal: product.dealerPricePostTax * quantity,
        // marginPercent and avgLanding intentionally absent
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
