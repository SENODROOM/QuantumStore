import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-media">
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-body">
        <p className="product-meta">{product.category}</p>
        <h3>
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        <div className="product-row">
          <p className="price">${product.price.toFixed(2)}</p>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={product.stock < 1}
            onClick={() => addToCart(product)}
          >
            {product.stock < 1 ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}
