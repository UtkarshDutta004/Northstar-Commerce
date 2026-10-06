import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchProduct, clearCurrent } from '../features/productSlice.js';
import { addToCart } from '../features/cartSlice.js';
import api, { errorMessage } from '../api/client.js';
import Rating from '../components/Rating.jsx';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';

export default function ProductPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { current: product, reviews, loading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewBusy, setReviewBusy] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => { dispatch(clearCurrent()); dispatch(fetchProduct(slug)); setQuantity(1); }, [dispatch, slug]);
  if (loading && !product) return <Loader label="Finding this piece" />;
  if (error || !product) return <main className="page-shell section-space"><Message>{error || 'Product not found.'}</Message><Link className="text-link" to="/products"><ArrowLeft size={16} /> Back to the collection</Link></main>;

  const image = product.images?.[activeImage]?.url;
  function addItem() {
    dispatch(addToCart({ productId: product._id, slug: product.slug, name: product.name, price: product.price, image, stock: product.stock, quantity }));
    toast.success('Added to your bag');
  }
  async function submitReview(event) {
    event.preventDefault();
    setReviewBusy(true);
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      const refreshed = await dispatch(fetchProduct(slug)).unwrap();
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Thanks for sharing your experience');
      return refreshed;
    } catch (submitError) { toast.error(errorMessage(submitError)); }
    finally { setReviewBusy(false); }
  }

  return (
    <main className="page-shell product-detail-page">
      <Link className="back-link" to="/products"><ArrowLeft size={15} /> Back to the collection</Link>
      <div className="product-detail-grid">
        <div className="product-gallery"><div className="product-detail-image"><img src={image} alt={product.name} /></div>{product.images?.length > 1 && <div className="gallery-thumbs">{product.images.map((item, index) => <button key={item.url} className={index === activeImage ? 'thumb-active' : ''} onClick={() => setActiveImage(index)} aria-label={`View product image ${index + 1}`}><img src={item.url} alt="" /></button>)}</div>}</div>
        <div className="product-detail-info"><p className="eyebrow">{product.category?.name || 'Northstar goods'}</p><h1>{product.name}</h1><Rating value={product.averageRating} count={product.reviewCount} />
          <div className="detail-price"><span>${product.price.toFixed(2)}</span>{product.compareAtPrice > product.price && <del>${product.compareAtPrice.toFixed(2)}</del>}</div>
          <p className="detail-description">{product.description}</p>
          <div className="stock-note">{product.stock > 0 ? <><span className="stock-dot" /> In stock · ships in 1–2 business days</> : <span className="stock-sold">Currently sold out</span>}</div>
          {product.stock > 0 && <div className="purchase-row"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15} /></button><span>{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus size={15} /></button></div><button className="button button-dark add-to-bag" onClick={addItem}>Add to bag <ArrowRight size={17} /></button></div>}
          <div className="service-points"><p><Truck size={18} /> Complimentary shipping over $100</p><p><ShieldCheck size={18} /> Secure checkout, always</p></div>
          <div className="product-description-block"><span className="footer-label">A closer look</span><p>{product.description}</p></div>
        </div>
      </div>
      <section className="reviews-section"><div className="reviews-heading"><div><p className="eyebrow">From the community</p><h2>Notes from <em>the field.</em></h2></div><Rating value={product.averageRating} count={product.reviewCount} /></div>
        <div className="reviews-layout"><div className="review-list">{reviews.length ? reviews.map((review) => <article className="review-item" key={review._id}><div className="review-item-head"><div><strong>{review.name}</strong><p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p></div><Rating value={review.rating} compact /></div><h3>{review.title}</h3><p>{review.comment}</p><span className="verified-note">Verified purchase</span></article>) : <p className="muted-copy">No reviews yet. A good place to start.</p>}</div>
          <form className="review-form" onSubmit={submitReview}><h3>Leave a note</h3>{!user && <Message type="info">Sign in to review a product you have purchased.</Message>}<label>Your rating<select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })}><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — It's alright</option><option value="2">2 — Not great</option><option value="1">1 — Disappointed</option></select></label><label>Title<input value={reviewForm.title} maxLength="100" onChange={(event) => setReviewForm({ ...reviewForm, title: event.target.value })} required minLength="2" /></label><label>Your note<textarea value={reviewForm.comment} maxLength="1000" rows="4" onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} required minLength="5" /></label><button className="button button-outline" disabled={!user || reviewBusy}>{reviewBusy ? 'Sending…' : 'Share your experience'}</button></form>
        </div>
      </section>
    </main>
  );
}
