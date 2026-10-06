import { useEffect, useState } from 'react';
import { ArrowRight, PackageCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';

const money = (amount) => `$${amount.toFixed(2)}`;
const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  useEffect(() => {
    api.get('/orders/mine').then(({ data }) => setOrders(data.orders)).catch((requestError) => setError(errorMessage(requestError))).finally(() => setLoading(false));
  }, []);

  return <main className="page-shell section-space orders-page"><div className="page-title-row"><div><p className="eyebrow">Your Northstar account</p><h1>Order history.</h1></div><Link className="text-link" to="/profile">Account details <ArrowRight size={16} /></Link></div>
    {params.get('placed') && <Message type="success">Your order is confirmed. Thanks for choosing Northstar.</Message>}
    {loading ? <Loader label="Looking for your orders" /> : error ? <Message>{error}</Message> : orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-card-head"><div><span className="footer-label">Placed {new Date(order.createdAt).toLocaleDateString()}</span><strong>Order #{order._id.slice(-8).toUpperCase()}</strong></div><span className={`status-pill status-${order.status}`}>{statusLabel(order.status)}</span></div><div className="order-card-items">{order.items.map((item) => <div className="order-line-item" key={item.product}><img src={item.image} alt="" /><span>{item.name} <small>× {item.quantity}</small></span><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="order-card-foot"><span><PackageCheck size={16} /> {order.status === 'delivered' ? 'Delivered' : `Payment ${order.paymentStatus}`}</span><strong>Total {money(order.total)}</strong></div></article>)}</div> : <div className="empty-state"><div className="empty-mark">N</div><h2>No orders to report.</h2><p>Your next good find is just around the corner.</p><Link className="button button-dark" to="/products">Browse the collection <ArrowRight size={16} /></Link></div>}
  </main>;
}
