import { useEffect, useState } from 'react';
import api from '../../api';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Laptops',
  stock: '',
  image: '',
  brand: 'Quantum',
  featured: false,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Laptops']);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadProducts() {
    const { data } = await api.get('/products');
    setProducts(data);
  }

  async function loadCategories() {
    const { data } = await api.get('/products/categories');
    setCategories(data);
    setForm((prev) => ({ ...prev, category: prev.category || data[0] || 'Laptops' }));
  }

  useEffect(() => {
    Promise.all([loadProducts(), loadCategories()]).catch(() => setError('Failed to load products'));
  }, []);

  function startEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      image: product.image,
      brand: product.brand || 'Quantum',
      featured: Boolean(product.featured),
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0] || 'Laptops' });
    setError('');
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('image', file);
      const { data } = await api.post('/uploads', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!form.image) {
      setError('Image URL or upload is required');
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete product');
    }
  }

  return (
    <div>
      <h1>Products</h1>
      <p className="muted">Add, edit, or remove catalog items.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
        <div className="form-grid">
          <label>
            Name
            <input
              className="input"
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Brand
            <input
              className="input"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </label>
          <label>
            Price
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <label>
            Stock
            <input
              className="input"
              type="number"
              min="0"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </label>
          <label>
            Category
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            Image URL
            <input
              className="input"
              required
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
          </label>
          <label>
            Upload image
            <input className="input" type="file" accept="image/*" onChange={handleUpload} />
          </label>
        </div>

        {form.image && (
          <div className="image-preview">
            <img src={form.image} alt="Product preview" />
            <p className="muted">{uploading ? 'Uploading…' : 'Image preview'}</p>
          </div>
        )}

        <label>
          Description
          <textarea
            className="input"
            rows="3"
            required
            minLength={10}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Featured on homepage
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="admin-quick">
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {saving ? 'Saving…' : editingId ? 'Update product' : 'Add product'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <div className="table-product">
                    <img src={product.image} alt="" />
                    <div>
                      <strong>{product.name}</strong>
                      <p className="muted">{product.featured ? 'Featured' : 'Standard'}</p>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td className={product.stock <= 10 ? 'danger-text' : ''}>{product.stock}</td>
                <td className="table-actions">
                  <button type="button" className="text-btn" onClick={() => startEdit(product)}>
                    Edit
                  </button>
                  <button type="button" className="text-btn danger" onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
