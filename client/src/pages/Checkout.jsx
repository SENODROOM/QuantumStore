import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!items.length) {
    return (
      <section className="section container empty-state">
        <h1>Nothing to checkout</h1>
        <Link to="/shop" className="btn btn-primary">
          Shop products
        </Link>
      </section>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/orders', {
        ...form,
        items: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
      });
      clearCart();
      navigate('/shop', { replace: true });
      alert('Order placed successfully. Thank you!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="container checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h1>Checkout</h1>
          <p className="muted">Enter your details to complete the purchase.</p>

          <label>
            Full name
            <input
              className="input"
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              className="input"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              className="input"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label>
            Shipping address
            <textarea
              className="input"
              rows="3"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Placing order…' : `Pay $${totalPrice.toFixed(2)}`}
          </button>
        </form>

        <aside className="cart-summary">
          <h2>Your items</h2>
          {items.map((item) => (
            <div key={item._id} className="summary-row">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <strong>Total</strong>
            <strong>${totalPrice.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
