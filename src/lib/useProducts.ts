import { useEffect, useState } from 'react';
import type { Product } from '../data/products';
import { loadProducts, localProducts } from './products';

// Local seed first (instant), then the live Firestore catalogue — the
// pattern the shop and category pages already use.
export function useProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>(localProducts);
  useEffect(() => {
    let cancelled = false;
    loadProducts().then((live) => {
      if (!cancelled && live) setProducts(live);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return products;
}
