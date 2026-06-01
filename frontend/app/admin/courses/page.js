'use client';

import { useState, useEffect } from 'react';
import { api, getGeneralUser, getFullUrl } from '@/lib/api';
import styles from './page.module.css';


const DIFFICULTY_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const emptyForm = {
  categoryId: '',
  title: '',
  description: '',
  shortDescription: '',
  price: '',
  discountPrice: '',
  difficultyLevel: 'BEGINNER',
  durationHours: '',
  instructorName: '',
  instructorBio: '',
  instructorAvatar: '',
  thumbnailUrl: '',
  previewVideoUrl: '',
  isPublished: true,
  features: '',
  syllabus: '',
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleFileUpload(field, setUploading) {
    return async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.adminUploadFile(formData);
        if (res?.success && res.url) {
          setForm((prev) => ({ ...prev, [field]: res.url }));
          showToast('Image uploaded successfully!');
        } else {
          showToast('Failed to upload image.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Error uploading file.', 'error');
      } finally {
        setUploading(false);
      }
    };
  }

  useEffect(() => {
    setCurrentUser(getGeneralUser());
    loadData();
  }, []);


  async function loadData() {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        api.adminGetCourses(),
        api.getCategories(),
      ]);
      
      const user = getGeneralUser();
      let coursesData = coursesRes?.data || [];
      if (user && user.role === 'INSTRUCTOR') {
        const instructorName = `${user.firstName} ${user.lastName}`.toLowerCase();
        coursesData = coursesData.filter(c => c.instructorName?.toLowerCase() === instructorName);
      }
      
      setCourses(coursesData);
      setCategories(categoriesRes?.data || []);
    } catch (err) {

      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function openCreateForm() {
    const user = getGeneralUser();
    setForm({ 
      ...emptyForm, 
      categoryId: categories[0]?.id || '',
      instructorName: user && user.role === 'INSTRUCTOR' ? `${user.firstName} ${user.lastName}` : '' 
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(course) {
    let featuresText = '';
    if (course.features) {
      try {
        const feats = typeof course.features === 'string' ? JSON.parse(course.features) : course.features;
        if (Array.isArray(feats)) {
          featuresText = feats.join('\n');
        }
      } catch (e) {
        console.error('Failed to parse features:', e);
      }
    }

    let syllabusText = '';
    if (course.syllabus) {
      try {
        const syl = typeof course.syllabus === 'string' ? JSON.parse(course.syllabus) : course.syllabus;
        if (Array.isArray(syl)) {
          syllabusText = syl.map((module) => {
            const header = `Module ${module.week || ''}: ${module.title || ''}`.trim();
            const topicsText = (module.topics || []).map(t => `- ${t}`).join('\n');
            return `${header}\n${topicsText}`;
          }).join('\n\n');
        }
      } catch (e) {
        console.error('Failed to parse syllabus:', e);
      }
    }

    setForm({
      categoryId: course.categoryId,
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription || '',
      price: String(course.price),
      discountPrice: course.discountPrice ? String(course.discountPrice) : '',
      difficultyLevel: course.difficultyLevel || 'BEGINNER',
      durationHours: String(course.durationHours || ''),
      instructorName: course.instructorName,
      instructorBio: course.instructorBio || '',
      instructorAvatar: course.instructorAvatar || '',
      thumbnailUrl: course.thumbnailUrl || '',
      previewVideoUrl: course.previewVideoUrl || '',
      isPublished: course.isPublished !== false,
      features: featuresText,
      syllabus: syllabusText,
    });
    setEditingId(course.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.price || !form.instructorName.trim() || !form.categoryId) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const featuresArray = form.features
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const lines = form.syllabus.split('\n');
      const syllabusArray = [];
      let currentModule = null;

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        if (line.startsWith('-') || line.startsWith('*')) {
          if (currentModule) {
            const topic = line.substring(1).trim();
            if (topic) {
              currentModule.topics.push(topic);
            }
          }
        } else {
          let title = line;
          let week = syllabusArray.length + 1;
          const weekMatch = line.match(/^(?:Module|Week)\s*(\d+)[:.-]?\s*(.*)$/i);
          if (weekMatch) {
            week = parseInt(weekMatch[1]);
            title = weekMatch[2].trim();
          }
          currentModule = { week, title, topics: [] };
          syllabusArray.push(currentModule);
        }
      }

      const body = {
        categoryId: form.categoryId,
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        difficultyLevel: form.difficultyLevel,
        durationHours: form.durationHours ? parseInt(form.durationHours) : 0,
        instructorName: form.instructorName,
        instructorBio: form.instructorBio,
        instructorAvatar: form.instructorAvatar || null,
        thumbnailUrl: form.thumbnailUrl || null,
        previewVideoUrl: form.previewVideoUrl || null,
        isPublished: form.isPublished,
        features: featuresArray,
        syllabus: syllabusArray,
      };

      if (editingId) {
        await api.adminUpdateCourse(editingId, body);
        showToast('Course updated successfully!');
      } else {
        await api.adminCreateCourse(body);
        showToast('Course created successfully!');
      }

      closeForm();
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save course.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.adminDeleteCourse(id);
      showToast('Course deleted successfully!');
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete course.', 'error');
    }
  }

  async function handleApprove(id) {
    try {
      await api.adminUpdateCourse(id, { status: 'APPROVED' });
      showToast('Course approved successfully!');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to approve course.', 'error');
    }
  }

  async function handleReject(id) {
    try {
      await api.adminUpdateCourse(id, { status: 'REJECTED' });
      showToast('Course rejected!');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to reject course.', 'error');
    }
  }

  function handleChange(field) {
    return (e) => {
      const value = field === 'isPublished' ? e.target.checked : e.target.value;
      setForm({ ...form, [field]: value });
    };
  }

  const filteredCourses = filterCategory
    ? courses.filter((c) => c.categoryId === filterCategory)
    : courses;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading courses...</div>
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
          <h2 className={styles.pageTitle}>Courses</h2>
          <p className={styles.pageSubtitle}>{courses.length} total courses</p>
        </div>
        <button className={styles.createBtn} onClick={openCreateForm}>
          ➕ Add Course
        </button>
      </div>

      {/* Filter */}
      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Course List */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
              <th>Price</th>
              <th>Level</th>
              <th>Enrollments</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => {
              const cat = categories.find((c) => c.id === course.categoryId);
              return (
                <tr key={course.id}>
                  <td>
                    <div className={styles.courseCell}>
                      <div className={styles.courseTitle}>{course.title}</div>
                      <div className={styles.courseMeta}>by {course.instructorName}</div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.catBadge}>{cat?.name || '—'}</span>
                  </td>
                  <td>
                    <div className={styles.priceCell}>
                      {course.discountPrice ? (
                        <>
                          <span className={styles.originalPrice}>₹{course.price}</span>
                          <span className={styles.discountPrice}>₹{course.discountPrice}</span>
                        </>
                      ) : (
                        <span>₹{course.price}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.levelBadge} ${styles[`level_${course.difficultyLevel?.toLowerCase()}`]}`}>
                      {course.difficultyLevel}
                    </span>
                  </td>
                  <td className={styles.enrollCount}>{course.enrollmentCount || 0}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className={`${styles.statusBadge} ${course.isPublished ? styles.statusPublished : styles.statusDraft}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <span className={`${styles.statusBadge} ${
                        course.status === 'APPROVED' ? styles.statusApproved : 
                        course.status === 'PENDING' ? styles.statusPending : 
                        styles.statusRejected
                      }`}>
                        {course.status === 'APPROVED' ? 'Approved' : 
                         course.status === 'PENDING' ? 'Pending' : 'Rejected'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => openEditForm(course)} title="Edit">
                        ✏️
                      </button>
                      <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(course.id)} title="Delete">
                        🗑️
                      </button>
                      {currentUser?.role === 'ADMIN' && (
                        <>
                          {course.status !== 'APPROVED' && (
                            <button className={styles.approveBtn} onClick={() => handleApprove(course.id)} title="Approve Course">
                              ✔️
                            </button>
                          )}
                          {course.status !== 'REJECTED' && (
                            <button className={styles.rejectBtn} onClick={() => handleReject(course.id)} title="Reject Course">
                              ❌
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredCourses.length === 0 && (
          <div className={styles.emptyState}>No courses found.</div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>⚠️ Delete Course?</h3>
            <p className={styles.modalText}>
              This will permanently delete this course and all associated enrollments, live classes, and recordings. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(deleteConfirm)}>Delete Course</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={closeForm}>
          <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>{editingId ? '✏️ Edit Course' : '➕ Create Course'}</h3>
              <button className={styles.closeBtn} onClick={closeForm}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title *</label>
                  <input className={styles.formInput} value={form.title} onChange={handleChange('title')} placeholder="Course title" required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category *</label>
                  <select className={styles.formInput} value={form.categoryId} onChange={handleChange('categoryId')} required>
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Instructor Name *</label>
                  <input 
                    className={styles.formInput} 
                    value={form.instructorName} 
                    onChange={handleChange('instructorName')} 
                    placeholder="Instructor name" 
                    required 
                    disabled={currentUser && currentUser.role === 'INSTRUCTOR'} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Difficulty Level</label>
                  <select className={styles.formInput} value={form.difficultyLevel} onChange={handleChange('difficultyLevel')}>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price (₹) *</label>
                  <input className={styles.formInput} type="number" min="0" step="1" value={form.price} onChange={handleChange('price')} placeholder="1999" required />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Discount Price (₹)</label>
                  <input className={styles.formInput} type="number" min="0" step="1" value={form.discountPrice} onChange={handleChange('discountPrice')} placeholder="999" />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duration (hours)</label>
                  <input className={styles.formInput} type="number" min="0" value={form.durationHours} onChange={handleChange('durationHours')} placeholder="40" />
                </div>

                <div className={styles.formGroupCheck}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={form.isPublished} onChange={handleChange('isPublished')} />
                    Published
                  </label>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thumbnail Image</label>
                  <div className={styles.uploadContainer}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="thumbnail-upload" 
                      className={styles.fileInput} 
                      onChange={async (e) => {
                        const handler = await handleFileUpload('thumbnailUrl', setUploadingThumbnail);
                        await handler(e);
                      }} 
                    />
                    <label htmlFor="thumbnail-upload" className={styles.uploadBtn}>
                      {uploadingThumbnail ? 'Uploading... ⏳' : '📁 Upload Thumbnail'}
                    </label>
                    {form.thumbnailUrl && (
                      <div className={styles.imagePreviewWrapper}>
                        <img src={getFullUrl(form.thumbnailUrl)} alt="Thumbnail Preview" className={styles.imagePreview} />
                        <button type="button" className={styles.removeImgBtn} onClick={() => setForm(prev => ({ ...prev, thumbnailUrl: '' }))}>✕</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Instructor Avatar</label>
                  <div className={styles.uploadContainer}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="avatar-upload" 
                      className={styles.fileInput} 
                      onChange={async (e) => {
                        const handler = await handleFileUpload('instructorAvatar', setUploadingAvatar);
                        await handler(e);
                      }} 
                    />
                    <label htmlFor="avatar-upload" className={styles.uploadBtn}>
                      {uploadingAvatar ? 'Uploading... ⏳' : '📁 Upload Avatar'}
                    </label>
                    {form.instructorAvatar && (
                      <div className={styles.imagePreviewWrapper}>
                        <img src={getFullUrl(form.instructorAvatar)} alt="Avatar Preview" className={styles.imagePreview} />
                        <button type="button" className={styles.removeImgBtn} onClick={() => setForm(prev => ({ ...prev, instructorAvatar: '' }))}>✕</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Demo Video URL</label>
                  <input className={styles.formInput} value={form.previewVideoUrl} onChange={handleChange('previewVideoUrl')} placeholder="e.g. https://..." />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Short Description</label>
                <input className={styles.formInput} value={form.shortDescription} onChange={handleChange('shortDescription')} placeholder="One-line summary" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description *</label>
                <textarea className={`${styles.formInput} ${styles.textArea}`} value={form.description} onChange={handleChange('description')} placeholder="Full course description..." rows={4} required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Instructor Bio</label>
                <textarea className={`${styles.formInput} ${styles.textArea}`} value={form.instructorBio} onChange={handleChange('instructorBio')} placeholder="Instructor bio..." rows={2} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>What You'll Learn (Features - one per line)</label>
                <textarea 
                  className={`${styles.formInput} ${styles.textArea}`} 
                  value={form.features} 
                  onChange={handleChange('features')} 
                  placeholder={"e.g.\n52+ hours of video\n10+ ML projects\nJob placement support"} 
                  rows={4} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Course Curriculum (Syllabus - Module followed by - topics)</label>
                <textarea 
                  className={`${styles.formInput} ${styles.textArea}`} 
                  value={form.syllabus} 
                  onChange={handleChange('syllabus')} 
                  placeholder={"e.g.\nModule 1: ML Foundations\n- Linear Algebra\n- Probability\n\nModule 2: Supervised Learning\n- Linear Regression\n- Logistic Regression"} 
                  rows={8} 
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeForm}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
