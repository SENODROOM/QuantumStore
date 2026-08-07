import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api';
import { usePageMeta } from '../hooks/usePageMeta';

export default function OrderSuccess() {
  usePageMeta({
    title: 'Order confirmed — QuantumStore',
    description: 'Your QuantumStore order was placed successfully.',
  });

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState(location.state?.order || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (location.state?.order && !sessionId) {
        if (!cancelled) {
          setOrder(location.state.order);
          setLoading(false);
        }
        return;
      }

      if (!orderId) {
        if (!cancelled) {
          setError('Missing order reference.');
          setLoading(false);
        }
        return;
      }

      try {
        if (sessionId) {
          const { data } = await api.post('/payments/confirm-session', { sessionId, orderId });
          if (!cancelled) setOrder(data);
        } else {
          try {
            const { data } = await api.get(`/orders/${orderId}`);
            if (!cancelled) setOrder(data);
          } catch {
            if (!cancelled) setOrder({ _id: orderId, totalAmount: null });
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not confirm order.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, sessionId, location.state]);

  return (
    <section className="section container empty-state">
      {loading && <p className="muted">Confirming your order…</p>}
      {!loading && error && (
        <>
          <h1>Something went wrong</h1>
          <p className="form-error">{error}</p>
          <Link to="/shop" className="btn btn-primary">
            Back to shop
          </Link>
        </>
      )}
      {!loading && !error && (
        <>
          <h1>Order confirmed</h1>
          <p className="muted">
            Thank you for shopping at QuantumStore by Quantum Logics Limited.
            {order?._id ? ` Reference: ${String(order._id).slice(-8)}` : ''}
          </p>
          {typeof order?.totalAmount === 'number' && (
            <p className="price price-lg">${order.totalAmount.toFixed(2)}</p>
          )}
          <div className="admin-quick" style={{ justifyContent: 'center' }}>
            <Link to="/shop" className="btn btn-primary">
              Continue shopping
            </Link>
            <Link to="/account/orders" className="btn btn-secondary">
              View my orders
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
