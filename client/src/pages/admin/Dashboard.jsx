import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/orders')])
      .then(([productsRes, ordersRes]) => {
        const orders = ordersRes.data;
        setStats({
          products: productsRes.data.length,
          orders: orders.length,
          revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">Overview of QuantumStore activity.</p>

      <div className="stat-grid">
        <div className="stat">
          <p>Products</p>
          <strong>{stats.products}</strong>
        </div>
        <div className="stat">
          <p>Orders</p>
          <strong>{stats.orders}</strong>
        </div>
        <div className="stat">
          <p>Revenue</p>
          <strong>${stats.revenue.toFixed(2)}</strong>
        </div>
      </div>

      <div className="admin-quick">
        <Link to="/admin/products" className="btn btn-primary">
          Manage products
        </Link>
        <Link to="/admin/orders" className="btn btn-secondary">
          View orders
        </Link>
      </div>
    </div>
  );
}
