import { useState } from 'react';
import { ArrowRight, LogOut, Package, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { saveProfile, signOut } from '../features/authSlice.js';
import { errorMessage } from '../api/client.js';
import Message from '../components/Message.jsx';

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', line1: user?.address?.line1 || '', city: user?.address?.city || '', postalCode: user?.address?.postalCode || '', country: user?.address?.country || '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      await dispatch(saveProfile({ name: form.name, address: { line1: form.line1, city: form.city, postalCode: form.postalCode, country: form.country } })).unwrap();
      toast.success('Your details are up to date');
    } catch (saveError) { setError(errorMessage(saveError)); }
    finally { setBusy(false); }
  }

  function logout() { localStorage.removeItem('northstar-token'); dispatch(signOut()); navigate('/'); toast.success('Signed out'); }

  return <main className="page-shell section-space profile-page"><div className="page-title-row"><div><p className="eyebrow">Your Northstar account</p><h1>Good to see you, {user?.name?.split(' ')[0]}.</h1></div><button className="button button-outline signout-button" onClick={logout}><LogOut size={16} /> Sign out</button></div>
    <div className="profile-layout"><aside className="account-nav"><div className="account-avatar"><UserRound size={24} /></div><strong>{user?.name}</strong><span>{user?.email}</span><Link to="/orders"><Package size={17} /> Your orders <ArrowRight size={16} /></Link>{user?.role === 'admin' && <Link to="/admin">Admin dashboard <ArrowRight size={16} /></Link>}</aside>
      <section className="profile-panel"><div className="checkout-section-heading"><span>01</span><div><h2>Your details</h2><p>Keep the essentials current.</p></div></div>{error && <Message>{error}</Message>}
        <form className="form-stack" onSubmit={save}><label>Name<input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength="2" maxLength="80" /></label><label>Email address<input value={user?.email || ''} readOnly /></label><div className="profile-divider" /><div className="checkout-section-heading"><span>02</span><div><h2>Default shipping address</h2><p>Used to speed up your next checkout.</p></div></div><label>Street address<input autoComplete="street-address" value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} maxLength="120" /></label><div className="form-row"><label>City<input autoComplete="address-level2" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} maxLength="80" /></label><label>Postal code<input autoComplete="postal-code" value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} maxLength="20" /></label></div><label>Country<input autoComplete="country-name" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} maxLength="80" /></label><button className="button button-dark" disabled={busy}>{busy ? 'Saving…' : 'Save your details'} <ArrowRight size={16} /></button></form>
      </section></div>
  </main>;
}
