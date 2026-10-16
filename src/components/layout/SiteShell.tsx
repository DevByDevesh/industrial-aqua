import {useEffect,useState,type FormEvent,type PropsWithChildren} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,Droplets,Menu,Search,ShoppingBag,X} from 'lucide-react';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

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
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <Link to="/" className="brand-lockup" aria-label="Industrial Aqua home">
          <span className="brand-mark"><Droplets size={19} /></span>
          <span className="brand-name">industrial<span>aqua</span><small>RO</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className={item.to === '/find-parts' ? 'find-link' : ''}>
              {item.label}
              {item.to === '/find-parts' && <ArrowUpRight size={14} />}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-button" aria-label="Search parts" onClick={() => setSearchOpen(true)}>
            <Search size={18} />
          </button>
          <Link to="/cart" className="button secondary"><ShoppingBag size={16} />Cart</Link>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setMenuOpen(false); }}>
          <nav className="mobile-nav-panel" aria-label="Mobile navigation" role="dialog">
            <ul>
              {navItems.map(item => (
                <li key={item.to}><Link to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
          <section className="search-panel" role="dialog">
            <form onSubmit={submitSearch}>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search parts" />
              <button type="submit">Search</button>
            </form>
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
        </div>
      </footer>
    </div>
  );
}
