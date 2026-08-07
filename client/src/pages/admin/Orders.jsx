import { useEffect, useState } from 'react';
import api from '../../api';

const statuses = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadOrders(nextStatus = status) {
    setLoading(true);
    const { data } = await api.get('/orders', { params: { status: nextStatus } });
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders().catch(() => {
      setError('Failed to load orders');
      setLoading(false);
    });
  }, []);

  async function updateStatus(id, nextStatus) {
    try {
      await api.patch(`/orders/${id}/status`, { status: nextStatus });
      await loadOrders();
      if (selected?._id === id) {
        const refreshed = await api.get(`/orders/${id}`);
        setSelected(refreshed.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update order');
    }
  }

  async function filterBy(nextStatus) {
    setStatus(nextStatus);
    try {
      await loadOrders(nextStatus);
      setError('');
    } catch {
      setError('Failed to filter orders');
    }
  }

  return (
    <div>
      <h1>Orders</h1>
      <p className="muted">Track purchases and update fulfillment status.</p>
      {error && <p className="form-error">{error}</p>}

      <div className="category-row" style={{ marginBottom: '1rem' }}>
        {statuses.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip ${status === item ? 'active' : ''}`}
            onClick={() => filterBy(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Loading orders…</p>}

      <div className="orders-split">
        <div className="order-list">
          {orders.map((order) => (
            <article key={order._id} className={`order-card ${selected?._id === order._id ? 'selected' : ''}`}>
              <button type="button" className="order-select" onClick={() => setSelected(order)}>
                <div className="order-head">
                  <div>
                    <h3>{order.customerName}</h3>
                    <p className="muted">
                      {order.email} · {order.status} · {order.paymentStatus}
                    </p>
                  </div>
                  <strong>${order.totalAmount.toFixed(2)}</strong>
                </div>
              </button>
              <label>
                Status
                <select
                  className="input"
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                >
                  {statuses
                    .filter((s) => s !== 'all')
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </label>
            </article>
          ))}
        </div>

        <aside className="order-card order-detail">
          {!selected && <p className="muted">Select an order to view details.</p>}
          {selected && (
            <>
              <h2>Order detail</h2>
              <p>
                <strong>{selected.customerName}</strong>
              </p>
              <p className="muted">
                {selected.email} · {selected.phone}
              </p>
              <p>{selected.address}</p>
              <p className="muted">
                Payment: {selected.paymentMethod} / {selected.paymentStatus}
              </p>
              <ul>
                {selected.items.map((item, index) => (
                  <li key={`${selected._id}-${index}`}>
                    {item.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className="price">Total ${selected.totalAmount.toFixed(2)}</p>
            </>
          )}
        </aside>
      </div>

      {!loading && !orders.length && !error && <p className="muted">No orders yet.</p>}
    </div>
  );
}
