import { useEffect, useState } from 'react';
import { Boxes, ClipboardList, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase/client';
import { STORE_ADMIN_EMAIL, useAuth } from '../../lib/auth';
import type { Order } from '../../lib/orders';

function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, ready, isAdmin } = useAuth();
  if (!ready) return <p className="admin-muted">Loading…</p>;
  if (!user) {
    return (
      <div className="admin-card">
        <h2>Sign in required</h2>
        <p className="admin-muted">Sign in from the <Link to="/admin/products">Products page</Link> with the store admin account to view this.</p>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="admin-card">
        <h2>Not the store admin</h2>
        <p className="admin-muted">This account ({user.email}) is a customer account. Store data here is visible only to {STORE_ADMIN_EMAIL}.</p>
      </div>
    );
  }
  return <>{children}</>;
}

async function fetchAllOrders(): Promise<Order[]> {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Order) }));
}

export function AdminOverviewPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [orderList, productSnap] = await Promise.all([
          fetchAllOrders(),
          db ? getDocs(collection(db, 'products')) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setOrders(orderList);
        setProductCount(productSnap ? productSnap.size : null);
      } catch {
        if (!cancelled) {
          setOrders([]);
          setProductCount(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const revenue = (orders ?? []).reduce((sum, order) => sum + (order.pricedTotal || 0), 0);

  return (
    <AdminGate>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">STORE ADMIN</p>
          <h1>Overview</h1>
          <p>Live numbers from Firestore — products and customer orders.</p>
        </div>
        <Link to="/admin/orders" className="button button-dark"><ClipboardList size={15} /> View orders</Link>
      </div>
      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-icon"><Boxes size={17} /></span>
          <strong>{productCount ?? '—'}</strong>
          <span>Products in catalogue</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-icon"><ClipboardList size={17} /></span>
          <strong>{orders ? orders.length : '—'}</strong>
          <span>Orders received</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-icon"><IndianRupee size={17} /></span>
          <strong>{orders ? '₹' + revenue.toLocaleString('en-IN') : '—'}</strong>
          <span>Priced items total (excl. on-request items)</span>
        </div>
      </div>
      {orders && orders.length > 0 && (
        <div className="admin-card">
          <h2>Latest orders</h2>
          <ul className="order-items">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id}>
                <span>{order.customer.name} — {order.items.reduce((sum, item) => sum + item.qty, 0)} item(s) · {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                <span>{order.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminGate>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllOrders()
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminGate>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">STORE ADMIN</p>
          <h1>Orders</h1>
          <p>Orders placed by signed-in customers. Each customer also sends the same order to the store WhatsApp — confirm and fulfil from there.</p>
        </div>
      </div>
      {orders === null ? (
        <p className="admin-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="admin-card">
          <h2>No orders yet</h2>
          <p className="admin-muted">Orders placed by signed-in customers will appear here. Guest orders arrive only on WhatsApp.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-card-head">
                <strong>{order.customer.name}</strong>
                <span className="status-chip"><span />{order.status}</span>
              </div>
              <p className="admin-muted">
                {new Date(order.createdAt).toLocaleString('en-IN')} · {order.customer.phone} · {order.email}
              </p>
              <p className="admin-muted">Deliver to: {order.customer.address}</p>
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
                <strong>{order.pricedTotal > 0 ? 'Priced total ₹' + order.pricedTotal.toLocaleString('en-IN') : 'Total on WhatsApp'}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminGate>
  );
}
