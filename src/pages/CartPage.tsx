import { ArrowRight, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productImages } from '../data/product-images';
import { cartHasUnpriced, cartPricedTotal, useCart } from '../lib/cart';

export function CartPage() {
  const cart = useCart();
  const pricedTotal = cartPricedTotal(cart.items);
  const hasUnpriced = cartHasUnpriced(cart.items);

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
              {cart.items.map((item) => {
                const image = productImages[item.slug];
                return (
                  <article key={item.slug} className="cart-row">
                    <Link to={'/product/' + item.slug} className="cart-thumb">
                      {image ? <img src={image} alt={item.name} loading="lazy" /> : <ShoppingBag size={20} />}
                    </Link>
                    <div className="cart-info">
                      <h3><Link to={'/product/' + item.slug}>{item.name}</Link></h3>
                      {item.code && <span className="product-card-code">{item.code}</span>}
                      <span className="cart-price">
                        {item.price === null ? 'Price on request' : '₹' + (item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <label className="qty-control">
                      <span className="sr-only">Quantity for {item.name}</span>
                      <button type="button" aria-label={'Decrease quantity of ' + item.name} onClick={() => cart.setQty(item.slug, item.qty - 1)}><Minus size={14} /></button>
                      <input aria-label={'Quantity for ' + item.name} value={item.qty} inputMode="numeric" onChange={(event) => {
                        const next = parseInt(event.target.value, 10);
                        if (!Number.isNaN(next)) cart.setQty(item.slug, next);
                      }} />
                      <button type="button" aria-label={'Increase quantity of ' + item.name} onClick={() => cart.setQty(item.slug, item.qty + 1)}><Plus size={14} /></button>
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
                <span>Priced items</span>
                <strong>{pricedTotal > 0 ? '₹' + pricedTotal.toLocaleString('en-IN') : '—'}</strong>
              </div>
              {hasUnpriced && (
                <p className="admin-muted">Some items are price-on-request. The store confirms their prices on WhatsApp before you pay anything.</p>
              )}
              <div className="cart-summary-row">
                <span>Delivery</span>
                <strong>Confirmed on order</strong>
              </div>
              <Link to="/checkout" className="button button-dark cart-checkout">
                <MessageCircle size={15} /> Proceed to place order
              </Link>
              <button type="button" className="shop-clear-filters" onClick={cart.clear}>Clear bag</button>
              <p className="admin-muted">Orders are confirmed personally by the store team on WhatsApp — nothing is charged online.</p>
            </aside>
          </>
        )}
      </section>
    </div>
  );
}
