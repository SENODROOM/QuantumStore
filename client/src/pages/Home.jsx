import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api
      .get('/products', { params: { featured: true } })
      .then((res) => setFeatured(res.data.slice(0, 4)))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-veil" />
        <div className="container hero-content">
          <p className="brand-hero">QuantumStore</p>
          <h1>Buy better tech. Sell nothing less.</h1>
          <p className="hero-copy">
            A clean storefront for laptops, phones, audio, and everyday gear — priced clearly, shipped fast.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">
              Shop now
            </Link>
            <a href="#featured" className="btn btn-secondary">
              Featured picks
            </a>
          </div>
        </div>
      </section>

      <section id="featured" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured right now</h2>
            <p className="muted">Hand-picked products ready to purchase today.</p>
          </div>
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {!featured.length && (
            <p className="muted">No featured products yet. Add some from the admin panel.</p>
          )}
        </div>
      </section>

      <section className="section section-split">
        <div className="container split">
          <div>
            <h2>Sell with confidence</h2>
            <p className="muted">
              Admins manage inventory, pricing, and orders from one panel. Customers browse, cart, and checkout in
              minutes.
            </p>
            <Link to="/admin/login" className="btn btn-primary">
              Open admin panel
            </Link>
          </div>
          <div className="split-visual" aria-hidden="true" />
        </div>
      </section>
    </div>
  );
}
