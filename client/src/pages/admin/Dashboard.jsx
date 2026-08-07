import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    paidOrders: 0,
    byDay: [],
    lowStock: [],
  });
  const [productCount, setProductCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/orders/stats'), api.get('/products')])
      .then(([statsRes, productsRes]) => {
        setStats(statsRes.data);
        setProductCount(productsRes.data.length);
        setError('');
      })
      .catch(() => setError('Could not load dashboard stats.'));
  }, []);

  const maxRevenue = Math.max(...stats.byDay.map((d) => d.revenue), 1);

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Quantum Logics Limited — QuantumStore overview.</p>
      {error && <p className="form-error">{error}</p>}

      <div className="stat-grid">
        <div className="stat">
          <p>Products</p>
          <strong>{productCount}</strong>
        </div>
        <div className="stat">
          <p>Orders</p>
          <strong>{stats.totalOrders}</strong>
        </div>
        <div className="stat">
          <p>Revenue</p>
          <strong>${stats.revenue.toFixed(2)}</strong>
        </div>
      </div>

      <div className="admin-panels">
        <section className="admin-form">
          <h2>Sales (last days)</h2>
          {!stats.byDay.length && <p className="muted">No sales data yet.</p>}
          <div className="chart">
            {stats.byDay.map((day) => (
              <div key={day.day} className="chart-bar-wrap" title={`${day.day}: $${day.revenue.toFixed(2)}`}>
                <div className="chart-bar" style={{ height: `${Math.max(8, (day.revenue / maxRevenue) * 120)}px` }} />
                <span>{day.day.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="muted">Paid orders: {stats.paidOrders}</p>
        </section>

        <section className="admin-form">
          <h2>Low stock alerts</h2>
          {!stats.lowStock?.length && <p className="muted">All products above threshold.</p>}
          <ul className="low-stock-list">
            {stats.lowStock?.map((product) => (
              <li key={product._id}>
                <span>{product.name}</span>
                <strong className={product.stock <= 3 ? 'danger-text' : ''}>{product.stock} left</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="admin-quick">
        <Link to="/admin/products" className="btn btn-primary">
          Manage products
        </Link>
        <Link to="/admin/orders" className="btn btn-secondary">
          View orders
        </Link>
        <Link to="/admin/categories" className="btn btn-ghost">
          Categories
        </Link>
      </div>
    </div>
  );
}
