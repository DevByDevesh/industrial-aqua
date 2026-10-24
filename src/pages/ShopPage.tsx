import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpDown, ArrowUpRight, Check, Filter, Search, SlidersHorizontal, X, MessageCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { categories, categoryPath, isCategorySlug, type Category } from '../data/catalogue';
import { whatsappEnquiryLink } from '../lib/enquiry';

type SortKey = 'featured' | 'az' | 'za';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured order' },
  { value: 'az', label: 'Name A–Z' },
  { value: 'za', label: 'Name Z–A' },
];

const filterOptions: { id: string; label: string; group?: string }[] = [
  { id: 'all', label: 'All products', group: 'Browse all' },
  ...categories.map((category) => ({ id: category.slug, label: category.title, group: category.group })),
];

function matchesQuery(category: Category, query: string): boolean {
  if (!query) return true;
  return (category.title + ' ' + category.description + ' ' + category.tag).toLowerCase().includes(query);
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters live in the URL (?q=, ?category=, ?sort=) so results stay
  // consistent across refresh, back/forward and links from the header search.
  const urlQuery = searchParams.get('q') ?? '';
  const active = isCategorySlug(searchParams.get('category')) ? (searchParams.get('category') as string) : 'all';
  const sortParam = searchParams.get('sort');
  const sort: SortKey = sortParam === 'az' || sortParam === 'za' ? sortParam : 'featured';

  // The input keeps its own text while typing and follows the URL when it
  // changes from elsewhere (header search, back/forward, category links).
  const [query, setQuery] = useState(urlQuery);
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const updateParams = (changes: { q?: string; category?: string; sort?: SortKey }) => {
    const next = new URLSearchParams(searchParams);
    const q = changes.q !== undefined ? changes.q : urlQuery;
    const category = changes.category !== undefined ? changes.category : active;
    const nextSort = changes.sort !== undefined ? changes.sort : sort;
    if (q.trim()) next.set('q', q); else next.delete('q');
    if (category !== 'all') next.set('category', category); else next.delete('category');
    if (nextSort !== 'featured') next.set('sort', nextSort); else next.delete('sort');
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => {
    setQuery('');
    setSearchParams({}, { replace: true });
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = categories.filter(
      (category) => (active === 'all' || category.slug === active) && matchesQuery(category, needle),
    );
    if (sort === 'az') return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'za') return [...filtered].sort((a, b) => b.title.localeCompare(a.title));
    return filtered;
  }, [active, query, sort]);

  const activeLabel = active === 'all' ? 'Explore our range' : categories.find((category) => category.slug === active)?.title;
  const hasFilters = active !== 'all' || query.trim() !== '' || sort !== 'featured';

  return (
    <div className="shop-page">
      <section className="shop-intro">
        <div className="shop-breadcrumb"><Link to="/">Home</Link><span>/</span><span>Products</span></div>
        <p className="eyebrow"><span className="eyebrow-dot" /> THE INDUSTRIAL AQUA RANGE</p>
        <h1>Systems for <em>every scale.</em></h1>
        <p className="shop-intro-copy">Explore domestic and commercial RO systems, industrial RO plants, replacement components and water treatment solutions. Ask our team to confirm specifications, availability and pricing.</p>
        <form className="shop-search" onSubmit={(event) => event.preventDefault()}>
          <Search size={19} />
          <input
            aria-label="Search product categories"
            value={query}
            onChange={(event) => { setQuery(event.target.value); updateParams({ q: event.target.value }); }}
            onKeyDown={(event) => { if (event.key === 'Escape' && query) { setQuery(''); updateParams({ q: '' }); } }}
            placeholder="Search RO plants, filters, ETP, UV..."
          />
          {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); updateParams({ q: '' }); }}><X size={16} /></button>}
          <button type="submit" className="shop-search-submit">Search <ArrowRight size={15} /></button>
        </form>
        <div className="shop-intro-meta"><span><Check size={14} /> Domestic to industrial</span><span><Check size={14} /> Enquiry-led product details</span></div>
      </section>

      <section className="shop-catalogue">
        <aside className="shop-sidebar">
          <div className="shop-sidebar-heading"><SlidersHorizontal size={16} /><span>Product categories</span></div>
          <div className="shop-category-list" role="group" aria-label="Filter by category">
            {filterOptions.map((item) => (
              <button
                type="button"
                key={item.id}
                className={active === item.id ? 'active' : ''}
                aria-pressed={active === item.id}
                onClick={() => updateParams({ category: item.id })}
              >
                <span>{item.label}</span>{active === item.id && <Check size={14} />}
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
              <p className="eyebrow">PRODUCT DIRECTORY</p>
              <h2>{activeLabel}</h2>
            </div>
            <span className="shop-result-count" role="status" aria-live="polite">{visible.length} {visible.length === 1 ? 'category' : 'categories'}</span>
          </div>

          <div className="shop-toolbar">
            <label className="shop-sort">
              <ArrowUpDown size={14} />
              <span>Sort</span>
              <select aria-label="Sort categories" value={sort} onChange={(event) => updateParams({ sort: event.target.value as SortKey })}>
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            {hasFilters && (
              <button type="button" className="shop-clear-filters" onClick={clearAll}>Clear all filters <X size={14} /></button>
            )}
          </div>

          {visible.length > 0 ? (
            <div className="shop-category-grid">
              {visible.map((item, index) => (
                <motion.article
                  key={item.slug}
                  className="shop-category-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.035 }}
                >
                  <Link to={categoryPath(item)} className="shop-card-art" aria-label={'Open ' + item.title}>
                    <span className="shop-card-number">{String(categories.indexOf(item) + 1).padStart(2, '0')} / PRODUCT</span>
                    <div className={'shop-art-symbol shop-art-' + item.art}>
                      <span className="shop-art-ring" />
                      <span className="shop-art-core">{item.art === 'filter' ? 'F' : item.art === 'membrane' ? 'M' : item.art === 'pump' ? 'P' : '+'}</span>
                    </div>
                    <span className="shop-card-tag">{item.tag}</span>
                  </Link>
                  <div className="shop-card-copy">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <Link to={categoryPath(item)} className="shop-card-link">View category <ArrowRight size={15} /></Link>
                    <a href={whatsappEnquiryLink(item.title)} target="_blank" rel="noreferrer" className="shop-card-whatsapp"><MessageCircle size={14} /> Enquire on WhatsApp <ArrowUpRight size={14} /></a>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="shop-empty" role="status">
              <span className="shop-empty-icon"><Search size={22} /></span>
              <h3>No matching categories</h3>
              <p>
                {query.trim()
                  ? <>Nothing in {active === 'all' ? 'the directory' : '“' + activeLabel + '”'} matches “{query.trim()}”. Try a broader search term or clear your filters.</>
                  : <>No categories match the current filters. Clear them to explore all products.</>}
              </p>
              <button className="button button-dark" onClick={clearAll}>Clear filters <X size={15} /></button>
            </div>
          )}

          <div className="shop-catalogue-status">
            <span className="shop-status-dot" />
            <div>
              <strong>Product catalogue in progress</strong>
              <p>These are product categories, not individual stock listings. Upload your catalogue to add verified models, specifications, prices and product photos.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
