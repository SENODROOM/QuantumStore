import { useEffect, useState } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Shop() {
  usePageMeta({
    title: 'Shop — QuantumStore',
    description: 'Browse the full QuantumStore catalog from Quantum Logics Limited.',
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/products/categories')
      .then((res) => setCategories(['All', ...res.data]))
      .catch(() => setCategories(['All', 'Laptops', 'Phones', 'Audio', 'Accessories', 'Wearables', 'Gaming']));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { category, search } })
      .then((res) => {
        setProducts(res.data);
        setError('');
      })
      .catch(() => {
        setProducts([]);
        setError('Could not load products. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>Shop</h1>
          <p className="muted">Browse the full QuantumStore catalog.</p>
        </div>

        <div className="shop-controls">
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
          <div className="category-row">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${category === item ? 'active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="muted">Loading products…</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && !products.length && <p className="muted">No products match your filters.</p>}
      </div>
    </section>
  );
}
