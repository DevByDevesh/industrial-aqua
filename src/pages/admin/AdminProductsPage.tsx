import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { LogIn, LogOut, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { auth, db } from '../../lib/firebase/client';
import { productSections } from '../../data/products';
import { STORE_ADMIN_EMAIL } from '../../lib/auth';
import { logAdminAction } from '../../lib/audit';

interface AdminProduct {
  id: string;
  name: string;
  code?: string;
  section: string;
  subsection?: string;
  specs: string[];
  price: number | null;
  stock: number | null;
  archived: boolean;
  order: number;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/["\u2033]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminProductsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState('');
  const [drafts, setDrafts] = useState<Record<string, { name: string; price: string; stock: string; section: string; specs: string }>>({});

  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newSection, setNewSection] = useState(productSections[0]?.id ?? '');
  const [newSubsection, setNewSubsection] = useState('');
  const [newSpecs, setNewSpecs] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setAuthReady(true);
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('order')));
      setItems(
        snap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: String(data.name ?? ''),
            code: typeof data.code === 'string' ? data.code : undefined,
            section: String(data.section ?? ''),
            subsection: typeof data.subsection === 'string' ? data.subsection : undefined,
            specs: Array.isArray(data.specs) ? data.specs.map(String) : [],
            price: typeof data.price === 'number' ? data.price : null,
            stock: typeof data.stock === 'number' ? data.stock : null,
            archived: data.archived === true,
            order: typeof data.order === 'number' ? data.order : 0,
          };
        }),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [item.name, item.code ?? '', item.section, item.subsection ?? ''].join(' ').toLowerCase().includes(needle),
    );
  }, [items, search]);

  const PAGE_SIZE = 25;
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (!authReady) return <p className="admin-muted">Checking sign-in…</p>;

  if (!auth || !db) {
    return (
      <div className="admin-card">
        <h2>Admin unavailable</h2>
        <p className="admin-muted">Firebase is not configured in this build, so product management is disabled.</p>
      </div>
    );
  }

  const authReady2 = auth;

  if (!user) {
    return (
      <form
        className="admin-card admin-login"
        onSubmit={async (event) => {
          event.preventDefault();
          setLoginError('');
          try {
            await signInWithEmailAndPassword(authReady2, email.trim(), password);
          } catch {
            setLoginError('Sign-in failed. Check the email and password, or ask the store owner to create your admin account in Firebase.');
          }
        }}
      >
        <h2>Store admin sign-in</h2>
        <p className="admin-muted">Sign in with the admin account created for this store in Firebase Authentication.</p>
        <label>
          Email
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
        </label>
        <label>
          Password
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        {loginError && <p className="admin-error" role="alert">{loginError}</p>}
        <button type="submit" className="button button-dark"><LogIn size={15} /> Sign in</button>
      </form>
    );
  }

  const draftOf = (item: AdminProduct) =>
    drafts[item.id] ?? {
      name: item.name,
      price: item.price === null ? '' : String(item.price),
      stock: item.stock === null ? '' : String(item.stock),
      section: item.section,
      specs: item.specs.join('\n'),
    };

  const saveItem = async (item: AdminProduct) => {
    if (!db) return;
    const draft = draftOf(item);
    const price = draft.price.trim() === '' ? null : Number(draft.price);
    if (price !== null && (Number.isNaN(price) || price < 0)) {
      setNotice('Price must be a number (or blank) for ' + item.name);
      return;
    }
    const stock = draft.stock.trim() === '' ? null : Number(draft.stock);
    if (stock !== null && (Number.isNaN(stock) || stock < 0 || Math.trunc(stock) !== stock)) {
      setNotice('Stock must be a whole number (or blank = not tracked) for ' + item.name);
      return;
    }
    const changes: string[] = [];
    if ((draft.name.trim() || item.name) !== item.name) changes.push('name → ' + (draft.name.trim() || item.name));
    if (price !== item.price) changes.push('price ' + (item.price === null ? 'on request' : '₹' + item.price) + ' → ' + (price === null ? 'on request' : '₹' + price));
    if (stock !== item.stock) changes.push('stock ' + (item.stock === null ? 'untracked' : item.stock) + ' → ' + (stock === null ? 'untracked' : stock));
    if (draft.section !== item.section) changes.push('section → ' + draft.section);
    await updateDoc(doc(db, 'products', item.id), {
      name: draft.name.trim() || item.name,
      price,
      stock,
      section: draft.section,
      specs: draft.specs.split('\n').map((line) => line.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    });
    setNotice('Saved: ' + (draft.name.trim() || item.name));
    if (changes.length > 0) {
      void logAdminAction(user?.email ?? '', 'product.update', item.name, changes.join('; '));
    }
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    await refresh();
  };

  const toggleArchive = async (item: AdminProduct) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'products', item.id), {
        archived: !item.archived,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      setNotice('Could not ' + (item.archived ? 'restore' : 'archive') + ' ' + item.name + ' — permission denied. The updated security rules (v3) may not be published yet.');
      return;
    }
    setNotice((item.archived ? 'Restored to shop: ' : 'Archived (hidden from shop): ') + item.name);
    void logAdminAction(user?.email ?? '', item.archived ? 'product.restore' : 'product.archive', item.name, item.archived ? 'Restored to the shop' : 'Archived — hidden from the shop');
    await refresh();
  };

  const addItem = async () => {
    if (!db || !newName.trim()) return;
    const sectionIndex = productSections.findIndex((section) => section.id === newSection);
    const slug = slugify(newCode.trim() || newName.trim()) + '-' + newSection;
    const price = newPrice.trim() === '' ? null : Number(newPrice);
    if (price !== null && (Number.isNaN(price) || price < 0)) {
      setNotice('New product price must be a number (or blank).');
      return;
    }
    const stock = newStock.trim() === '' ? null : Number(newStock);
    if (stock !== null && (Number.isNaN(stock) || stock < 0 || Math.trunc(stock) !== stock)) {
      setNotice('New product stock must be a whole number (or blank = not tracked).');
      return;
    }
    const docData: Record<string, unknown> = {
      slug,
      name: newName.trim(),
      section: newSection,
      specs: newSpecs.split('\n').map((line) => line.trim()).filter(Boolean),
      price,
      stock,
      archived: false,
      order: sectionIndex * 1000 + 900 + Math.floor(Math.random() * 90),
      updatedAt: new Date().toISOString(),
    };
    if (newCode.trim()) docData.code = newCode.trim();
    if (newSubsection.trim()) docData.subsection = newSubsection.trim();
    await addDoc(collection(db, 'products'), docData);
    setNewName('');
    setNewCode('');
    setNewSubsection('');
    setNewSpecs('');
    setNewPrice('');
    setNewStock('');
    setNotice('Product added. It is now live in the shop catalogue.');
    void logAdminAction(user?.email ?? '', 'product.create', newName.trim(), 'Added to section ' + newSection + (price === null ? ', price on request' : ', price ₹' + price));
    await refresh();
  };

  if (user.email !== STORE_ADMIN_EMAIL) {
    return (
      <div className="admin-card">
        <h2>Not the store admin</h2>
        <p className="admin-muted">
          Signed in as {user.email}. Product editing is restricted to the store admin account
          ({STORE_ADMIN_EMAIL}); Firestore rules enforce this too. Sign out and use the admin account.
        </p>
        <button type="button" className="button secondary" onClick={() => void signOut(authReady2)}>
          <LogOut size={15} /> Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-products-head">
        <div>
          <h2>Products</h2>
          <p className="admin-muted">
            {items.length} products in Firestore. Changes here go live on the shop page. Signed in as {user.email}.
          </p>
        </div>
        <button type="button" className="button secondary" onClick={() => void signOut(authReady2)}>
          <LogOut size={15} /> Sign out
        </button>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={15} />
          <input aria-label="Search products" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name or code…" />
          {search && (
            <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </label>
        {notice && <span className="admin-notice" role="status">{notice}</span>}
      </div>

      {loading ? (
        <p className="admin-muted">Loading products…</p>
      ) : (
        <div className="admin-table" role="table" aria-label="Products">
          <div className="admin-row admin-row-head" role="row">
            <span>Product</span>
            <span>Section</span>
            <span>Price (₹, blank = on request)</span>
            <span>Specs (one per line)</span>
            <span>Actions</span>
          </div>
          {pageItems.map((item) => {
            const draft = draftOf(item);
            const dirty = draft.name !== item.name || draft.price !== (item.price === null ? '' : String(item.price)) || draft.stock !== (item.stock === null ? '' : String(item.stock)) || draft.section !== item.section || draft.specs !== item.specs.join('\n');
            return (
              <div className="admin-row" role="row" key={item.id}>
                <span>
                  <input
                    aria-label={'Name for ' + item.id}
                    value={draft.name}
                    onChange={(event) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draftOf(item), name: event.target.value } }))}
                  />
                  {item.code && <small className="admin-code">{item.code}</small>}
                </span>
                <span>
                  <select
                    aria-label={'Section for ' + item.name}
                    value={draft.section}
                    onChange={(event) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draftOf(item), section: event.target.value } }))}
                  >
                    {productSections.map((section) => (
                      <option key={section.id} value={section.id}>{section.title}</option>
                    ))}
                    {!productSections.some((section) => section.id === item.section) && (
                      <option value={item.section}>{item.section}</option>
                    )}
                  </select>
                  {item.subsection && <small className="admin-code">{item.subsection}</small>}
                  {item.archived && <small className="admin-code">ARCHIVED — hidden from shop</small>}
                </span>
                <span>
                  <input
                    aria-label={'Price for ' + item.name}
                    inputMode="decimal"
                    value={draft.price}
                    placeholder="Blank"
                    onChange={(event) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draftOf(item), price: event.target.value } }))}
                  />
                  <input
                    aria-label={'Stock for ' + item.name}
                    inputMode="numeric"
                    value={draft.stock}
                    placeholder="Stock: not tracked"
                    onChange={(event) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draftOf(item), stock: event.target.value } }))}
                  />
                </span>
                <span>
                  <textarea
                    aria-label={'Specs for ' + item.name}
                    rows={2}
                    value={draft.specs}
                    onChange={(event) => setDrafts((prev) => ({ ...prev, [item.id]: { ...draftOf(item), specs: event.target.value } }))}
                  />
                </span>
                <span className="admin-actions">
                  <button type="button" className="button button-dark" disabled={!dirty} onClick={() => void saveItem(item)}>
                    <Save size={14} /> Save
                  </button>
                  <button type="button" className="button secondary" onClick={() => void toggleArchive(item)}>
                    {item.archived ? 'Restore' : 'Archive'}
                  </button>
                  <button
                    type="button"
                    className="admin-delete"
                    aria-label={'Delete ' + item.name}
                    onClick={async () => {
                      if (!db) return;
                      if (window.confirm('Delete "' + item.name + '" from the catalogue?')) {
                        await deleteDoc(doc(db, 'products', item.id));
                        setNotice('Deleted: ' + item.name);
                        void logAdminAction(user?.email ?? '', 'product.delete', item.name, 'Deleted from the catalogue');
                        await refresh();
                      }
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </span>
              </div>
            );
          })}
          {visible.length === 0 && <p className="admin-muted">No products match your search.</p>}
          {visible.length > 0 && (
            <div className="admin-pagination">
              <button type="button" className="button secondary" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Previous</button>
              <span className="admin-muted">Page {safePage} of {pageCount} · {visible.length} products</span>
              <button type="button" className="button secondary" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)}>Next</button>
            </div>
          )}
        </div>
      )}

      <form
        className="admin-card admin-add"
        onSubmit={(event) => {
          event.preventDefault();
          void addItem();
        }}
      >
        <h3>Add a product</h3>
        <div className="admin-add-grid">
          <label>
            Name
            <input required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Inline Filter 10 inch" />
          </label>
          <label>
            Model code (optional)
            <input value={newCode} onChange={(event) => setNewCode(event.target.value)} placeholder="e.g. 004A" />
          </label>
          <label>
            Section
            <select value={newSection} onChange={(event) => setNewSection(event.target.value)}>
              {productSections.map((section) => (
                <option key={section.id} value={section.id}>{section.title}</option>
              ))}
            </select>
          </label>
          <label>
            Subsection (optional)
            <input value={newSubsection} onChange={(event) => setNewSubsection(event.target.value)} placeholder="e.g. Elbow" />
          </label>
          <label>
            Price ₹ (optional, blank = on request)
            <input inputMode="decimal" value={newPrice} onChange={(event) => setNewPrice(event.target.value)} />
          </label>
          <label>
            Stock (optional, blank = not tracked)
            <input inputMode="numeric" value={newStock} onChange={(event) => setNewStock(event.target.value)} />
          </label>
          <label>
            Specs (one per line, optional)
            <textarea rows={2} value={newSpecs} onChange={(event) => setNewSpecs(event.target.value)} />
          </label>
        </div>
        <button type="submit" className="button button-dark"><Plus size={15} /> Add product</button>
      </form>
    </div>
  );
}
