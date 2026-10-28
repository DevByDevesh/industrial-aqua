import { ArrowRight, ArrowUpRight, Check, ChevronRight, ClipboardList, Droplets, Factory, Filter, Gauge, MessageCircle, Settings2, Thermometer, Waves, Wind, Zap, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productSections } from '../data/products';
import { productImages } from '../data/product-images';
import { whatsappEnquiryLink as whatsapp } from '../lib/enquiry';
import { useProducts } from '../lib/useProducts';
import { useAuth } from '../lib/auth';
import { ProductCard } from '../components/ProductCard';

// Amazon-style storefront home: a slim banner, an overlapping row of
// shopping tiles (category quads + account card), then product shelves
// per catalogue section. Everything shown is the store's real catalogue —
// no invented ratings, discounts or bestseller claims.
// Homepage tiles, shelves and the category grid are all derived from the
// live catalogue (the 27 Howrah sections since the 2026-10-28 re-seed):
// a product's subsection carries its section slug, its section the title.
const sectionIcons: Record<string, LucideIcon> = {
  'water-treatment-systems': Droplets,
  'reverse-osmosis-machine': Waves,
  'reverse-osmosis-plants': Factory,
  'effluent-treatment-plant': Factory,
  'swimming-pool': Waves,
  'water-softening-plant': Waves,
  'online-water-chiller': Thermometer,
  'iron-removal-filters': Filter,
  'filter-media': Filter,
  'bottle-filling-machine': Gauge,
  'bottling-plant': Gauge,
  'pet-blowing-machine': Wind,
  'batch-coding-machine': Settings2,
};

const solutions = [
  { title: 'ETP Systems', description: 'Effluent treatment for industrial wastewater.', icon: Factory },
  { title: 'STP Systems', description: 'Sewage treatment for buildings & facilities.', icon: Wind },
  { title: 'Water Softeners', description: 'Reduce hardness in feed water.', icon: Waves },
  { title: 'UV Systems', description: 'UV disinfection for suitable setups.', icon: Zap },
  { title: 'UF Systems', description: 'Ultrafiltration for treatment needs.', icon: Filter },
  { title: 'Water Chillers', description: 'Chilling for process & commercial use.', icon: Thermometer },
];

