import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';

export default function MyOrders() {
  usePageMeta({ title: 'My orders — QuantumStore', description: 'Your QuantumStore purchase history.' });
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || isAdmin) return;
    setLoading(true);
    api
      .get('/orders/mine')
      .then((res) => {
        setOrders(res.data);
        setError('');
      })
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  if (!authLoading && !user) return <Navigate to="/login" replace />;
  if (!authLoading && isAdmin) return <Navigate to="/admin/orders" replace />;

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>My orders</h1>
          <p className="muted">Purchase history for {user?.email}</p>
        </div>
        {loading && <p className="muted">Loading orders…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && !orders.length && (
          <div className="empty-state">
            <p className="muted">No orders yet.</p>
            <Link to="/shop" className="btn btn-primary">
              Shop now
            </Link>
          </div>
        )}
        <div className="order-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <div className="order-head">
                <div>
                  <h3>Order {String(order._id).slice(-8)}</h3>
                  <p className="muted">
                    {new Date(order.createdAt).toLocaleString()} · {order.status} · {order.paymentStatus}
                  </p>
                </div>
                <strong>${order.totalAmount.toFixed(2)}</strong>
              </div>
              <ul>
                {order.items.map((item, index) => (
                  <li key={`${order._id}-${index}`}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
