import type { Product } from '../data/products';

// The shared cart model: item shape, quantity rules and verification
// against the live catalogue. Pure logic only — the React provider lives
// in cart.tsx and the pages consume these helpers, so cart behaviour is
// defined exactly once.
//
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

/** One shared quantity limit for every cart control on the site. */
export const MAX_QTY = 99;

export function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.min(MAX_QTY, Math.max(1, Math.trunc(qty)));
}

/** Known total of the priced items. */
export function cartPricedTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price ?? 0) * item.qty, 0);
}

export function cartHasUnpriced(items: CartItem[]): boolean {
  return items.some((item) => item.price === null);
}

/** True when at least one item carries a real price (which may total ₹0). */
export function cartHasPriced(items: CartItem[]): boolean {
  return items.some((item) => item.price !== null);
}

// --- Verification against the live catalogue --------------------------------
// The stored bag keeps a price snapshot from when an item was added. Before
// display and checkout, rows are reconciled with the live catalogue: the
// catalogue price wins, and a product that no longer exists is flagged
// unavailable instead of being silently ordered at a stale price.

export interface VerifiedCartItem {
  item: CartItem;
  /** False when the product is no longer in the live catalogue. */
  available: boolean;
  /** Verified live price when available; the stored snapshot otherwise. */
  price: number | null;
  /** True when the verified price differs from the stored snapshot. */
  priceChanged: boolean;
}

export function reconcileCart(items: CartItem[], products: Product[]): VerifiedCartItem[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return items.map((item) => {
    const live = bySlug.get(item.slug);
    if (!live) return { item, available: false, price: item.price, priceChanged: false };
    return { item, available: true, price: live.price, priceChanged: live.price !== item.price };
  });
}

/** Subtotal of available items at their verified prices. */
export function verifiedTotal(rows: VerifiedCartItem[]): number {
  return rows.reduce((sum, row) => sum + (row.available ? (row.price ?? 0) * row.item.qty : 0), 0);
}

export function verifiedHasPriced(rows: VerifiedCartItem[]): boolean {
  return rows.some((row) => row.available && row.price !== null);
}

export function verifiedHasUnpriced(rows: VerifiedCartItem[]): boolean {
  return rows.some((row) => row.available && row.price === null);
}

export function verifiedHasUnavailable(rows: VerifiedCartItem[]): boolean {
  return rows.some((row) => !row.available);
}

/** Cart items with verified prices merged in — what checkout should carry. */
export function verifiedItems(rows: VerifiedCartItem[]): CartItem[] {
  return rows.filter((row) => row.available).map((row) => ({ ...row.item, price: row.price }));
}
