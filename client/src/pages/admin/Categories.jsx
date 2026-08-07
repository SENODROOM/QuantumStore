import { useEffect, useState } from 'react';
import api from '../../api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await api.get('/categories');
    setCategories(data);
  }

  useEffect(() => {
    load().catch(() => setError('Failed to load categories'));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/categories', { name });
      setName('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add category');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete category');
    }
  }

  return (
    <div>
      <h1>Categories</h1>
      <p className="muted">Manage product categories used across the store.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          New category
          <input
            className="input"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Adding…' : 'Add category'}
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td className="table-actions">
                  <button type="button" className="text-btn danger" onClick={() => handleDelete(category._id)}>
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
