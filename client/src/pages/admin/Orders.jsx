import { useEffect, useState } from 'react';
import api from '../../api';

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  async function loadOrders() {
    const { data } = await api.get('/orders');
    setOrders(data);
  }

  useEffect(() => {
    loadOrders().catch(() => setError('Failed to load orders'));
  }, []);

  async function updateStatus(id, status) {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update order');
    }
  }

  return (
    <div>
      <h1>Orders</h1>
      <p className="muted">Track purchases and update fulfillment status.</p>
      {error && <p className="form-error">{error}</p>}

      <div className="order-list">
        {orders.map((order) => (
          <article key={order._id} className="order-card">
            <div className="order-head">
              <div>
                <h3>{order.customerName}</h3>
                <p className="muted">
                  {order.email} · {order.phone}
                </p>
              </div>
              <strong>${order.totalAmount.toFixed(2)}</strong>
            </div>
            <p>{order.address}</p>
            <ul>
              {order.items.map((item, index) => (
                <li key={`${order._id}-${index}`}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
            <label>
              Status
              <select
                className="input"
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </div>

      {!orders.length && !error && <p className="muted">No orders yet.</p>}
    </div>
  );
}
