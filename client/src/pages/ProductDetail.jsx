import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found'));
  }, [id]);

  if (error) {
    return (
      <section className="section container">
        <p>{error}</p>
        <Link to="/shop" className="btn btn-primary">
          Back to shop
        </Link>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="section container">
        <p className="muted">Loading…</p>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container detail">
        <div className="detail-media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="detail-body">
          <p className="product-meta">
            {product.brand} · {product.category}
          </p>
          <h1>{product.name}</h1>
          <p className="price price-lg">${product.price.toFixed(2)}</p>
          <p className="muted">{product.description}</p>
          <p className="stock-line">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

          <div className="detail-actions">
            <label>
              Qty
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                className="input qty-input"
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <button
              type="button"
              className="btn btn-primary"
              disabled={product.stock < 1}
              onClick={() => addToCart(product, quantity)}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
