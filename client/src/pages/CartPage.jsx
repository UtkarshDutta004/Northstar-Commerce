import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, setQuantity } from '../features/cartSlice.js';

const money = (amount) => `$${amount.toFixed(2)}`;

export default function CartPage() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 8;

  return (
    <main className="page-shell section-space cart-page">
      <div className="page-title-row"><div><p className="eyebrow">Your shortlist</p><h1>The bag.</h1></div><Link className="text-link" to="/products">Keep exploring <ArrowRight size={16} /></Link></div>
      {!items.length ? <div className="empty-state cart-empty"><div className="empty-mark">N</div><h2>Nothing in the bag. Yet.</h2><p>Good things are waiting to come along.</p><Link className="button button-dark" to="/products">Browse the collection <ArrowRight size={17} /></Link></div> : <div className="cart-layout">
        <div className="cart-items">{items.map((item) => <article className="cart-item" key={item.productId}><Link to={`/products/${item.slug}`} className="cart-item-image"><img src={item.image} alt={item.name} /></Link><div className="cart-item-info"><Link to={`/products/${item.slug}`}><h2>{item.name}</h2></Link><p>{money(item.price)} each</p><div className="quantity-control"><button aria-label={`Decrease ${item.name} quantity`} onClick={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}><Minus size={14} /></button><span>{item.quantity}</span><button aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= item.stock} onClick={() => dispatch(setQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}><Plus size={14} /></button></div></div><div className="cart-item-total"><strong>{money(item.price * item.quantity)}</strong><button className="icon-button remove-item" aria-label={`Remove ${item.name}`} onClick={() => dispatch(removeFromCart(item.productId))}><Trash2 size={17} /></button></div></article>)}</div>
        <aside className="order-summary"><p className="eyebrow">A quick tally</p><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'Complimentary'}</span></div><p className="shipping-hint">{shipping ? `You're ${money(100 - subtotal)} away from complimentary shipping.` : 'Complimentary shipping unlocked.'}</p><div className="summary-total"><span>Estimated total</span><strong>{money(subtotal + shipping)}</strong></div><Link className="button button-dark checkout-link" to="/checkout">Continue to checkout <ArrowRight size={17} /></Link><p className="checkout-note">Taxes calculated at checkout. Secure payment by Stripe.</p></aside>
      </div>}
    </main>
  );
}
