import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpDown, ArrowUpRight, Check, ChevronRight, MessageCircle, Search, X } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  categories,
  categoryBySlug,
  categoryCatalogueSections,
  categoryPath,
  productsForCategory,
} from '../data/catalogue';
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

export function CategoryPage() {
  const { slug } = useParams();
  const category = categoryBySlug(slug);
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQuery = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort');
  const sort: SortKey = sortParam === 'az' || sortParam === 'za' ? sortParam : 'featured';

  const [query, setQuery] = useState(urlQuery);
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // Local seed first (instant), then the live Firestore catalogue — the
  // same pattern as the shop, so both stay in sync with the admin edits.
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

  const categoryProducts = useMemo(
    () => (category ? productsForCategory(products, category.slug) : []),
    [products, category],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = categoryProducts.filter((product) => matchesQuery(product, needle));
    return sort === 'az'
      ? [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      : sort === 'za'
        ? [...filtered].sort((a, b) => b.name.localeCompare(a.name))
        : filtered;
  }, [categoryProducts, query, sort]);

  if (!category) {
    return (
      <div className="shop-page">
        <section className="shop-intro">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link><span>/</span><Link to="/shop">Products</Link><span>/</span><span>Category</span>
          </nav>
          <h1>Category not found</h1>
          <p className="shop-intro-copy">This category does not exist. Browse the full catalogue or pick a category below.</p>
          <Link to="/shop" className="button button-dark">Browse all products <ArrowRight size={15} /></Link>
        </section>
        <CategoryLinks current="" />
      </div>
    );
  }

  const updateParams = (changes: { q?: string; sort?: SortKey }) => {
    const next = new URLSearchParams(searchParams);
    const q = changes.q !== undefined ? changes.q : urlQuery;
    const nextSort = changes.sort !== undefined ? changes.sort : sort;
    if (q.trim()) next.set('q', q); else next.delete('q');
    if (nextSort !== 'featured') next.set('sort', nextSort); else next.delete('sort');
    setSearchParams(next, { replace: true });
  };

  const shopSection = categoryCatalogueSections[category.slug]?.[0];
  const shopLink = shopSection ? '/shop?section=' + shopSection : '/shop';
  const hasProducts = categoryProducts.length > 0;

  return (
    <div className="shop-page">
      <section className="shop-intro">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span><Link to="/shop">Products</Link><span>/</span><span>{category.title}</span>
        </nav>
        <p className="eyebrow"><span className="eyebrow-dot" /> {category.tag}</p>
        <h1>{category.title}</h1>
        <p className="shop-intro-copy">{category.description}</p>
        {hasProducts ? (
          <>
            <form className="shop-search" onSubmit={(event) => event.preventDefault()}>
              <Search size={19} />
              <input
                aria-label={'Search in ' + category.title}
                value={query}
                onChange={(event) => { setQuery(event.target.value); updateParams({ q: event.target.value }); }}
                onKeyDown={(event) => { if (event.key === 'Escape' && query) { setQuery(''); updateParams({ q: '' }); } }}
                placeholder={'Search ' + category.title.toLowerCase() + ' — name or model code...'}
              />
              {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); updateParams({ q: '' }); }}><X size={16} /></button>}
              <button type="submit" className="shop-search-submit">Search <ArrowRight size={15} /></button>
            </form>
            <div className="shop-intro-meta">
              <span><Check size={14} /> {categoryProducts.length} catalogue products</span>
              <span><Check size={14} /> <Link to={shopLink}>View in the full shop</Link></span>
            </div>
          </>
        ) : (
          <div className="shop-intro-meta">
            <span><Check size={14} /> Enquiry-led range</span>
            <span><Check size={14} /> Specifications confirmed on enquiry</span>
          </div>
        )}
      </section>

      {hasProducts ? (
        <section className="category-results">
          <div className="shop-results-heading">
            <div>
              <p className="eyebrow">PRODUCT CATALOGUE</p>
              <h2>{category.title}</h2>
            </div>
            <span className="shop-result-count" role="status" aria-live="polite">{visible.length} {visible.length === 1 ? 'product' : 'products'}</span>
          </div>
          <div className="shop-toolbar">
            <label className="shop-sort">
              <ArrowUpDown size={14} />
              <span>Sort</span>
              <select aria-label="Sort products" value={sort} onChange={(event) => updateParams({ sort: event.target.value as SortKey })}>
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            {(query.trim() || sort !== 'featured') && (
              <button type="button" className="shop-clear-filters" onClick={() => { setQuery(''); setSearchParams({}, { replace: true }); }}>
                Clear search & sort <X size={14} />
              </button>
            )}
          </div>

          {visible.length > 0 ? (
            <div className="product-grid">
              {visible.map((product, index) => (
                <ProductCard key={product.slug} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="shop-empty" role="status">
              <span className="shop-empty-icon"><Search size={22} /></span>
              <h3>No matching products</h3>
              <p>Nothing in {category.title} matches “{query.trim()}”. Try a product name or model code, or browse the full shop.</p>
              <button className="button button-dark" onClick={() => { setQuery(''); updateParams({ q: '' }); }}>Clear search <X size={15} /></button>
            </div>
          )}
        </section>
      ) : (
        <section className="category-enquiry">
          <h2>Discuss your {category.title.toLowerCase()} requirement</h2>
          <p>
            This range is supplied against enquiry rather than listed in the product catalogue, so capacities,
            specifications and pricing are confirmed for your application first. Share your requirement with
            the team and they will respond with options and a quotation.
          </p>
          <div className="category-enquiry-actions">
            <a href={whatsappEnquiryLink(category.title)} target="_blank" rel="noreferrer" className="button button-dark">
              <MessageCircle size={15} /> Enquire on WhatsApp <ArrowUpRight size={14} />
            </a>
            <Link to="/shop" className="button secondary">Browse the product catalogue <ArrowRight size={15} /></Link>
          </div>
        </section>
      )}

      <CategoryLinks current={category.slug} />
    </div>
  );
}

function CategoryLinks({ current }: { current: string }) {
  const others = categories.filter((item) => item.slug !== current);
  return (
    <section className="category-related" aria-label="More categories">
      <h2>More from the range</h2>
      <div className="category-related-grid">
        {others.map((item) => (
          <Link key={item.slug} to={categoryPath(item)} className="category-related-card">
            <span className="category-related-tag">{item.tag}</span>
            <span className="category-related-title">{item.title}</span>
            <ChevronRight size={15} />
          </Link>
        ))}
      </div>
    </section>
  );
}
