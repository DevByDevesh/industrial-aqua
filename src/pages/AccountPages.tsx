import { useEffect, useState } from 'react';
import { ArrowRight, ClipboardList, LogIn, LogOut, Mail, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase/client';
import { useAuth } from '../lib/auth';
import type { Order } from '../lib/orders';

function friendlyError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'No account matched that email and password. Check them, or create an account.';
  if (code.includes('email-already-in-use')) return 'An account with this email already exists — sign in instead.';
  if (code.includes('weak-password')) return 'Please choose a stronger password (at least 6 characters).';
  if (code.includes('invalid-email')) return 'That email address does not look valid.';
  return 'Something went wrong. Please try again.';
}

function AccountShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="shop-page">
      <section className="shop-intro">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span><span>Account</span>
        </nav>
        <p className="eyebrow"><span className="eyebrow-dot" /> YOUR ACCOUNT</p>
        <h1>{title}</h1>
        <p className="shop-intro-copy">{intro}</p>
      </section>
      <section className="account-section">{children}</section>
    </div>
  );
}

export function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/account', { replace: true });
  }, [user, navigate]);

  return (
    <AccountShell title="Sign in" intro="Sign in to see your orders and check out faster.">
      <form className="admin-card admin-login" onSubmit={async (event) => {
        event.preventDefault();
        setError('');
        try {
          await signIn(email.trim(), password);
        } catch (err) {
          setError(friendlyError(err));
        }
      }}>
        <label>
          Email
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="submit" className="button button-dark"><LogIn size={15} /> Sign in</button>
        <p className="admin-muted">
          New here? <Link to="/account/register">Create an account</Link> · <Link to="/account/reset-password">Forgot password?</Link>
        </p>
      </form>
    </AccountShell>
  );
}

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/account', { replace: true });
  }, [user, navigate]);

  return (
    <AccountShell title="Create account" intro="An account keeps your order history in one place. Ordering as a guest on WhatsApp still works too.">
      <form className="admin-card admin-login" onSubmit={async (event) => {
        event.preventDefault();
        setError('');
        try {
          await register(email.trim(), password);
        } catch (err) {
          setError(friendlyError(err));
        }
      }}>
        <label>
          Email
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        </label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="submit" className="button button-dark"><UserPlus size={15} /> Create account</button>
        <p className="admin-muted">Already registered? <Link to="/account/login">Sign in</Link></p>
      </form>
    </AccountShell>
  );
}

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  return (
    <AccountShell title="Reset password" intro="We will email you a link to set a new password.">
      {sent ? (
        <div className="admin-card">
          <h2><Mail size={17} /> Check your inbox</h2>
          <p className="admin-muted">If an account exists for {email}, a password reset email is on its way. Then <Link to="/account/login">sign in</Link>.</p>
        </div>
      ) : (
        <form className="admin-card admin-login" onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          try {
            await resetPassword(email.trim());
            setSent(true);
          } catch (err) {
            setError(friendlyError(err));
          }
        }}>
          <label>
            Email
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button type="submit" className="button button-dark"><Mail size={15} /> Send reset email</button>
        </form>
      )}
    </AccountShell>
  );
}

export function AccountPage() {
  const { user, ready, logOut } = useAuth();
  const navigate = useNavigate();

  if (!ready) return <AccountShell title="Your account" intro="Loading…">{null}</AccountShell>;

  if (!user) {
    return (
      <AccountShell title="Your account" intro="Sign in to see your orders, or create an account in a minute.">
        <div className="account-actions">
          <Link to="/account/login" className="button button-dark"><LogIn size={15} /> Sign in</Link>
          <Link to="/account/register" className="button secondary"><UserPlus size={15} /> Create account</Link>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell title="Your account" intro={'Signed in as ' + (user.email ?? '')}>
      <div className="account-actions">
        <Link to="/account/orders" className="button button-dark"><ClipboardList size={15} /> Your orders <ArrowRight size={14} /></Link>
        <Link to="/shop" className="button secondary">Continue shopping</Link>
        <button type="button" className="button secondary" onClick={async () => { await logOut(); navigate('/'); }}>
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </AccountShell>
  );
}

export function OrdersPage() {
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user || !db) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')),
        );
        if (!cancelled) {
          setOrders(snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Order) })));
        }
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, ready]);

  if (!ready || loading) {
    return <AccountShell title="Your orders" intro="Loading your orders…">{null}</AccountShell>;
  }

  if (!user) {
    return (
      <AccountShell title="Your orders" intro="Sign in to see orders placed with your account. Guest orders live in your WhatsApp chat with the store.">
        <Link to="/account/login" className="button button-dark"><LogIn size={15} /> Sign in</Link>
      </AccountShell>
    );
  }

  return (
    <AccountShell title="Your orders" intro="Orders you placed while signed in. The store confirms each order personally on WhatsApp.">
      {orders.length === 0 ? (
        <div className="shop-empty" role="status">
          <span className="shop-empty-icon"><ClipboardList size={22} /></span>
          <h3>No orders yet</h3>
          <p>When you place an order while signed in, it will appear here.</p>
          <Link to="/shop" className="button button-dark">Browse products <ArrowRight size={15} /></Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-card-head">
                <strong>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                <span className="status-chip"><span />{order.status}</span>
              </div>
              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.slug}>
                    <span>{item.name} × {item.qty}</span>
                    <span>{item.price === null ? 'On request' : '₹' + (item.price * item.qty).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
              <div className="order-card-foot">
                <span>Ref: {order.id}</span>
                <strong>{order.pricedTotal > 0 ? 'Priced total ₹' + order.pricedTotal.toLocaleString('en-IN') : 'Total confirmed on WhatsApp'}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
