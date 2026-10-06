import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, signIn, signUp } from '../features/authSlice.js';
import Message from '../components/Message.jsx';

export default function AuthPage() {
  const [registering, setRegistering] = useState(location.pathname === '/register');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((state) => state.auth);
  const destination = location.state?.from?.pathname || '/';

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch, registering]);
  if (user) return <Navigate to={destination} replace />;

  async function submit(event) {
    event.preventDefault();
    const result = await dispatch(registering ? signUp(form) : signIn({ email: form.email, password: form.password }));
    if (result.meta.requestStatus === 'fulfilled') navigate(destination, { replace: true });
  }

  return (
    <main className="auth-page">
      <div className="auth-image-panel"><div className="auth-image-content"><p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Northstar Supply</p><p className="auth-quote">“The everyday deserves a little thought.”</p><span>Useful things for wherever you're headed.</span></div></div>
      <section className="auth-form-panel"><Link className="back-link" to="/"><ArrowLeft size={15} /> Back to the shop</Link><div className="auth-form-wrap"><p className="eyebrow">{registering ? 'A good place to begin' : 'Welcome back'}</p><h1>{registering ? 'Make it yours.' : 'Come on in.'}</h1><p className="muted-copy">{registering ? 'Create an account to keep track of your good finds.' : 'Sign in to see your orders and keep exploring.'}</p>
          {error && <Message>{error}</Message>}
          <form className="form-stack" onSubmit={submit}>
            {registering && <label>Your name<input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength="2" maxLength="80" /></label>}
            <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
            <label>Password<span className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength="8" maxLength="72" /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            <button className="button button-dark auth-submit" disabled={loading}>{loading ? 'One moment…' : registering ? 'Create your account' : 'Sign in'} <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">{registering ? 'Already have an account?' : 'New around here?'} <button onClick={() => setRegistering(!registering)}>{registering ? 'Sign in' : 'Create an account'}</button></p>
        </div></section>
    </main>
  );
}
