import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Product } from '../data/products';
import { clampQty, type CartItem } from './cart-model';

export type { CartItem } from './cart-model';

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
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.slug === 'string' &&
          typeof item.name === 'string' &&
          (item.price === null || (typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0)),
      )
      .map((item) => ({ ...item, qty: clampQty(item.qty) }));
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
        const addQty = clampQty(qty);
        setItems((current) => {
          const existing = current.find((item) => item.slug === product.slug);
          if (existing) {
            return current.map((item) =>
              item.slug === product.slug ? { ...item, qty: clampQty(item.qty + addQty) } : item,
            );
          }
          return [
            ...current,
            { slug: product.slug, name: product.name, code: product.code, price: product.price, qty: addQty },
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
            : current.map((item) => (item.slug === slug ? { ...item, qty: clampQty(qty) } : item)),
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
