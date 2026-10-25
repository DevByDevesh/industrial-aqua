import { describe, expect, it } from 'vitest';
import type { Product } from '../src/data/products';
import {
  MAX_QTY,
  cartHasPriced,
  cartHasUnpriced,
  cartPricedTotal,
  clampQty,
  reconcileCart,
  verifiedHasBlocked,
  verifiedHasPriced,
  verifiedItems,
  verifiedTotal,
  type CartItem,
} from '../src/lib/cart-model';
import { INITIAL_ORDER_STATUS, INITIAL_PAYMENT_STATUS, ORDER_STATUSES, PAYMENT_STATUSES } from '../src/lib/orders';

function product(overrides: Partial<Product> = {}): Product {
  return {
    slug: 'membrane-80gpd',
    name: 'Membrane 80 GPD',
    section: 'membranes',
    specs: [],
    price: 500,
    ...overrides,
  };
}

function item(overrides: Partial<CartItem> = {}): CartItem {
  return { slug: 'membrane-80gpd', name: 'Membrane 80 GPD', price: 500, qty: 2, ...overrides };
}

describe('quantity validation', () => {
  it('clamps quantities into 1..MAX_QTY', () => {
    expect(clampQty(0)).toBe(1);
    expect(clampQty(-7)).toBe(1);
    expect(clampQty(500)).toBe(MAX_QTY);
    expect(clampQty(3.9)).toBe(3);
    expect(clampQty(Number.NaN)).toBe(1);
  });
});

describe('price edge cases', () => {
  it('treats a real ₹0 price as priced, distinct from price-on-request', () => {
    const items = [item({ price: 0 })];
    expect(cartHasPriced(items)).toBe(true);
    expect(cartHasUnpriced(items)).toBe(false);
    expect(cartPricedTotal(items)).toBe(0);
  });

  it('treats null as price-on-request, never as zero', () => {
    const items = [item({ price: null })];
    expect(cartHasPriced(items)).toBe(false);
    expect(cartHasUnpriced(items)).toBe(true);
    expect(cartPricedTotal(items)).toBe(0);
  });
});

describe('order total tampering', () => {
  it('ignores a tampered stored price and uses the verified catalogue price', () => {
    const rows = reconcileCart([item({ price: 999_999 })], [product({ price: 500 })]);
    expect(rows[0].price).toBe(500);
    expect(rows[0].priceChanged).toBe(true);
    expect(verifiedTotal(rows)).toBe(1000);
    expect(verifiedItems(rows)[0].price).toBe(500);
  });

  it('ignores a tampered stored price of zero the same way', () => {
    const rows = reconcileCart([item({ price: 0 })], [product({ price: 500 })]);
    expect(verifiedTotal(rows)).toBe(1000);
  });
});

describe('unavailable and stock handling', () => {
  it('blocks a product that was removed from the catalogue', () => {
    const rows = reconcileCart([item()], []);
    expect(rows[0].available).toBe(false);
    expect(verifiedHasBlocked(rows)).toBe(true);
    expect(verifiedItems(rows)).toHaveLength(0);
    expect(verifiedTotal(rows)).toBe(0);
  });

  it('blocks an out-of-stock product (tracked stock = 0)', () => {
    const rows = reconcileCart([item()], [product({ stock: 0 })]);
    expect(rows[0].outOfStock).toBe(true);
    expect(verifiedHasBlocked(rows)).toBe(true);
    expect(verifiedItems(rows)).toHaveLength(0);
  });

  it('blocks insufficient stock (qty above tracked stock)', () => {
    const rows = reconcileCart([item({ qty: 5 })], [product({ stock: 2 })]);
    expect(rows[0].exceedsStock).toBe(true);
    expect(verifiedHasBlocked(rows)).toBe(true);
    expect(verifiedTotal(rows)).toBe(0);
  });

  it('allows quantities within tracked stock', () => {
    const rows = reconcileCart([item({ qty: 2 })], [product({ stock: 2 })]);
    expect(verifiedHasBlocked(rows)).toBe(false);
    expect(verifiedTotal(rows)).toBe(1000);
  });

  it('never blocks on stock when stock is not tracked (null)', () => {
    const rows = reconcileCart([item({ qty: 50 })], [product({ stock: null })]);
    expect(rows[0].outOfStock).toBe(false);
    expect(rows[0].exceedsStock).toBe(false);
    expect(verifiedHasBlocked(rows)).toBe(false);
  });
});

describe('verified totals', () => {
  it('counts priced items and skips on-request items without inventing a price', () => {
    const rows = reconcileCart(
      [item({ qty: 1 }), item({ slug: 'valve', name: 'Valve', price: null, qty: 3 })],
      [product(), product({ slug: 'valve', name: 'Valve', price: null })],
    );
    expect(verifiedTotal(rows)).toBe(500);
    expect(verifiedHasPriced(rows)).toBe(true);
  });
});

describe('order and payment state model', () => {
  it('starts every order unpaid and in the initial status', () => {
    expect(INITIAL_PAYMENT_STATUS).toBe('Pending');
    expect(PAYMENT_STATUSES).toContain(INITIAL_PAYMENT_STATUS);
    expect(ORDER_STATUSES[0]).toBe(INITIAL_ORDER_STATUS);
  });
});
