import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();

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
          <NavLink to="/admin" className="nav-admin">
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
