import { useState } from 'react';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cartHasUnpriced, cartPricedTotal, useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { placeOrder, whatsappOrderLink, type Order } from '../lib/orders';

export function CheckoutPage() {
  const cart = useCart();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState<Order | null>(null);
  const [sending, setSending] = useState(false);

  const pricedTotal = cartPricedTotal(cart.items);

  if (placed) {
    return (
      <div className="shop-page">
        <section className="shop-intro">
          <p className="eyebrow"><span className="eyebrow-dot" /> ORDER READY</p>
          <h1>Almost done — send it on WhatsApp</h1>
          <p className="shop-intro-copy">
            Your order is prepared{placed.id ? ' and saved to your account (ref: ' + placed.id + ')' : ''}.
            Tap below to send it to the store on WhatsApp — they will confirm availability, final pricing and delivery.
          </p>
          <a href={whatsappOrderLink(placed)} target="_blank" rel="noreferrer" className="button button-dark">
            <MessageCircle size={15} /> Send order on WhatsApp <ArrowRight size={14} />
          </a>
          <p className="product-detail-links">
            <Link to="/shop">Continue shopping</Link>
            {user && (<><span>/</span><Link to="/account/orders">See your orders</Link></>)}
          </p>
        </section>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="shop-page">
        <section className="shop-intro">
          <h1>Your bag is empty</h1>
          <p className="shop-intro-copy">Add some products first, then come back to place the order.</p>
          <Link to="/shop" className="button button-dark">Browse products <ArrowRight size={15} /></Link>
        </section>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill your name, phone number and delivery address.');
      return;
    }
    const customer = { name: name.trim(), phone: phone.trim(), address: address.trim() };
    setSending(true);
    try {
      let order: Order;
      if (user) {
        order = await placeOrder(user.uid, user.email ?? '', customer, cart.items);
      } else {
        // Guest order: nothing is stored — the WhatsApp message is the order.
        order = {
          userId: '',
          email: '',
          customer,
          items: cart.items.map((item) => ({ slug: item.slug, name: item.name, code: item.code, qty: item.qty, price: item.price })),
          pricedTotal,
          hasUnpricedItems: cartHasUnpriced(cart.items),
          status: 'Sent to store on WhatsApp',
          createdAt: new Date().toISOString(),
        };
      }
      cart.clear();
      setPlaced(order);
    } catch {
      setError('Could not save the order. Please try again, or send your list on WhatsApp from the support page.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="shop-page">
      <section className="shop-intro">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span><Link to="/cart">Your bag</Link><span>/</span><span>Place order</span>
        </nav>
        <p className="eyebrow"><span className="eyebrow-dot" /> PLACE ORDER</p>
        <h1>Your details</h1>
        <p className="shop-intro-copy">
          {user
            ? 'Signed in as ' + user.email + ' — this order will be saved in your account.'
            : 'Ordering as a guest. Sign in if you want this order saved in your account history.'}
        </p>
      </section>

      <section className="cart-section">
        <form className="admin-card admin-login checkout-form" onSubmit={submit}>
          <label>
            Full name
            <input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </label>
          <label>
            Phone / WhatsApp number
            <input required value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" />
          </label>
          <label>
            Delivery address
            <textarea required rows={3} value={address} onChange={(event) => setAddress(event.target.value)} autoComplete="street-address" />
          </label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button type="submit" className="button button-dark" disabled={sending}>
            <Check size={15} /> {sending ? 'Preparing…' : 'Prepare my order'}
          </button>
          <p className="admin-muted">Next step opens WhatsApp with your order ready to send. No online payment is taken.</p>
        </form>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          {cart.items.map((item) => (
            <div key={item.slug} className="cart-summary-row">
              <span>{item.name} × {item.qty}</span>
              <strong>{item.price === null ? 'On request' : '₹' + (item.price * item.qty).toLocaleString('en-IN')}</strong>
            </div>
          ))}
          <div className="cart-summary-row">
            <span>Priced total</span>
            <strong>{pricedTotal > 0 ? '₹' + pricedTotal.toLocaleString('en-IN') : '—'}</strong>
          </div>
          <p className="admin-muted">Delivery and any price-on-request items are confirmed by the store on WhatsApp.</p>
        </aside>
      </section>
    </div>
  );
}
