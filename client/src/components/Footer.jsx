import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">QuantumStore</p>
          <p className="muted">A Quantum Logics Limited store. Gear that keeps pace with you.</p>
        </div>
        <div className="footer-links">
          <Link to="/shop">Shop</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Account</Link>
          <Link to="/admin/login">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
