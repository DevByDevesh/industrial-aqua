import {useCallback,useEffect,useRef,useState,type FormEvent,type PropsWithChildren} from 'react';
import {Link,NavLink,useLocation,useNavigate} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,Menu,Search,ShoppingBag,User,X} from 'lucide-react';
import {useFocusTrap} from '../accessibility/useFocusTrap';
import {useCart} from '../../lib/cart';

const navItems = [
  { to: '/shop', label: 'Shop all' },
  { to: '/category/filters', label: 'Filters' },
  { to: '/category/membranes', label: 'Membranes' },
  { to: '/category/pumps-valves', label: 'Pumps & valves' },
  { to: '/find-parts', label: 'Find parts' },
];

export function SiteShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const mobilePanelRef = useRef<HTMLElement | null>(null);
  const searchPanelRef = useRef<HTMLElement | null>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  useFocusTrap(mobilePanelRef, menuOpen, closeMenu);
  useFocusTrap(searchPanelRef, searchOpen, closeSearch);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [menuOpen, searchOpen]);

  if (location.pathname.startsWith('/admin')) return <>{children}</>;

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    setSearchOpen(false);
    if (value) navigate('/shop?q=' + encodeURIComponent(value));
    else navigate('/shop');
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="announcement-bar">Precision parts for better water, at home and at work.</div>

      <header className="site-header">
        <button
          className="mobile-menu-button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link to="/" className="brand-lockup" aria-label="Industrial Aqua home">
          <img className="brand-logo" src="/logo.png" alt="Industrial Aqua" />
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({isActive}) => (item.to === '/find-parts' ? 'find-link' : '') + (isActive ? ' active' : '')}>
              {item.label}
              {item.to === '/find-parts' && <ArrowUpRight size={14} />}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-button" aria-label="Search parts" onClick={() => setSearchOpen(true)}>
            <Search size={18} />
          </button>
          <Link to="/account" className="icon-button" aria-label="Your account"><User size={18} /></Link>
          <Link to="/cart" className="button secondary cart-button"><ShoppingBag size={16} />Cart{cart.count > 0 && <span className="cart-badge">{cart.count}</span>}</Link>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setMenuOpen(false); }}>
          <nav ref={mobilePanelRef} id="mobile-navigation" className="mobile-nav-panel" aria-label="Mobile navigation" role="dialog" aria-modal="true">
            <div className="mobile-nav-heading">
              <p className="eyebrow">MENU</p>
              <button type="button" className="icon-button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <ul>
              {navItems.map((item, index) => (
                <li key={item.to}>
                  <NavLink to={item.to} className="mobile-nav-item" onClick={() => setMenuOpen(false)}>
                    <span className="mobile-nav-index">0{index + 1}</span>
                    <span>{item.label}</span>
                    <ArrowUpRight size={16} />
                  </NavLink>
                </li>
              ))}
            </ul>
            <p className="mobile-nav-note">Product details, specifications and pricing are confirmed on enquiry while the catalogue is being completed.</p>
          </nav>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
          <section ref={searchPanelRef} className="search-panel" role="dialog" aria-modal="true" aria-label="Search parts">
            <div className="search-panel-heading">
              <div>
                <p className="eyebrow">SEARCH</p>
                <h2>Search parts</h2>
              </div>
              <button type="button" className="icon-button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form className="global-search-form" onSubmit={submitSearch}>
              <Search size={18} aria-hidden="true" />
              <label className="search-label" htmlFor="site-search">Search product categories</label>
              <input id="site-search" data-autofocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search RO plants, filters, ETP, UV..." />
              <button type="submit" className="button button-dark">Search <ArrowRight size={15} /></button>
            </form>
            <p className="search-help">Search runs across the product directory. Press Escape to close.</p>
            <Link to="/find-parts" className="search-finder-link" onClick={() => setSearchOpen(false)}>Need help choosing? Find a compatible part <ArrowUpRight size={14} /></Link>
          </section>
        </div>
      )}

      <main id="main-content" tabIndex={-1}>{children}</main>

      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <Link to="/" className="footer-brand">industrial<span>aqua</span></Link>
            <p>Precision parts for better water.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <Link to="/shop">Shop all</Link>
            <Link to="/find-parts">Find parts</Link>
            <Link to="/support">Support</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/shipping">Shipping</Link>
            <Link to="/returns">Returns</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>Industrial Aqua — Water treatment systems, RO plants and bottling plants.</span>
          <span>Product details, specifications and pricing are confirmed on enquiry while the catalogue is being completed.</span>
        </div>
      </footer>
    </div>
  );
}
