import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase/client';
import { products as localProducts, type Product } from '../data/products';

// The shop renders instantly from the local catalogue seed, then swaps in
// the live Firestore catalogue when it loads, so admin price/product
// changes appear on the site. If Firestore is unreachable or empty, the
// local seed stays — the shop never renders empty because of a network
// or configuration problem.
export async function loadProducts(): Promise<Product[] | null> {
  if (!db) return null;
  try {
    const snap = await getDocs(query(collection(db, 'products'), orderBy('order')));
    if (snap.empty) return null;
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        slug: typeof data.slug === 'string' ? data.slug : docSnap.id,
        name: String(data.name ?? ''),
        code: typeof data.code === 'string' ? data.code : undefined,
        section: String(data.section ?? ''),
        subsection: typeof data.subsection === 'string' ? data.subsection : undefined,
        specs: Array.isArray(data.specs) ? data.specs.map(String) : [],
        description: typeof data.description === 'string' && data.description.trim() ? data.description : undefined,
        price: typeof data.price === 'number' ? data.price : null,
        priceUnit: typeof data.priceUnit === 'string' ? data.priceUnit : undefined,
        stock: typeof data.stock === 'number' && Number.isFinite(data.stock) && data.stock >= 0 ? Math.trunc(data.stock) : null,
        archived: data.archived === true,
      } satisfies Product;
    });
  } catch {
    return null;
  }
}

export { localProducts };
