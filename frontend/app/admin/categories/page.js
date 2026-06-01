'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  iconUrl: '',
  sortOrder: '0',
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.adminGetCategories();
      setCategories(res?.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function openCreateForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(cat) {
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      iconUrl: cat.iconUrl || '',
      sortOrder: String(cat.sortOrder || 0),
      isActive: cat.isActive !== false,
    });
    setEditingId(cat.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function handleChange(field) {
    return (e) => {
      const value = field === 'isActive' ? e.target.checked : e.target.value;
      const updates = { [field]: value };
      // Auto-generate slug from name
      if (field === 'name' && !editingId) {
        updates.slug = generateSlug(value);
      }
      setForm((prev) => ({ ...prev, ...updates }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name),
        description: form.description.trim() || null,
        iconUrl: form.iconUrl.trim() || null,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      if (editingId) {
        await api.adminUpdateCategory(editingId, body);
        showToast('Category updated successfully!');
      } else {
        await api.adminCreateCategory(body);
        showToast('Category created successfully!');
      }

      closeForm();
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save category.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.adminDeleteCategory(id);
      showToast('Category deleted successfully!');
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete category.', 'error');
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading categories...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Categories</h2>
          <p className={styles.pageSubtitle}>{categories.length} total categories</p>
        </div>
        <button className={styles.createBtn} onClick={openCreateForm}>
          ➕ Add Category
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Category</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Courses</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className={styles.orderCell}>{cat.sortOrder}</td>
                <td>
                  <div className={styles.categoryCell}>
                    {cat.iconUrl && (
                      <span className={styles.categoryIcon}>{cat.iconUrl.startsWith('/') ? '🏷️' : cat.iconUrl}</span>
                    )}
                    <span className={styles.categoryName}>{cat.name}</span>
                  </div>
                </td>
                <td>
                  <span className={styles.slugBadge}>{cat.slug}</span>
                </td>
                <td className={styles.descCell}>
                  {cat.description ? (
                    <span className={styles.descText}>{cat.description.length > 60 ? cat.description.slice(0, 60) + '…' : cat.description}</span>
                  ) : (
                    <span className={styles.noDesc}>—</span>
                  )}
                </td>
                <td>
                  <span className={styles.countBadge}>
                    {cat._count?.courses ?? 0}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${cat.isActive ? styles.statusActive : styles.statusInactive}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => openEditForm(cat)} title="Edit">
                      ✏️
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(cat.id)} title="Delete">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className={styles.emptyState}>No categories found. Create your first category!</div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>⚠️ Delete Category?</h3>
            <p className={styles.modalText}>
              This will permanently delete this category. Categories with existing courses cannot be deleted — reassign or delete those courses first.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(deleteConfirm)}>Delete Category</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={closeForm}>
          <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>{editingId ? '✏️ Edit Category' : '➕ Create Category'}</h3>
              <button className={styles.closeBtn} onClick={closeForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name *</label>
                  <input
                    className={styles.formInput}
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder="e.g. UI/UX Design"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Slug</label>
                  <input
                    className={styles.formInput}
                    value={form.slug}
                    onChange={handleChange('slug')}
                    placeholder="Auto-generated from name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Icon URL</label>
                  <input
                    className={styles.formInput}
                    value={form.iconUrl}
                    onChange={handleChange('iconUrl')}
                    placeholder="/icons/design.svg or emoji"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sort Order</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    min="0"
                    value={form.sortOrder}
                    onChange={handleChange('sortOrder')}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={`${styles.formInput} ${styles.textArea}`}
                  value={form.description}
                  onChange={handleChange('description')}
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>

              <div className={styles.formGroupCheck}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form.isActive} onChange={handleChange('isActive')} />
                  Active (visible on the website)
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeForm}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
