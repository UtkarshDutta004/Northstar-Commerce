import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-main">
        <div className="footer-brand"><Link to="/" className="wordmark footer-wordmark"><span className="wordmark-star">N</span><span>NORTHSTAR<span className="wordmark-sub">SUPPLY CO.</span></span></Link><p>Useful goods, made to go.<br />For wherever the day takes you.</p></div>
        <div className="footer-links"><div><span className="footer-label">Explore</span><Link to="/products">Shop all</Link><Link to="/products?category=desk-home">Desk & home</Link><Link to="/products?category=field-notes">Field notes</Link></div><div><span className="footer-label">Your account</span><Link to="/profile">My profile</Link><Link to="/orders">Order history</Link><Link to="/cart">Shopping bag</Link></div></div>
        <a className="footer-note" href="mailto:hello@northstarsupply.example">Have a question?<br /><span>We'd love to help <ArrowUpRight size={15} /></span></a>
      </div>
      <div className="page-shell footer-bottom"><span>© {new Date().getFullYear()} Northstar Supply Co.</span><span>Built for the everyday out there.</span></div>
    </footer>
  );
}
