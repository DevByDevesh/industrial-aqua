import { ArrowRight, ArrowUpRight, Check, ChevronRight, ClipboardList, Droplets, Factory, Filter, Gauge, Layers3, MessageCircle, Settings2, ShieldCheck, Thermometer, Waves, Wind, Zap, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories, categoryPath } from '../data/catalogue';
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
const tileQuads: { title: string; to: string; slugs: string[]; labels: string[] }[] = [
  {
    title: 'Filters & housings',
    to: '/category/filters',
    slugs: ['10-black-fv-housing-housings-filters', '10-fv-white-housing-housings-filters', 'mh-nextech-housings-filters', 'inline-nextech-filter-housings-filters'],
    labels: ['Housings', 'White housing', 'MH series', 'Inline filters'],
  },
  {
    title: 'Pumps, valves & fittings',
    to: '/category/pumps-valves',
    slugs: ['pump-nextech-pro-2-yr-warranty-pumps', 'pump-crv-100-gpd-prime-pumps', 'valve-034a-fittings', 'connector-006a-fittings'],
    labels: ['Booster pumps', 'CRV pumps', 'Valves', 'Connectors'],
  },
];

const categoryIcons: Record<string, LucideIcon> = {
  'domestic-ro': Droplets,
  'commercial-ro': Waves,
  '500-1000-lph': Gauge,
  'industrial-ro': Factory,
  'filters': Filter,
  'membranes': Layers3,
  'pumps-valves': Settings2,
  'tanks': ShieldCheck,
  'solutions': Zap,
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
  const products = useProducts();
  const items = products.filter((product) => product.section === sectionId).slice(0, 10);
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
  const membraneImage = productImages['nextech-80-gpd-membranes'];
  const heroImages = [
    productImages['pump-nextech-150-gpd-pumps'],
    productImages['nextech-100-gpd-membranes'],
    productImages['10-20-blue-housing-housings-filters'],
  ].filter(Boolean) as string[];

  return (
    <div className="home-page amz-home">
      {/* Banner */}
      <section className="amz-banner">
        <div className="amz-banner-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> RO SYSTEMS · SPARE PARTS · WATER TREATMENT</p>
          <h1>Water solutions for <em>every scale.</em></h1>
          <p>RO plants, membranes, pumps, filters & fittings for domestic, commercial and industrial needs — confirmed personally on WhatsApp.</p>
          <div className="amz-banner-actions">
            <Link to="/shop" className="button button-dark">Shop all products <ArrowRight size={15} /></Link>
            <a href={whatsapp('water treatment solutions')} target="_blank" rel="noreferrer" className="button secondary">
              <MessageCircle size={15} /> Enquire on WhatsApp
            </a>
          </div>
          <div className="home-proof">
            <span><Check size={14} /> 98 products in the catalogue</span>
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
        {tileQuads.map((tile) => (
          <article key={tile.title} className="amz-tile">
            <h2>{tile.title}</h2>
            <div className="amz-quad">
              {tile.slugs.map((slug, index) => (
                <Link key={slug} to={tile.to} className="amz-quad-item">
                  <img src={productImages[slug]} alt={tile.labels[index]} loading="lazy" />
                  <span>{tile.labels[index]}</span>
                </Link>
              ))}
            </div>
            <Link to={tile.to} className="amz-tile-link">Shop now <ArrowRight size={13} /></Link>
          </article>
        ))}

        <article className="amz-tile">
          <h2>Membranes</h2>
          <Link to="/category/membranes" className="amz-tile-single">
            {membraneImage && <img src={membraneImage} alt="RO membranes" loading="lazy" />}
          </Link>
          <p className="amz-tile-note">80–300 GPD membranes from the catalogue range.</p>
          <Link to="/category/membranes" className="amz-tile-link">Shop now <ArrowRight size={13} /></Link>
        </article>

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

      {/* Product shelves */}
      <ProductShelf sectionId="our-import" title="Our Import range" />
      <ProductShelf sectionId="fittings" title="Fittings & connectors" />

      {/* Category strip */}
      <section className="amz-shelf">
        <div className="amz-shelf-head">
          <h2>Shop by category</h2>
          <Link to="/find-parts" className="amz-see-all">Find parts <ChevronRight size={14} /></Link>
        </div>
        <div className="amz-cat-grid">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] ?? Droplets;
            return (
              <Link key={category.slug} to={categoryPath(category)} className="amz-cat-card">
                <span className="amz-cat-icon"><Icon size={22} strokeWidth={1.4} /></span>
                <span className="amz-cat-title">{category.title}</span>
                <span className="amz-cat-desc">{category.description}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <ProductShelf sectionId="accessories" title="Accessories & controls" />
      <ProductShelf sectionId="pro-series" title="Pro Series" />

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
          <Link to="/shop" className="amz-chip amz-chip-dark">All 98 products <ArrowRight size={13} /></Link>
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
