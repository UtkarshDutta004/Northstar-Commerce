import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/client.js';
import { clearCart } from '../features/cartSlice.js';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
const money = (amount) => `$${amount.toFixed(2)}`;

function PaymentForm({ amount, items, address, addressValid }) {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!addressValid) {
      setError('Complete your shipping address before paying.');
      return;
    }
    if (!stripe || !elements || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/orders` }, redirect: 'if_required' });
      if (result.error) throw new Error(result.error.message);
      if (result.paymentIntent?.status !== 'succeeded') throw new Error('Payment is not complete yet.');
      const response = await api.post('/orders', {
        paymentIntentId: result.paymentIntent.id,
        shippingAddress: address,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      dispatch(clearCart());
      toast.success('Your order is on its way to becoming real.');
      navigate(`/orders?placed=${response.data.order._id}`, { replace: true });
    } catch (submitError) {
      setError(errorMessage(submitError));
      setBusy(false);
    }
  }

  return <form className="payment-form" onSubmit={submit}><PaymentElement options={{ layout: 'tabs' }} />{error && <Message>{error}</Message>}<button className="button button-dark checkout-link" disabled={!stripe || busy || !addressValid}>{busy ? 'Confirming payment…' : `Pay ${money(amount)}`} <LockKeyhole size={16} /></button><p className="checkout-note">Payments are securely processed by Stripe in test mode.</p></form>;
}

export default function CheckoutPage() {
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [address, setAddress] = useState({ line1: user?.address?.line1 || '', city: user?.address?.city || '', postalCode: user?.address?.postalCode || '', country: user?.address?.country || '' });
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const cartKey = items.map((item) => `${item.productId}:${item.quantity}`).sort().join('|');

  useEffect(() => {
    let active = true;
    if (!items.length) { setLoading(false); return undefined; }
    api.post('/payments/intent', { items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })) })
      .then(({ data }) => { if (active) { setClientSecret(data.clientSecret); setAmount(data.amount / 100); } })
      .catch((intentError) => { if (active) setError(errorMessage(intentError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [cartKey]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = amount ? amount - subtotal : (subtotal >= 100 ? 0 : 8);

  if (!items.length) return <main className="page-shell section-space empty-state"><h1>Your bag is waiting.</h1><p>Add something useful before checking out.</p><Link className="button button-dark" to="/products">Shop the collection <ArrowRight size={16} /></Link></main>;
  return (
    <main className="page-shell section-space checkout-page"><Link className="back-link" to="/cart"><ArrowLeft size={15} /> Back to your bag</Link><div className="checkout-heading"><p className="eyebrow">Almost there</p><h1>Make it <em>yours.</em></h1></div>
      {error && <Message>{error}</Message>}
      <div className="checkout-layout"><section className="checkout-address form-stack"><div className="checkout-section-heading"><span>01</span><div><h2>Where should it go?</h2><p>Shipping address</p></div></div>
        <label>Street address<input autoComplete="street-address" value={address.line1} onChange={(event) => setAddress({ ...address, line1: event.target.value })} required minLength="3" maxLength="120" /></label>
        <div className="form-row"><label>City<input autoComplete="address-level2" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required maxLength="80" /></label><label>Postal code<input autoComplete="postal-code" value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} required maxLength="20" /></label></div>
        <label>Country<input autoComplete="country-name" value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value })} required maxLength="80" /></label>
        <div className="checkout-section-heading payment-heading"><span>02</span><div><h2>How would you like to pay?</h2><p>All transactions are encrypted and secure.</p></div></div>
        {!publishableKey ? <Message>Set VITE_STRIPE_PUBLISHABLE_KEY to enable test payments.</Message> : loading ? <Loader label="Preparing secure checkout" /> : clientSecret && !error ? <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#244a3d', borderRadius: '2px', fontFamily: 'DM Sans, sans-serif' } } }}><PaymentForm amount={amount} items={items} address={address} addressValid={Boolean(address.line1.trim() && address.city.trim() && address.postalCode.trim() && address.country.trim())} /></Elements> : null}
      </section>
      <aside className="order-summary checkout-summary"><p className="eyebrow">In your bag</p>{items.map((item) => <div className="checkout-item" key={item.productId}><img src={item.image} alt="" /><div><strong>{item.name}</strong><span>Qty {item.quantity}</span></div><span>{money(item.price * item.quantity)}</span></div>)}<div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'Complimentary'}</span></div><div className="summary-total"><span>Total</span><strong>{money(amount || subtotal + shipping)}</strong></div><p className="checkout-note">You'll receive a confirmation after your payment is verified.</p></aside></div>
    </main>
  );
}
