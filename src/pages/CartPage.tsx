import { ArrowRight, MessageCircle, Minus, Plus, ShoppingBag, Trash2, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productImages } from '../data/product-images';
import { useCart } from '../lib/cart';
import {
  MAX_QTY,
  reconcileCart,
  verifiedHasUnavailable,
  verifiedHasPriced,
  verifiedHasUnpriced,
  verifiedTotal,
} from '../lib/cart-model';
import { useProducts } from '../lib/useProducts';

export function CartPage() {
  const cart = useCart();
  const { products, settled } = useProducts();
  // Prices and availability are verified against the live catalogue; the
  // stored snapshot is only a fallback until the live load settles.
  const rows = reconcileCart(cart.items, products);
  const pricedTotal = verifiedTotal(rows);
  const hasPriced = verifiedHasPriced(rows);
  const hasUnpriced = verifiedHasUnpriced(rows);
  const hasUnavailable = settled && verifiedHasUnavailable(rows);

  return (
    <div className="shop-page">
      <section className="shop-intro">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span><span>Your bag</span>
        </nav>
        <p className="eyebrow"><span className="eyebrow-dot" /> SHOPPING BAG</p>
        <h1>Your bag</h1>
        <p className="shop-intro-copy">
          Review your items, then place the order on WhatsApp — the store confirms availability, final pricing
          and delivery with you directly. No online payment is taken on this site.
        </p>
      </section>

      <section className="cart-section">
        {cart.items.length === 0 ? (
          <div className="shop-empty" role="status">
            <span className="shop-empty-icon"><ShoppingBag size={22} /></span>
            <h3>Your bag is empty</h3>
            <p>Add products from the shop or category pages and they will appear here.</p>
            <Link to="/shop" className="button button-dark">Browse products <ArrowRight size={15} /></Link>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {hasUnavailable && (
                <p className="cart-alert" role="alert">
                  <TriangleAlert size={15} /> One or more items below are no longer in the catalogue. Remove them
                  to continue — they are not included in the total.
                </p>
              )}
              {rows.map(({ item, available, price, priceChanged }) => {
                const image = productImages[item.slug];
                const isUnavailable = settled && !available;
                return (
                  <article key={item.slug} className={'cart-row' + (isUnavailable ? ' cart-row-unavailable' : '')}>
                    <Link to={'/product/' + item.slug} className="cart-thumb">
                      {image ? <img src={image} alt={item.name} loading="lazy" /> : <ShoppingBag size={20} />}
                    </Link>
                    <div className="cart-info">
                      <h3><Link to={'/product/' + item.slug}>{item.name}</Link></h3>
                      {item.code && <span className="product-card-code">{item.code}</span>}
                      {isUnavailable ? (
                        <span className="cart-unavailable-note">No longer available in the catalogue</span>
                      ) : (
                        <span className="cart-price">
                          {price === null ? 'Price on request' : '₹' + (price * item.qty).toLocaleString('en-IN')}
                          {settled && priceChanged && <span className="cart-price-note"> Price updated</span>}
                        </span>
                      )}
                    </div>
                    <label className="qty-control">
                      <span className="sr-only">Quantity for {item.name}</span>
                      <button
                        type="button"
                        aria-label={item.qty <= 1 ? 'Remove ' + item.name : 'Decrease quantity of ' + item.name}
                        onClick={() => cart.setQty(item.slug, item.qty - 1)}
                      ><Minus size={14} /></button>
                      <input
                        aria-label={'Quantity for ' + item.name}
                        value={item.qty}
                        inputMode="numeric"
                        onChange={(event) => {
                          const next = parseInt(event.target.value, 10);
                          if (!Number.isNaN(next) && next >= 1) cart.setQty(item.slug, Math.min(MAX_QTY, next));
                        }}
                      />
                      <button
                        type="button"
                        aria-label={'Increase quantity of ' + item.name}
                        disabled={item.qty >= MAX_QTY}
                        onClick={() => cart.setQty(item.slug, item.qty + 1)}
                      ><Plus size={14} /></button>
                    </label>
                    <button type="button" className="admin-delete" aria-label={'Remove ' + item.name} onClick={() => cart.remove(item.slug)}>
                      <Trash2 size={15} />
                    </button>
                  </article>
                );
              })}
            </div>

            <aside className="cart-summary">
              <h2>Order summary</h2>
              <div className="cart-summary-row">
                <span>Subtotal (priced items)</span>
                <strong>{hasPriced ? '₹' + pricedTotal.toLocaleString('en-IN') : '—'}</strong>
              </div>
              {hasUnpriced && (
                <p className="admin-muted">Some items are price-on-request. The store confirms their prices on WhatsApp before you pay anything.</p>
              )}
              <div className="cart-summary-row">
                <span>Delivery</span>
                <strong>Confirmed on order</strong>
              </div>
              {hasUnavailable ? (
                <p className="cart-alert" role="alert">
                  <TriangleAlert size={15} /> Remove the unavailable items above before placing your order.
                </p>
              ) : (
                <Link to="/checkout" className="button button-dark cart-checkout">
                  <MessageCircle size={15} /> Proceed to place order
                </Link>
              )}
              <button type="button" className="shop-clear-filters" onClick={cart.clear}>Clear bag</button>
              <p className="admin-muted">Orders are confirmed personally by the store team on WhatsApp — nothing is charged online, and adding an item here does not reserve it.</p>
            </aside>
          </>
        )}
      </section>
    </div>
  );
}
