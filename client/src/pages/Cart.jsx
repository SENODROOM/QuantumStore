import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (!items.length) {
    return (
      <section className="section container empty-state">
        <h1>Your cart is empty</h1>
        <p className="muted">Browse the shop and add something you like.</p>
        <Link to="/shop" className="btn btn-primary">
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container cart-layout">
        <div>
          <h1>Cart</h1>
          <div className="cart-list">
            {items.map((item) => (
              <article key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p className="price">${item.price.toFixed(2)}</p>
                  <div className="cart-item-actions">
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      className="input qty-input"
                      onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                    />
                    <button type="button" className="text-btn" onClick={() => removeFromCart(item._id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <p className="price">${(item.price * item.quantity).toFixed(2)}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${totalPrice.toFixed(2)}</strong>
          </div>
          <p className="muted">Shipping calculated at checkout.</p>
          <Link to="/checkout" className="btn btn-primary btn-block">
            Checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
