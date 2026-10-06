import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useSelector } from 'react-redux';

const navClass = ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const count = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/products${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="announcement"><span>Considered goods for everyday journeys</span><Link to="/products">Explore the collection <ArrowRight size={13} /></Link></div>
      <div className="header-main page-shell">
        <button className="icon-button mobile-menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <Link to="/" className="wordmark" onClick={() => setMenuOpen(false)}><span className="wordmark-star">N</span><span>NORTHSTAR<span className="wordmark-sub">SUPPLY CO.</span></span></Link>
        <nav className={`primary-nav ${menuOpen ? 'primary-nav-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/products" className={navClass} onClick={() => setMenuOpen(false)}>Shop all</NavLink>
          <NavLink to="/products?category=everyday-carry" className={navClass} onClick={() => setMenuOpen(false)}>Everyday carry</NavLink>
          <NavLink to="/products?category=field-notes" className={navClass} onClick={() => setMenuOpen(false)}>Field notes</NavLink>
        </nav>
        <div className="header-actions">
          <form className="header-search" onSubmit={submitSearch} role="search">
            <Search size={17} aria-hidden="true" />
            <input aria-label="Search products" placeholder="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
          </form>
          <Link className="icon-button header-account" aria-label={user ? 'Your account' : 'Sign in'} to={user ? '/profile' : '/login'}><UserRound /></Link>
          <Link className="icon-button bag-button" aria-label={`Shopping bag, ${count} items`} to="/cart"><ShoppingBag /><span className="bag-count">{count}</span></Link>
        </div>
      </div>
    </header>
  );
}
