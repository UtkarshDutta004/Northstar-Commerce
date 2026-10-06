import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addToCart } from '../features/cartSlice.js';
import Rating from './Rating.jsx';

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const image = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85';
  function addItem(event) {
    event.preventDefault();
    if (!product.stock) return toast.error('This item is currently sold out.');
    dispatch(addToCart({ productId: product._id, slug: product.slug, name: product.name, price: product.price, image, stock: product.stock, quantity: 1 }));
    toast.success('Added to your bag');
  }

  return (
    <article className="product-card" style={{ '--card-delay': `${index * 55}ms` }}>
      <Link className="product-image-link" to={`/products/${product.slug}`}>
        <div className="product-image-wrap"><img className="product-image" src={image} alt={product.name} loading={index > 3 ? 'lazy' : 'eager'} />
          {product.compareAtPrice > product.price && <span className="product-badge">A good find</span>}
          <button className="quick-add" onClick={addItem} aria-label={`Add ${product.name} to bag`} disabled={!product.stock}><ShoppingBag size={17} /></button>
        </div>
        <div className="product-card-meta"><div><p className="product-category">{product.category?.name || 'Northstar goods'}</p><h3>{product.name}</h3></div><span className="product-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span></div>
      </Link>
      <div className="product-card-bottom"><div className="product-price"><span>${product.price.toFixed(2)}</span>{product.compareAtPrice > product.price && <del>${product.compareAtPrice.toFixed(2)}</del>}</div><Rating value={product.averageRating} count={product.reviewCount} compact /></div>
    </article>
  );
}
