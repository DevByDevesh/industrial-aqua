import { useEffect, useState } from 'react';
import { Boxes, ClipboardList, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase/client';
import { STORE_ADMIN_EMAIL, useAuth } from '../../lib/auth';
import { ORDER_STATUSES, PAYMENT_STATUSES, updateOrderPaymentStatus, updateOrderStatus, type Order, type OrderStatus, type PaymentStatus } from '../../lib/orders';
import { logAdminAction, type AuditEntry } from '../../lib/audit';

function fetchErrorText(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  if (code.includes('permission-denied')) {
    return 'Permission denied by the Firestore security rules. The tightened rules may not be published yet, or this account is not the store admin.';
  }
  return 'Could not load data from Firestore. Check the connection and try again.';
}

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

async function fetchAuditLog(): Promise<AuditEntry[]> {
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'auditLog'), orderBy('at', 'desc'), limit(8)));
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as AuditEntry) }));
}

export function AdminOverviewPage() {
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [loadError, setLoadError] = useState('');

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
        fetchAuditLog()
          .then((entries) => { if (!cancelled) setAudit(entries); })
          .catch(() => { /* audit feed is optional — rules may not be published yet */ });
      } catch (error) {
        if (!cancelled) {
          setOrders([]);
          setProductCount(null);
          setLoadError(fetchErrorText(error));
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
      {loadError && <p className="admin-error" role="alert">{loadError}</p>}
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
      {audit.length > 0 && (
        <div className="admin-card">
          <h2>Recent admin activity</h2>
          <ul className="order-items">
            {audit.map((entry) => (
              <li key={entry.id}>
                <span>{entry.action} — {entry.summary}</span>
                <span>{new Date(entry.at).toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState('');
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchAllOrders()
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch((error) => {
        if (!cancelled) {
          setOrders([]);
          setLoadError(fetchErrorText(error));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const changePaymentStatus = async (order: Order, paymentStatus: PaymentStatus) => {
    if (!order.id) return;
    setStatusError('');
    try {
      await updateOrderPaymentStatus(order.id, paymentStatus);
      void logAdminAction(user?.email ?? '', 'order.payment', order.customer.name, 'Order ' + order.id + ': payment ' + (order.paymentStatus ?? 'Pending') + ' → ' + paymentStatus);
      setOrders((current) =>
        current?.map((entry) => (entry.id === order.id ? { ...entry, paymentStatus, updatedAt: new Date().toISOString() } : entry)) ?? current,
      );
    } catch (error) {
      setStatusError(fetchErrorText(error));
    }
  };

  const changeStatus = async (order: Order, status: OrderStatus) => {
    if (!order.id) return;
    setStatusError('');
    try {
      await updateOrderStatus(order.id, status);
      void logAdminAction(user?.email ?? '', 'order.status', order.customer.name, 'Order ' + order.id + ': status ' + order.status + ' → ' + status);
      setOrders((current) =>
        current?.map((entry) => (entry.id === order.id ? { ...entry, status, updatedAt: new Date().toISOString() } : entry)) ?? current,
      );
    } catch (error) {
      setStatusError(fetchErrorText(error));
    }
  };

  const filtered = (orders ?? []).filter((order) => {
    if (statusFilter && order.status !== statusFilter) return false;
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return [order.customer.name, order.customer.phone, order.email, order.id ?? ''].join(' ').toLowerCase().includes(needle);
  });
  const PAGE_SIZE = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageOrders = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <AdminGate>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">STORE ADMIN</p>
          <h1>Orders</h1>
          <p>Orders placed by signed-in customers. Each customer also sends the same order to the store WhatsApp — confirm and fulfil from there.</p>
        </div>
      </div>
      {loadError && <p className="admin-error" role="alert">{loadError}</p>}
      {statusError && <p className="admin-error" role="alert">{statusError}</p>}
      <div className="admin-toolbar">
        <label className="admin-search">
          <span className="sr-only">Search orders</span>
          <input aria-label="Search orders" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, phone, email or order ref…" />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select aria-label="Filter by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      {orders === null ? (
        <p className="admin-muted">Loading orders…</p>
      ) : orders.length === 0 && !loadError ? (
        <div className="admin-card">
          <h2>No orders yet</h2>
          <p className="admin-muted">Orders placed by signed-in customers will appear here. Guest orders arrive only on WhatsApp.</p>
        </div>
      ) : (
        <div className="orders-list">
          {pageOrders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-card-head">
                <strong>{order.customer.name}</strong>
                <span className="order-status-editors">
                  <label className="order-status-edit">
                    <span className="sr-only">Order status for {order.customer.name}</span>
                    <select
                      value={order.status}
                      onChange={(event) => void changeStatus(order, event.target.value as OrderStatus)}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                      {!ORDER_STATUSES.includes(order.status as OrderStatus) && (
                        <option value={order.status}>{order.status}</option>
                      )}
                    </select>
                  </label>
                  <label className="order-status-edit">
                    <span className="sr-only">Payment status for {order.customer.name}</span>
                    <select
                      value={order.paymentStatus ?? 'Pending'}
                      onChange={(event) => void changePaymentStatus(order, event.target.value as PaymentStatus)}
                    >
                      {PAYMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>{'Payment: ' + status}</option>
                      ))}
                    </select>
                  </label>
                </span>
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
          {filtered.length === 0 && (
            <p className="admin-muted">No orders match your search or filter.</p>
          )}
          {filtered.length > 0 && (
            <div className="admin-pagination">
              <button type="button" className="button secondary" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Previous</button>
              <span className="admin-muted">Page {safePage} of {pageCount} · {filtered.length} orders</span>
              <button type="button" className="button secondary" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)}>Next</button>
            </div>
          )}
        </div>
      )}
    </AdminGate>
  );
}
