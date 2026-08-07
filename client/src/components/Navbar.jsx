import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          QuantumStore
        </Link>
        <nav className="nav-links">
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/cart" className="cart-link">
            Cart
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </NavLink>
          {user && !isAdmin && <NavLink to="/account/orders">My orders</NavLink>}
          {user ? (
            <button type="button" className="text-btn nav-text-btn" onClick={logout}>
              Log out
            </button>
          ) : (
            <NavLink to="/login">Account</NavLink>
          )}
          <NavLink to="/admin" className="nav-admin">
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
