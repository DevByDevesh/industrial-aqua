import { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronRight, MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productSections } from '../data/products';
import { productImages } from '../data/product-images';
import { categories } from '../data/catalogue';
import { useProducts } from '../lib/useProducts';
import { useCart } from '../lib/cart';
import { MAX_QTY } from '../lib/cart-model';
import { useToast } from '../components/feedback/ToastProvider';
import { whatsappEnquiryLink } from '../lib/enquiry';
import { ProductCard } from '../components/ProductCard';

// Reverse lookup: which directory category (if any) shows this product's
// section, for the breadcrumb trail.
function categoryForSection(sectionId: string) {
  return categories.find((category) => category.slug === 'filters' && sectionId === 'housings-filters')
    ?? categories.find((category) => category.slug === 'membranes' && sectionId === 'membranes')
    ?? categories.find((category) => category.slug === 'pumps-valves' && sectionId === 'pumps');
}

export function ProductPage() {
  const { slug } = useParams();
  const { products, settled } = useProducts();
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const product = products.find((item) => item.slug === slug);
  const related = useMemo(
    () => (product ? products.filter((item) => item.section === product.section && item.slug !== product.slug).slice(0, 4) : []),
    [products, product],
  );

  if (!product && !settled) {
    return (
      <div className="shop-page">
        <section className="shop-intro">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link><span>/</span><Link to="/shop">Products</Link><span>/</span><span>Loading</span>
          </nav>
          <h1>Loading product…</h1>
          <p className="shop-intro-copy" role="status">Checking the live catalogue for this product.</p>
        </section>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="shop-page">
        <section className="shop-intro">
          <nav className="shop-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link><span>/</span><Link to="/shop">Products</Link><span>/</span><span>Not found</span>
          </nav>
          <h1>Product not found</h1>
          <p className="shop-intro-copy">This product is not in the current catalogue. Browse the full shop or ask the team on WhatsApp.</p>
          <Link to="/shop" className="button button-dark">Browse all products <ArrowRight size={15} /></Link>
        </section>
      </div>
    );
  }

  const sectionTitle = productSections.find((section) => section.id === product.section)?.title ?? product.section;
  const category = categoryForSection(product.section);
  const image = productImages[product.slug];

  const addToBag = () => {
    cart.add(product, qty);
    toast.showToast({
      title: 'Added to bag',
      description: product.name + ' × ' + qty,
      actionLabel: 'View bag',
      onAction: () => navigate('/cart'),
    });
  };

  return (
    <div className="shop-page">
      <section className="shop-intro product-intro">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span>/</span><Link to="/shop">Products</Link>
          {category && (<><span>/</span><Link to={'/category/' + category.slug}>{category.title}</Link></>)}
          <span>/</span><span>{product.name}</span>
        </nav>
      </section>

      <section className="product-detail">
        <div className="product-detail-media">
          {image ? (
            <img src={image} alt={product.name} />
          ) : (
            <div className="product-detail-nophoto">Photo coming soon — ask us on WhatsApp for product images.</div>
          )}
        </div>
        <div className="product-detail-info">
          <p className="eyebrow"><span className="eyebrow-dot" /> {sectionTitle}{product.subsection ? ' · ' + product.subsection : ''}</p>
          <h1>{product.name}</h1>
          <dl className="product-detail-meta">
            <div>
              <dt>Category</dt>
              <dd>{category ? <Link to={'/category/' + category.slug}>{category.title}</Link> : sectionTitle}</dd>
            </div>
            <div>
              <dt>Catalogue section</dt>
              <dd><Link to={'/shop?section=' + product.section}>{sectionTitle}</Link>{product.subsection ? ' · ' + product.subsection : ''}</dd>
            </div>
            <div>
              <dt>SKU / Model code</dt>
              <dd>{product.code ?? 'Not supplied — ask the team to confirm the code for this item.'}</dd>
            </div>
            <div>
              <dt>Stock</dt>
              <dd>Confirmed on enquiry — live stock levels are not published.</dd>
            </div>
          </dl>
          {product.description && (
            <div className="product-detail-desc">
              <h2>About this product</h2>
              <p>{product.description}</p>
            </div>
          )}
          {product.specs.length > 0 && (
            <>
              <h2 className="product-detail-specs-title">Technical specifications</h2>
              <ul className="product-detail-specs">
                {product.specs.map((spec) => (
                  <li key={spec}><Check size={14} /> {spec}</li>
                ))}
              </ul>
            </>
          )}
          <p className="product-detail-price">
            {product.price === null ? 'Price on request' : '₹' + product.price.toLocaleString('en-IN')}
          </p>
          <p className="product-detail-note">
            Specifications, availability and best pricing are confirmed by the store team on enquiry.
          </p>
          <div className="product-detail-actions">
            <label className="qty-control">
              <span>Qty</span>
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((value) => Math.max(1, value - 1))}><Minus size={14} /></button>
              <input aria-label="Quantity" value={qty} inputMode="numeric" onChange={(event) => {
                const next = parseInt(event.target.value, 10);
                setQty(Number.isNaN(next) ? 1 : Math.min(MAX_QTY, Math.max(1, next)));
              }} />
              <button type="button" aria-label="Increase quantity" disabled={qty >= MAX_QTY} onClick={() => setQty((value) => Math.min(MAX_QTY, value + 1))}><Plus size={14} /></button>
            </label>
            <button type="button" className="button button-dark" onClick={addToBag}><ShoppingBag size={15} /> Add to bag</button>
            <a href={whatsappEnquiryLink(product.name)} target="_blank" rel="noreferrer" className="button secondary">
              <MessageCircle size={15} /> Enquire on WhatsApp
            </a>
          </div>
          <p className="product-detail-links">
            <Link to="/shop">Browse the full catalogue</Link>
            <ChevronRight size={13} />
            <Link to="/support">Ordering & support help</Link>
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="category-related" aria-label="Related products">
          <h2>More in {sectionTitle}</h2>
          <div className="product-grid">
            {related.map((item, index) => (
              <ProductCard key={item.slug} product={item} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
