'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { api, getGeneralUser } from '@/lib/api';
import styles from './page.module.css';


export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [expandedRow, setExpandedRow] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [toast, setToast] = useState(null);

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Delete modal
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadStudents = useCallback(async (pageNum, query) => {
    try {
      setLoading(true);
      const res = await api.adminGetStudents(pageNum, 15, query);
      setStudents(res?.data || []);
      setPagination(res?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [myCourseIds, setMyCourseIds] = useState([]);

  useEffect(() => {
    const user = getGeneralUser();
    setCurrentUser(user);
    if (user && user.role === 'INSTRUCTOR') {
      const loadInstructorCourses = async () => {
        try {
          const res = await api.adminGetCourses();
          const courses = res?.data || [];
          const instructorName = `${user.firstName} ${user.lastName}`.toLowerCase();
          const myCourses = courses.filter(c => c.instructorName?.toLowerCase() === instructorName);
          setMyCourseIds(myCourses.map(c => c.id));
        } catch (err) {
          console.error('Failed to load instructor courses:', err);
        }
      };
      loadInstructorCourses();
    }
    loadStudents(1, '');
  }, [loadStudents]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      setPage(1);
      loadStudents(1, value);
    }, 400);
    setDebounceTimer(timer);
  }

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPage(newPage);
    loadStudents(newPage, search);
  }

  function toggleRow(id) {
    setExpandedRow(expandedRow === id ? null : id);
  }

  // ─── Edit handlers ────────────────────────────────────────────────────
  function openEditModal(student) {
    setEditForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
    });
    setEditModal(student);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editModal) return;
    setEditSaving(true);
    try {
      await api.adminUpdateStudent(editModal.id, editForm);
      showToast('Student updated successfully!');
      setEditModal(null);
      await loadStudents(page, search);
    } catch (err) {
      showToast(err.message || 'Failed to update student.', 'error');
    } finally {
      setEditSaving(false);
    }
  }

  // ─── Delete handlers ──────────────────────────────────────────────────
  async function handleDelete(id) {
    try {
      await api.adminDeleteStudent(id);
      showToast('Student deleted successfully!');
      setDeleteConfirm(null);
      await loadStudents(page, search);
    } catch (err) {
      showToast(err.message || 'Failed to delete student.', 'error');
    }
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
          <h2 className={styles.pageTitle}>Students</h2>
          <p className={styles.pageSubtitle}>{pagination.total} registered students</p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search by name or email..."
          className={styles.searchInput}
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingState}>Loading students...</div>
        ) : students.length === 0 ? (
          <div className={styles.emptyState}>No students found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>Student</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Enrolled Courses</th>
                <th>LMS Username</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student,i) => (
                <Fragment key={student.id}>
                  <tr onClick={() => toggleRow(student.id)} className={`${styles.clickableRow} ${expandedRow === student.id ? styles.expandedRowTr : ''}`}>
                    <td className={styles.expandToggle}>
                      <span className={`${styles.expandIcon} ${expandedRow === student.id ? styles.expandIconOpen : ''}`}>
                        ▸
                      </span>
                    </td>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.studentAvatar}>
                          {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className={styles.studentName}>{student.firstName} {student.lastName}</div>
                          <div className={styles.studentRole}>
                            {student.role === 'ADMIN' ? (
                              <span className={styles.adminTag}>Admin</span>
                            ) : 'Student'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.emailCell}>{student.email}</td>
                    <td className={styles.phoneCell}>{student.phone || '—'}</td>
                    <td>
                      <div className={styles.enrolledCoursesList}>
                        {student.enrollments && student.enrollments.length > 0 ? (
                          student.enrollments
                            .filter(e => !currentUser || currentUser.role !== 'INSTRUCTOR' || myCourseIds.includes(e.courseId))
                            .slice(0, 3)
                            .map((enrollment, idx) => (
                              <span key={enrollment.id} className={styles.courseBadge}>
                                {enrollment.course?.title || 'Unknown'}
                              </span>
                            ))
                        ) : (
                          <span className={styles.noCoursesBadge}>None</span>
                        )}
                        {student.enrollments && student.enrollments.filter(e => !currentUser || currentUser.role !== 'INSTRUCTOR' || myCourseIds.includes(e.courseId)).length > 3 && (
                          <span className={styles.moreCourseBadge}>
                            +{student.enrollments.filter(e => !currentUser || currentUser.role !== 'INSTRUCTOR' || myCourseIds.includes(e.courseId)).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {student.lmsCredentials && student.lmsCredentials.length > 0 ? (
                        <span className={styles.lmsUsername}>{student.lmsCredentials[0].lmsUsername}</span>
                      ) : (
                        <span className={styles.noLms}>Not set</span>
                      )}
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                        <button
                          className={styles.editBtn}
                          onClick={(e) => { e.stopPropagation(); openEditModal(student); }}
                          title="Edit Student"
                        >
                          ✏️
                        </button>
                        {student.role !== 'ADMIN' && (
                          <button
                            className={styles.deleteBtn}
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(student); }}
                            title="Delete Student"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === student.id && (
                    <tr key={`${student.id}-details`} className={styles.detailsRow}>
                      <td colSpan="8">
                        <div className={styles.detailsContent}>
                          <h4 className={styles.detailsTitle}>Enrolled Courses</h4>
                          {student.enrollments && student.enrollments.filter(e => !currentUser || currentUser.role !== 'INSTRUCTOR' || myCourseIds.includes(e.courseId)).length > 0 ? (
                            <div className={styles.enrollmentsList}>
                              {student.enrollments
                                .filter(e => !currentUser || currentUser.role !== 'INSTRUCTOR' || myCourseIds.includes(e.courseId))
                                .map((enrollment) => (
                                <div key={enrollment.id} className={styles.enrollmentItem}>
                                  <span className={styles.enrollmentCourse}>
                                    {enrollment.course?.title || 'Unknown Course'}
                                  </span>
                                  <span className={styles.enrollmentDate}>
                                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={styles.noEnrollments}>No course enrollments yet.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <div className={styles.pageInfo}>
            Page {page} of {pagination.totalPages}
          </div>
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pagination.totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>⚠️ Delete Student?</h3>
            <p className={styles.modalText}>
              This will permanently delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong> and all their enrollments, payments, and LMS credentials. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(deleteConfirm.id)}>Delete Student</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editModal && (
        <div className={styles.modalOverlay} onClick={() => setEditModal(null)}>
          <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>✏️ Edit Student</h3>
              <button className={styles.closeBtn} onClick={() => setEditModal(null)}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>First Name</label>
                  <input
                    className={styles.formInput}
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Last Name</label>
                  <input
                    className={styles.formInput}
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    className={styles.formInput}
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone</label>
                  <input
                    className={styles.formInput}
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditModal(null)}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={editSaving}>
                  {editSaving ? 'Saving...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
