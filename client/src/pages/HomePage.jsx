import { useEffect } from 'react';
import { ArrowDownRight, ArrowRight, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchProducts } from '../features/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';

const editorialImage = 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=2000&q=90';
const categoryImages = {
  'everyday-carry': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85',
  'desk-home': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85',
  'field-notes': 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=85',
};

export default function HomePage() {
  const dispatch = useDispatch();
  const { items, categories, loading, error } = useSelector((state) => state.products);
  useEffect(() => {
    dispatch(fetchProducts({ featured: true, limit: 4 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <main>
      <section className="home-hero" style={{ '--hero-image': `url(${editorialImage})` }}>
        <div className="hero-overlay" />
        <div className="hero-content page-shell">
          <p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> A little more considered</p>
          <h1>Useful goods,<br /><em>made to go.</em></h1>
          <p className="hero-description">Thoughtful objects for everyday journeys. Designed to work hard, feel good and stay with you.</p>
          <Link className="button button-citrus" to="/products">Shop the collection <ArrowRight size={17} /></Link>
          <a className="hero-scroll" href="#collection"><ArrowDownRight size={17} /> Take a look around</a>
        </div>
        <div className="hero-caption"><span>01 / OUT THERE, EVERY DAY</span><span>EST. WITH INTENTION</span></div>
      </section>

      <section id="collection" className="page-shell section-space">
        <div className="section-heading"><div><p className="eyebrow">The collection</p><h2>Good things, <em>well made.</em></h2></div><Link className="text-link" to="/products">Shop everything <MoveUpRight size={16} /></Link></div>
        {loading && !items.length ? <Loader label="Finding the good stuff" /> : error ? <Message>{error}</Message> : <div className="product-grid">{items.slice(0, 4).map((product, index) => <ProductCard key={product._id} product={product} index={index} />)}</div>}
      </section>

      <section className="category-band">
        <div className="page-shell category-section">
          <div className="section-heading category-heading"><div><p className="eyebrow">Find your way</p><h2>Made for <em>the in-between.</em></h2></div><p>From the desk to the trailhead, start with what you need.</p></div>
          <div className="category-grid">{categories.map((category, index) => <Link className="category-tile" to={`/products?category=${category.slug}`} key={category._id} style={{ '--tile-delay': `${index * 80}ms` }}>
            <img src={categoryImages[category.slug] || editorialImage} alt="" loading="lazy" /><span className="category-shade" /><span className="category-index">0{index + 1}</span><span className="category-name">{category.name}<ArrowRight size={18} /></span>
          </Link>)}</div>
        </div>
      </section>

      <section className="page-shell values-strip"><p className="eyebrow">Why Northstar</p><div className="values-grid"><article><span>01</span><h3>Made to matter</h3><p>Fewer things, better chosen. We look for quality that earns its place.</p></article><article><span>02</span><h3>Ready for real life</h3><p>Useful details and honest materials, made for everyday use.</p></article><article><span>03</span><h3>Room to roam</h3><p>Good design should get out of the way and let the day happen.</p></article></div></section>
    </main>
  );
}