function ProductShelf({ sectionId, title }: { sectionId: string; title: string }) {
  const { products } = useProducts();
  const items = products.filter((product) => product.subsection === sectionId).slice(0, 10);
  if (items.length === 0) return null;
  return (
    <section className="amz-shelf">
      <div className="amz-shelf-head">
        <h2>{title}</h2>
        <Link to={'/shop?section=' + sectionId} className="amz-see-all">See all <ChevronRight size={14} /></Link>
      </div>
      <div className="amz-row">
        {items.map((product, index) => (
          <div key={product.slug} className="amz-row-item">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const { products: allProducts } = useProducts();

  const productsInSection = (sectionId: string) => allProducts.filter((product) => product.subsection === sectionId);
  const sectionsWithProducts = productSections.filter((section) => productsInSection(section.id).length > 0);
  const shelfSections = sectionsWithProducts.slice(0, 4);

  // Quad tiles: the first two sections with at least four photographed
  // products; the single-image tile: the next section with a photo.
  const withImages = (sectionId: string) => productsInSection(sectionId).filter((product) => productImages[product.slug]);
  const quadTiles = sectionsWithProducts
    .filter((section) => withImages(section.id).length >= 4)
    .slice(0, 2)
    .map((section) => ({
      title: section.title,
      to: '/category/' + section.id,
      items: withImages(section.id).slice(0, 4),
    }));
  const singleSection = sectionsWithProducts.find(
    (section) => !quadTiles.some((tile) => tile.to === '/category/' + section.id) && withImages(section.id).length > 0,
  );
  const singleTile = singleSection
    ? {
        title: singleSection.title,
        to: '/category/' + singleSection.id,
        image: productImages[withImages(singleSection.id)[0].slug],
        note: productsInSection(singleSection.id).length + ' products in this range.',
      }
    : null;

  const heroImages = sectionsWithProducts
    .slice(0, 3)
    .map((section) => withImages(section.id)[0])
    .filter(Boolean)
    .map((product) => productImages[product.slug]);

  return (
    <div className="home-page amz-home">
      {/* Banner */}
      <section className="amz-banner">
        <div className="amz-banner-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> RO PLANTS · WATER TREATMENT · BOTTLING</p>
          <h1>Water solutions for <em>every scale.</em></h1>
          <p>Water treatment systems, RO plants, bottling plants, chillers and more for commercial and industrial needs — confirmed personally on WhatsApp.</p>
          <div className="amz-banner-actions">
            <Link to="/shop" className="button button-dark">Shop all products <ArrowRight size={15} /></Link>
            <a href={whatsapp('water treatment solutions')} target="_blank" rel="noreferrer" className="button secondary">
              <MessageCircle size={15} /> Enquire on WhatsApp
            </a>
          </div>
          <div className="home-proof">
            <span><Check size={14} /> {allProducts.length} products in the catalogue</span>
            <span><Check size={14} /> Enquiry-led support</span>
          </div>
        </div>
        {heroImages.length > 0 && (
          <div className="amz-banner-collage" aria-hidden="true">
            {heroImages.map((src, index) => (
              <img key={src} src={src} alt="" className={'amz-collage-' + (index + 1)} loading={index === 0 ? 'eager' : 'lazy'} />
            ))}
          </div>
        )}
      </section>

      {/* Overlapping tiles */}
      <section className="amz-tiles">
        {quadTiles.map((tile) => (
          <article key={tile.title} className="amz-tile">
            <h2>{tile.title}</h2>
            <div className="amz-quad">
              {tile.items.map((product) => (
                <Link key={product.slug} to={tile.to} className="amz-quad-item">
                  <img src={productImages[product.slug]} alt={product.name} loading="lazy" />
                  <span>{product.name}</span>
                </Link>
              ))}
            </div>
            <Link to={tile.to} className="amz-tile-link">Shop now <ArrowRight size={13} /></Link>
          </article>
        ))}

        {singleTile && (
          <article className="amz-tile">
            <h2>{singleTile.title}</h2>
            <Link to={singleTile.to} className="amz-tile-single">
              {singleTile.image && <img src={singleTile.image} alt={singleTile.title} loading="lazy" />}
            </Link>
            <p className="amz-tile-note">{singleTile.note}</p>
            <Link to={singleTile.to} className="amz-tile-link">Shop now <ArrowRight size={13} /></Link>
          </article>
        )}

        <article className="amz-tile amz-tile-account">
          <h2>{user ? 'Welcome back' : 'Your account'}</h2>
          <p className="amz-tile-note">
            {user
              ? 'Signed in as ' + user.email + '. Your orders are saved in your account.'
              : 'Sign in to place orders faster and keep your order history in one place.'}
          </p>
          <div className="amz-account-actions">
            {user ? (
              <Link to="/account/orders" className="button button-dark"><ClipboardList size={15} /> Your orders</Link>
            ) : (
              <>
                <Link to="/account/login" className="button button-dark">Sign in</Link>
                <Link to="/account/register" className="amz-tile-link">Create account <ArrowRight size={13} /></Link>
              </>
            )}
          </div>
          <a href={whatsapp('a product enquiry')} target="_blank" rel="noreferrer" className="amz-tile-link">
            <MessageCircle size={13} /> Ask on WhatsApp <ArrowUpRight size={13} />
          </a>
        </article>
      </section>

      {/* Product shelves — first sections of the catalogue with products */}
      {shelfSections.slice(0, 2).map((section) => (
        <ProductShelf key={section.id} sectionId={section.id} title={section.title} />
      ))}

      {/* Category strip */}
      <section className="amz-shelf">
        <div className="amz-shelf-head">
          <h2>Shop by category</h2>
          <Link to="/find-parts" className="amz-see-all">Find parts <ChevronRight size={14} /></Link>
        </div>
        <div className="amz-cat-grid">
          {productSections.map((section) => {
            const Icon = sectionIcons[section.id] ?? Droplets;
            const count = productsInSection(section.id).length;
            return (
              <Link key={section.id} to={'/category/' + section.id} className="amz-cat-card">
                <span className="amz-cat-icon"><Icon size={22} strokeWidth={1.4} /></span>
                <span className="amz-cat-title">{section.title}</span>
                <span className="amz-cat-desc">{count} {count === 1 ? 'product' : 'products'} in this range</span>
              </Link>
            );
          })}
        </div>
      </section>

      {shelfSections.slice(2, 4).map((section) => (
        <ProductShelf key={section.id} sectionId={section.id} title={section.title} />
      ))}

      {/* Solutions band */}
      <section className="amz-shelf">
        <div className="amz-shelf-head">
          <h2>Water treatment solutions</h2>
          <a href={whatsapp('water treatment solutions')} target="_blank" rel="noreferrer" className="amz-see-all">Discuss a solution <ChevronRight size={14} /></a>
        </div>
        <div className="amz-sol-grid">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <a key={solution.title} href={whatsapp(solution.title)} target="_blank" rel="noreferrer" className="amz-sol-card">
                <span className="amz-cat-icon"><Icon size={22} strokeWidth={1.4} /></span>
                <span className="amz-cat-title">{solution.title}</span>
                <span className="amz-cat-desc">{solution.description}</span>
                <span className="amz-tile-link">Enquire <ArrowUpRight size={13} /></span>
              </a>
            );
          })}
        </div>
        <p className="catalogue-note"><span /> Product details, specifications, pricing and availability are confirmed on enquiry.</p>
      </section>

      {/* Sections quick links */}
      <section className="amz-shelf amz-sections-strip">
        <div className="amz-shelf-head"><h2>Catalogue sections</h2></div>
        <div className="amz-section-chips">
          {productSections.map((section) => (
            <Link key={section.id} to={'/shop?section=' + section.id} className="amz-chip">
              {section.title} <ArrowUpRight size={13} />
            </Link>
          ))}
          <Link to="/shop" className="amz-chip amz-chip-dark">All {allProducts.length} products <ArrowRight size={13} /></Link>
        </div>
      </section>

      <section className="home-bottom-cta">
        <div>
          <p className="eyebrow">INDUSTRIAL AQUA</p>
          <h2>Tell us what your water system <em>needs.</em></h2>
        </div>
        <a href={whatsapp('a product or plant quotation')} target="_blank" rel="noreferrer" className="button button-dark">
          Request an enquiry <MessageCircle size={16} />
        </a>
      </section>
    </div>
  );
}
