import { useEffect, useState } from 'react';
import { ArrowRight, ImagePlus, Package, Plus, ShoppingBag, Users, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/client.js';
import { fetchCategories } from '../features/productSlice.js';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';

const money = (amount) => `$${Number(amount).toFixed(2)}`;
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const emptyProduct = { name: '', slug: '', description: '', price: '', compareAtPrice: '', category: '', stock: '0', featured: false, image: '' };

export default function AdminPage() {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.products);
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadAdminData() {
    setLoading(true); setError('');
    try {
      const [dashboard, productResult, orderResult, userResult] = await Promise.all([
        api.get('/admin/dashboard'), api.get('/products', { params: { limit: 48, sort: 'newest' } }), api.get('/admin/orders'), api.get('/admin/users'),
      ]);
      setStats(dashboard.data.stats);
      setProducts(productResult.data.products);
      setOrders(orderResult.data.orders);
      setUsers(userResult.data.users);
    } catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }

  useEffect(() => { dispatch(fetchCategories()); loadAdminData(); }, [dispatch]);

  function beginCreate() {
    setEditing('new');
    setForm({ ...emptyProduct, category: categories[0]?._id || '' });
  }
  function beginEdit(product) {
    setEditing(product._id);
    setForm({ name: product.name, slug: product.slug, description: product.description, price: product.price, compareAtPrice: product.compareAtPrice || '', category: product.category?._id || product.category, stock: product.stock, featured: product.featured, image: product.images?.[0]?.url || '' });
  }
  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value, ...(field === 'name' && editing === 'new' ? { slug: slugify(value) } : {}) }));
  }
  async function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const payload = new FormData(); payload.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/uploads/image', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateForm('image', data.url); toast.success('Image uploaded');
    } catch (uploadError) { toast.error(errorMessage(uploadError)); }
    finally { setUploading(false); event.target.value = ''; }
  }
  async function saveProduct(event) {
    event.preventDefault(); setSaving(true); setError('');
    const payload = { ...form, price: Number(form.price), compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined, stock: Number(form.stock), images: [{ url: form.image, publicId: '' }] };
    try {
      if (editing === 'new') await api.post('/products', payload);
      else await api.patch(`/products/${editing}`, payload);
      setEditing(null); await loadAdminData(); toast.success('Product saved');
    } catch (saveError) { setError(errorMessage(saveError)); }
    finally { setSaving(false); }
  }
  async function deleteProduct(product) {
    if (!window.confirm(`Remove ${product.name} from the catalog?`)) return;
    try { await api.delete(`/products/${product._id}`); await loadAdminData(); toast.success('Product removed'); }
    catch (deleteError) { setError(errorMessage(deleteError)); }
  }
  async function updateOrder(orderId, status) {
    try { await api.patch(`/orders/${orderId}/status`, { status }); await loadAdminData(); toast.success('Order status updated'); }
    catch (updateError) { setError(errorMessage(updateError)); }
  }
  async function updateUser(user, changes) {
    try { await api.patch(`/admin/users/${user._id}`, changes); await loadAdminData(); toast.success('Customer updated'); }
    catch (updateError) { setError(errorMessage(updateError)); }
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  return <main className="page-shell section-space admin-page"><div className="admin-heading"><div><p className="eyebrow">Northstar Supply / Operations</p><h1>Store dashboard.</h1></div><Link className="text-link" to="/">View storefront <ArrowRight size={16} /></Link></div>
    <div className="admin-layout"><aside className="admin-sidebar"><span className="footer-label">Manage store</span>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`admin-nav-item ${tab === id ? 'admin-nav-active' : ''}`} onClick={() => setTab(id)}><Icon size={17} />{label}{id === 'orders' && orders.length > 0 && <span className="admin-nav-count">{orders.length}</span>}</button>)}</aside>
      <section className="admin-content">{error && <Message>{error}</Message>}{loading ? <Loader label="Loading store data" /> : <>
        {tab === 'overview' && <><div className="admin-section-title"><div><p className="eyebrow">At a glance</p><h2>Store overview</h2></div></div><div className="stats-grid"><article className="stat-block"><span>Gross sales</span><strong>{money(stats?.revenue || 0)}</strong><small>Paid, non-cancelled orders</small></article><article className="stat-block"><span>Orders</span><strong>{stats?.orders || 0}</strong><small>All-time order count</small></article><article className="stat-block"><span>Products</span><strong>{stats?.products || 0}</strong><small>In the catalog</small></article><article className="stat-block"><span>Customers</span><strong>{stats?.users || 0}</strong><small>Registered accounts</small></article></div><div className="admin-recent"><div className="admin-section-title"><div><p className="eyebrow">Latest activity</p><h2>Recent orders</h2></div><button className="text-link" onClick={() => setTab('orders')}>All orders <ArrowRight size={15} /></button></div><OrderTable orders={orders.slice(0, 5)} onStatus={updateOrder} /></div></>}
        {tab === 'products' && <><div className="admin-section-title"><div><p className="eyebrow">Your catalog</p><h2>Products</h2></div><button className="button button-dark admin-add-button" onClick={beginCreate}><Plus size={16} /> Add product</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Item</th><th>Price</th><th>Stock</th><th>Category</th><th>Action</th></tr></thead><tbody>{products.map((product) => <tr key={product._id}><td><div className="admin-product-cell"><img src={product.images?.[0]?.url} alt="" /><strong>{product.name}</strong></div></td><td>{money(product.price)}</td><td>{product.stock}</td><td>{product.category?.name}</td><td><button className="table-action" onClick={() => beginEdit(product)}>Edit</button><button className="table-action table-action-danger" onClick={() => deleteProduct(product)}>Remove</button></td></tr>)}</tbody></table></div></>}
        {tab === 'orders' && <><div className="admin-section-title"><div><p className="eyebrow">Fulfilment</p><h2>Orders</h2></div></div><OrderTable orders={orders} onStatus={updateOrder} /></>}
        {tab === 'customers' && <><div className="admin-section-title"><div><p className="eyebrow">People who shop here</p><h2>Customers</h2></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th>Account</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td><select aria-label={`Role for ${user.name}`} value={user.role} onChange={(event) => updateUser(user, { role: event.target.value })}><option value="customer">Customer</option><option value="admin">Admin</option></select></td><td><button className="table-action" onClick={() => updateUser(user, { disabled: !user.disabled })}>{user.disabled ? 'Restore' : 'Disable'}</button></td></tr>)}</tbody></table></div></>}
      </>}</section></div>
    {editing && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title"><div className="modal-heading"><div><p className="eyebrow">Catalog editor</p><h2 id="product-modal-title">{editing === 'new' ? 'Add a product.' : 'Edit product.'}</h2></div><button className="icon-button" aria-label="Close" onClick={() => setEditing(null)}><X /></button></div>{error && <Message>{error}</Message>}
      <form className="form-stack product-editor-form" onSubmit={saveProduct}><label>Product name<input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required minLength="2" maxLength="120" /></label><label>Product slug<input value={form.slug} onChange={(event) => updateForm('slug', slugify(event.target.value))} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label><label>Description<textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} required minLength="10" maxLength="3000" rows="4" /></label><div className="form-row"><label>Price (USD)<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateForm('price', event.target.value)} required /></label><label>Compare-at price<input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={(event) => updateForm('compareAtPrice', event.target.value)} /></label></div><div className="form-row"><label>Category<select value={form.category} onChange={(event) => updateForm('category', event.target.value)} required><option value="">Choose a category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label><label>Stock<input type="number" min="0" step="1" value={form.stock} onChange={(event) => updateForm('stock', event.target.value)} required /></label></div><label>Image URL<input type="url" value={form.image} onChange={(event) => updateForm('image', event.target.value)} required /></label><label className="upload-control"><ImagePlus size={17} />{uploading ? 'Uploading image…' : 'Upload product image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={uploadImage} disabled={uploading} /></label><label className="checkbox-label"><input type="checkbox" checked={form.featured} onChange={(event) => updateForm('featured', event.target.checked)} /> Feature on home page</label><div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setEditing(null)}>Cancel</button><button className="button button-dark" disabled={saving || uploading}>{saving ? 'Saving…' : 'Save product'} <ArrowRight size={16} /></button></div></form>
      </section></div>}
  </main>;
}

function OrderTable({ orders, onStatus }) {
  if (!orders.length) return <div className="admin-empty">No orders yet.</div>;
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td><strong>#{order._id.slice(-8).toUpperCase()}</strong><small>{order.items.length} line items</small></td><td>{order.user?.name || 'Customer'}<small>{order.user?.email || ''}</small></td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td>{money(order.total)}</td><td><select aria-label={`Order ${order._id} status`} value={order.status} onChange={(event) => onStatus(order._id, event.target.value)}><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table></div>;
}
