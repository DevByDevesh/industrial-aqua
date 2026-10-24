import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpDown, ArrowUpRight, Check, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { productSections, type Product } from '../data/products';
import { loadProducts, localProducts } from '../lib/products';
import { whatsappEnquiryLink } from '../lib/enquiry';
import { ProductCard } from '../components/ProductCard';

type SortKey = 'featured' | 'az' | 'za';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Catalogue order' },
  { value: 'az', label: 'Name A–Z' },
  { value: 'za', label: 'Name Z–A' },
];

function matchesQuery(product: Product, needle: string): boolean {
  if (!needle) return true;
  const sectionTitle = productSections.find((section) => section.id === product.section)?.title ?? '';
  const haystack = [product.name, product.code ?? '', product.subsection ?? '', sectionTitle, ...product.specs]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

interface ProductGroup {
  key: string;
  sectionId: string;
  sectionTitle: string;
  subsection?: string;
  items: Product[];
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, section and sort live in the URL (?q=, ?section=, ?sort=) so
  // results stay consistent across refresh, back/forward and header search.
  const urlQuery = searchParams.get('q') ?? '';
  const sectionParam = searchParams.get('section');
  const activeSection = sectionParam && productSections.some((section) => section.id === sectionParam) ? sectionParam : 'all';
  const sortParam = searchParams.get('sort');
  const sort: SortKey = sortParam === 'az' || sortParam === 'za' ? sortParam : 'featured';

  const [query, setQuery] = useState(urlQuery);
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // Local seed first (instant), then the live Firestore catalogue.
  const [products, setProducts] = useState<Product[]>(localProducts);
  useEffect(() => {
    let cancelled = false;
    loadProducts().then((live) => {
      if (!cancelled && live) setProducts(live);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateParams = (changes: { q?: string; section?: string; sort?: SortKey }) => {
    const next = new URLSearchParams(searchParams);
    const q = changes.q !== undefined ? changes.q : urlQuery;
    const section = changes.section !== undefined ? changes.section : activeSection;
    const nextSort = changes.sort !== undefined ? changes.sort : sort;
    if (q.trim()) next.set('q', q); else next.delete('q');
    if (section !== 'all') next.set('section', section); else next.delete('section');
    if (nextSort !== 'featured') next.set('sort', nextSort); else next.delete('sort');
    next.delete('category'); // legacy Phase 3 directory parameter
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => {
    setQuery('');
    setSearchParams({}, { replace: true });
  };

  const groups = useMemo<ProductGroup[]>(() => {
    const needle = query.trim().toLowerCase();
    const filtered = products.filter(
      (product) => (activeSection === 'all' || product.section === activeSection) && matchesQuery(product, needle),
    );
    const sorted =
      sort === 'az'
        ? [...filtered].sort((a, b) => a.name.localeCompare(b.name))
        : sort === 'za'
          ? [...filtered].sort((a, b) => b.name.localeCompare(a.name))
          : filtered;
    const result: ProductGroup[] = [];
    for (const product of sorted) {
      const sectionTitle = productSections.find((section) => section.id === product.section)?.title ?? product.section;
      const key = product.section + '|' + (product.subsection ?? '');
      const existing = result.find((group) => group.key === key);
      if (existing) existing.items.push(product);
      else result.push({ key, sectionId: product.section, sectionTitle, subsection: product.subsection, items: [product] });
    }
    // Keep pamphlet section order regardless of sort choice.
    const order = new Map(productSections.map((section, index) => [section.id, index]));
    return result.sort((a, b) => (order.get(a.sectionId) ?? 0) - (order.get(b.sectionId) ?? 0));
  }, [activeSection, query, sort, products]);

  const totalVisible = groups.reduce((sum, group) => sum + group.items.length, 0);
  const activeLabel =
    activeSection === 'all' ? 'All products' : productSections.find((section) => section.id === activeSection)?.title;
  const hasFilters = activeSection !== 'all' || query.trim() !== '' || sort !== 'featured';

  return (
    <div className="shop-page">
      <section className="shop-intro">
        <div className="shop-breadcrumb"><Link to="/">Home</Link><span>/</span><span>Products</span></div>
        <p className="eyebrow"><span className="eyebrow-dot" /> THE INDUSTRIAL AQUA RANGE</p>
        <h1>Systems for <em>every scale.</em></h1>
        <p className="shop-intro-copy">Browse the full product catalogue — membranes, pumps, housings, filters, fittings and accessories, organised by section just like our catalogue. Search by product name or model code, and ask our team to confirm specifications, availability and pricing.</p>
        <form className="shop-search" onSubmit={(event) => event.preventDefault()}>
          <Search size={19} />
          <input
            aria-label="Search products"
            value={query}
            onChange={(event) => { setQuery(event.target.value); updateParams({ q: event.target.value }); }}
            onKeyDown={(event) => { if (event.key === 'Escape' && query) { setQuery(''); updateParams({ q: '' }); } }}
            placeholder="Search products or codes — try 004A, membrane, pump..."
          />
          {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); updateParams({ q: '' }); }}><X size={16} /></button>}
          <button type="submit" className="shop-search-submit">Search <ArrowRight size={15} /></button>
        </form>
        <div className="shop-intro-meta"><span><Check size={14} /> {products.length} catalogue products</span><span><Check size={14} /> Enquiry-led product details</span></div>
      </section>

      <section className="shop-catalogue">
        <aside className="shop-sidebar">
          <div className="shop-sidebar-heading"><SlidersHorizontal size={16} /><span>Catalogue sections</span></div>
          <div className="shop-category-list" role="group" aria-label="Filter by section">
            <button
              type="button"
              className={activeSection === 'all' ? 'active' : ''}
              aria-pressed={activeSection === 'all'}
              onClick={() => updateParams({ section: 'all' })}
            >
              <span>All products</span>{activeSection === 'all' && <Check size={14} />}
            </button>
            {productSections.map((section) => (
              <button
                type="button"
                key={section.id}
                className={activeSection === section.id ? 'active' : ''}
                aria-pressed={activeSection === section.id}
                onClick={() => updateParams({ section: section.id })}
              >
                <span>{section.title}</span>{activeSection === section.id && <Check size={14} />}
              </button>
            ))}
          </div>
          <div className="shop-sidebar-note">
            <span className="shop-note-icon"><Filter size={17} /></span>
            <strong>Need help choosing?</strong>
            <p>Share your application and capacity requirement with our team.</p>
            <a href={whatsappEnquiryLink('product selection help')} target="_blank" rel="noreferrer">Ask on WhatsApp <ArrowUpRight size={14} /></a>
          </div>
        </aside>

        <div className="shop-results">
          <div className="shop-results-heading">
            <div>
              <p className="eyebrow">PRODUCT CATALOGUE</p>
              <h2>{activeLabel}</h2>
            </div>
            <span className="shop-result-count" role="status" aria-live="polite">{totalVisible} {totalVisible === 1 ? 'product' : 'products'}</span>
          </div>

          <div className="shop-toolbar">
            <label className="shop-sort">
              <ArrowUpDown size={14} />
              <span>Sort</span>
              <select aria-label="Sort products" value={sort} onChange={(event) => updateParams({ sort: event.target.value as SortKey })}>
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            {hasFilters && (
              <button type="button" className="shop-clear-filters" onClick={clearAll}>Clear all filters <X size={14} /></button>
            )}
          </div>

          {totalVisible > 0 ? (
            groups.map((group) => (
              <div key={group.key} className="product-group">
                <h3 className="product-group-heading">
                  {group.sectionTitle}
                  {group.subsection && <span> · {group.subsection}</span>}
                </h3>
                <div className="product-grid">
                  {group.items.map((item, index) => (
                    <ProductCard key={item.slug} product={item} index={index} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="shop-empty" role="status">
              <span className="shop-empty-icon"><Search size={22} /></span>
              <h3>No matching products</h3>
              <p>
                {query.trim()
                  ? <>Nothing in {activeSection === 'all' ? 'the catalogue' : '“' + activeLabel + '”'} matches “{query.trim()}”. Try a product name or model code, or clear your filters.</>
                  : <>No products match the current filters. Clear them to browse the full catalogue.</>}
              </p>
              <button className="button button-dark" onClick={clearAll}>Clear filters <X size={15} /></button>
            </div>
          )}

          <div className="shop-catalogue-status">
            <span className="shop-status-dot" />
            <div>
              <strong>Catalogue prices being updated</strong>
              <p>Product prices are being added by the store team. Until a price appears here, please confirm pricing and availability on enquiry.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
