import { useEffect, useState } from 'react';
import type { Product } from '../data/products';
import { loadProducts, localProducts } from './products';

// Local seed first (instant), then the live Firestore catalogue.
// `settled` flips true once the live load has resolved (or failed), so
// detail/finder pages can tell "not in the catalogue" apart from
// "still checking the live catalogue".
export function useProducts(): { products: Product[]; settled: boolean } {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let cancelled = false;
    loadProducts()
      .then((live) => {
        if (cancelled) return;
        if (live) setProducts(live);
        setSettled(true);
      })
      .catch(() => {
        if (!cancelled) setSettled(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return { products, settled };
}
