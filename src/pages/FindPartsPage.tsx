import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Camera, MessageCircle, PackageSearch, RotateCcw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productSections } from '../data/products';
import { useProducts } from '../lib/useProducts';
import { whatsappEnquiryLink } from '../lib/enquiry';
import { ProductCard } from '../components/ProductCard';

// Guided product finder. It asks only questions the catalogue data can
// actually answer — product category (section), part type (subsection)
// and the model code printed on the part — and returns exact catalogue
// matches. It NEVER claims a part fits a specific RO system: no
// compatibility data exists, so fitment is confirmed by the store team
// on WhatsApp before ordering.
export function FindPartsPage() {
  const { products, settled } = useProducts();
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [subsection, setSubsection] = useState<string | null>(null);
  const [codeQuery, setCodeQuery] = useState('');

  // Catalogue shape (2026-10-28 Howrah re-seed): a product's subsection
  // carries its category slug and its section carries the category title,
  // so section membership is tested against the slug. The catalogue has a
  // single category level — no part types within a section — so step 2
  // finds nothing and stays hidden; genuine subsection values (distinct
  // from the section slug) would be picked up here automatically.
  const subsections = useMemo(() => {
    if (!sectionId) return [];
    const title = productSections.find((section) => section.id === sectionId)?.title;
    const seen = new Set<string>();
    for (const product of products) {
      if (product.section === title && product.subsection && product.subsection !== sectionId) {
        seen.add(product.subsection);
      }
    }
    return [...seen].sort();
  }, [products, sectionId]);

  const matches = useMemo(() => {
    if (!sectionId) return [];
    const query = codeQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (product.subsection !== sectionId) return false;
      if (subsection && product.subsection !== subsection) return false;
      if (!query) return true;
      const haystack = [product.name, product.code ?? '', product.subsection ?? '', ...product.specs]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [products, sectionId, subsection, codeQuery]);

  const sectionTitle = productSections.find((section) => section.id === sectionId)?.title;

  const reset = () => {
    setSectionId(null);
    setSubsection(null);
    setCodeQuery('');
  };

  return (
    <div className="shop-page">
      <section className="shop-intro">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span><span>Find parts</span>
        </nav>
        <p className="eyebrow"><span className="eyebrow-dot" /> PRODUCT FINDER</p>
        <h1>Find parts for your RO</h1>
        <p className="shop-intro-copy">
          Answer two or three quick questions and we will show exact matches from the catalogue.
          We only match on real catalogue data — whether a part fits your specific system is confirmed
          by the store team before you order, never guessed.
        </p>
      </section>

      <section className="finder-body">
        <fieldset className="finder-step">
          <legend><span className="finder-step-num">1</span> What kind of part do you need?</legend>
          <div className="finder-options" role="group" aria-label="Catalogue sections">
            {productSections.map((section) => {
              const count = products.filter((product) => product.subsection === section.id).length;
              const active = sectionId === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={'finder-option' + (active ? ' active' : '')}
                  aria-pressed={active}
                  onClick={() => {
                    setSectionId(active ? null : section.id);
                    setSubsection(null);
                  }}
                >
                  <span className="finder-option-title">{section.title}</span>
                  <span className="finder-option-count">{count} products</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {sectionId && subsections.length > 0 && (
          <fieldset className="finder-step">
            <legend><span className="finder-step-num">2</span> Which type of {sectionTitle?.toLowerCase()}?</legend>
            <div className="finder-chips" role="group" aria-label="Part types">
              <button
                type="button"
                className={'finder-chip' + (subsection === null ? ' active' : '')}
                aria-pressed={subsection === null}
                onClick={() => setSubsection(null)}
              >
                All types
              </button>
              {subsections.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={'finder-chip' + (subsection === name ? ' active' : '')}
                  aria-pressed={subsection === name}
                  onClick={() => setSubsection(subsection === name ? null : name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {sectionId && (
          <div className="finder-step">
            <label className="finder-label" htmlFor="finder-code">
              <span className="finder-step-num">3</span> Model code or keyword <span className="finder-optional">(optional)</span>
            </label>
            <div className="shop-search finder-code">
              <Search size={18} />
              <input
                id="finder-code"
                value={codeQuery}
                onChange={(event) => setCodeQuery(event.target.value)}
                placeholder="Code printed on the part — e.g. 004A — or a keyword like membrane"
              />
              {codeQuery && (
                <button type="button" className="shop-search-clear" onClick={() => setCodeQuery('')}>
                  Clear
                </button>
              )}
            </div>
            <p className="finder-hint">Leave this blank if you do not know the code — the type selection above is enough.</p>
          </div>
        )}

        <div className="finder-results" aria-live="polite">
          {!sectionId ? (
            <div className="shop-empty" role="status">
              <span className="shop-empty-icon"><PackageSearch size={22} /></span>
              <h3>Start with step 1</h3>
              <p>Choose the kind of part you need and matching catalogue products will appear here.</p>
              <p className="finder-whatsapp-alt">
                Not sure what the part is called? Send us a photo of it instead.{' '}
                <a href={whatsappEnquiryLink('help identifying a part from a photo')} target="_blank" rel="noreferrer">
                  <Camera size={14} /> Identify it on WhatsApp
                </a>
              </p>
            </div>
          ) : matches.length > 0 ? (
            <>
              <div className="finder-results-head">
                <h2>{matches.length} catalogue match{matches.length === 1 ? '' : 'es'}</h2>
                <button type="button" className="shop-clear-filters" onClick={reset}>
                  <RotateCcw size={13} /> Start over
                </button>
              </div>
              <p className="finder-fitment-note">
                These products match your category{codeQuery.trim() ? ' and code/keyword' : ''} selection.
                Fitment for a specific RO system is confirmed by the store team before ordering.
              </p>
              <div className="product-grid">
                {matches.slice(0, 24).map((product, index) => (
                  <ProductCard key={product.slug} product={product} index={index} />
                ))}
              </div>
              {matches.length > 24 && (
                <p className="finder-hint">
                  Showing the first 24 — <Link to={'/shop?section=' + sectionId}>see all {matches.length} in the shop</Link>.
                </p>
              )}
            </>
          ) : (
            <div className="shop-empty" role="status">
              <span className="shop-empty-icon"><PackageSearch size={22} /></span>
              <h3>No verified match in the catalogue</h3>
              <p>
                {settled
                  ? 'Nothing in the current catalogue matches that combination. The code may be misread (0 vs O, 1 vs I are common), the part may be listed under another type, or it may not be a part we currently list.'
                  : 'Checking the live catalogue…'}
              </p>
              <div className="finder-empty-actions">
                {codeQuery && (
                  <button type="button" className="button secondary" onClick={() => setCodeQuery('')}>
                    Clear the code & show all {sectionTitle}
                  </button>
                )}
                <a href={whatsappEnquiryLink('identifying a part — code: ' + (codeQuery.trim() || 'unknown'))} target="_blank" rel="noreferrer" className="button button-dark">
                  <MessageCircle size={15} /> Send a photo on WhatsApp <ArrowUpRight size={14} />
                </a>
              </div>
              <p className="finder-hint">The team can identify most parts from a clear photo of the old part and its label.</p>
            </div>
          )}
        </div>

        <div className="info-card find-help">
          <h2><MessageCircle size={17} /> Still not sure?</h2>
          <p>
            Send the team a photo of your current part or your system model on WhatsApp — they will help identify
            the right replacement. Compatibility is confirmed only when it can be verified.
          </p>
          <a href={whatsappEnquiryLink('help finding a part')} target="_blank" rel="noreferrer" className="button button-dark">
            Ask on WhatsApp <ArrowRight size={14} />
          </a>
        </div>
      </section>
    </div>
  );
}
