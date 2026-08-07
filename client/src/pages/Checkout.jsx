import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Checkout() {
  usePageMeta({
    title: 'Checkout — QuantumStore',
    description: 'Complete your QuantumStore purchase.',
  });

  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState(searchParams.get('canceled') ? 'Stripe checkout was canceled.' : '');
  const [submitting, setSubmitting] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [payWithStripe, setPayWithStripe] = useState(false);

  useEffect(() => {
    api
      .get('/payments/config')
      .then((res) => setStripeEnabled(Boolean(res.data.stripeEnabled)))
      .catch(() => setStripeEnabled(false));
  }, []);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

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
      const { data: order } = await api.post('/orders', {
        ...form,
        paymentMethod: payWithStripe ? 'stripe' : 'manual',
        items: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
      });

      if (payWithStripe && stripeEnabled) {
        const { data } = await api.post('/payments/create-checkout-session', { orderId: order._id });
        clearCart();
        window.location.href = data.url;
        return;
      }

      clearCart();
      navigate(`/order-success?orderId=${order._id}`, { replace: true, state: { order } });
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
          <p className="muted">Enter your details to complete the purchase. Guest checkout is supported.</p>

          <label>
            Full name
            <input
              className="input"
              required
              minLength={2}
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
              minLength={7}
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
              minLength={8}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>

          {stripeEnabled && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={payWithStripe}
                onChange={(e) => setPayWithStripe(e.target.checked)}
              />
              Pay with Stripe
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting
              ? 'Processing…'
              : payWithStripe
                ? `Continue to Stripe — $${totalPrice.toFixed(2)}`
                : `Place order — $${totalPrice.toFixed(2)}`}
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
