import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Product } from '../data/products';

// The shopping bag is stored locally in the browser. Prices are snapshots
// from when an item was added; anything still "Price on request" is
// confirmed by the store team on WhatsApp before payment — the site never
// takes payment online.
export interface CartItem {
  slug: string;
  name: string;
  code?: string;
  price: number | null;
  qty: number;
}

interface CartApi {
  items: CartItem[];
  count: number;
  add: (product: Product, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartApi | null>(null);
const STORAGE_KEY = 'industrial-aqua-cart-v1';

function readStored(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.slug === 'string' && item.qty > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() => readStored());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (private mode) — the bag still works per session.
    }
  }, [items]);

  const api = useMemo<CartApi>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      add(product, qty = 1) {
        setItems((current) => {
          const existing = current.find((item) => item.slug === product.slug);
          if (existing) {
            return current.map((item) =>
              item.slug === product.slug ? { ...item, qty: item.qty + qty } : item,
            );
          }
          return [
            ...current,
            { slug: product.slug, name: product.name, code: product.code, price: product.price, qty },
          ];
        });
      },
      remove(slug) {
        setItems((current) => current.filter((item) => item.slug !== slug));
      },
      setQty(slug, qty) {
        setItems((current) =>
          qty <= 0
            ? current.filter((item) => item.slug !== slug)
            : current.map((item) => (item.slug === slug ? { ...item, qty } : item)),
        );
      },
      clear() {
        setItems([]);
      },
    }),
    [items],
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}

/** Known total of the priced items; null when everything is on-request. */
export function cartPricedTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price ?? 0) * item.qty, 0);
}

export function cartHasUnpriced(items: CartItem[]): boolean {
  return items.some((item) => item.price === null);
}
