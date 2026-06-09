'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './page.module.css';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  
  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [whatsappModal, setWhatsappModal] = useState(null); // holds inquiry for WhatsApp redirect
  const [whatsappMsg, setWhatsappMsg] = useState('');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter,
        type: typeFilter,
        search: search.trim()
      };
      const res = await api.adminGetInquiries(page, 10, filters);
      if (res?.data) {
        setInquiries(res.data.inquiries);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      triggerToast(err.message || 'Failed to load inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
    // Fetch immediately after clear
    setTimeout(fetchInquiries, 50);
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const res = await api.adminUpdateInquiryStatus(id, nextStatus);
      if (res?.success) {
        triggerToast(`Inquiry status updated to ${nextStatus}`, 'success');
        // Update local list state
        setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: nextStatus } : item));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(prev => ({ ...prev, status: nextStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      triggerToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this inquiry?')) return;
    try {
      const res = await api.adminDeleteInquiry(id);
      if (res?.success) {
        triggerToast('Inquiry deleted successfully', 'success');
        setSelectedInquiry(null);
        fetchInquiries();
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      triggerToast(err.message || 'Failed to delete inquiry', 'error');
    }
  };

  const openWhatsappModal = (inquiry) => {
    setWhatsappModal(inquiry);
    const courseText = inquiry.course ? ` regarding the course "${inquiry.course}"` : '';
    const subjectText = inquiry.subject ? ` regarding "${inquiry.subject}"` : '';
    const defaultMsg = `Hi ${inquiry.name}, I'm connecting from LearnHub${courseText || subjectText}. How can we assist you today with your learning goals?`;
    setWhatsappMsg(defaultMsg);
  };

  const handleWhatsappSend = () => {
    if (!whatsappModal) return;
    
    // Sanitize phone number: keep only digits
    let sanitizedPhone = whatsappModal.phone.replace(/\D/g, '');
    
    // Add country code if not present (default to 91 for Indian numbers if length is 10 digits)
    if (sanitizedPhone.length === 10) {
      sanitizedPhone = '91' + sanitizedPhone;
    }

    if (!sanitizedPhone) {
      triggerToast('Invalid phone number for WhatsApp connection.', 'error');
      return;
    }

    // Build WhatsApp URL (using standard official redirect)
    const waUrl = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(whatsappMsg)}`;
    
    // Open in a new tab
    window.open(waUrl, '_blank');

    // Automatically mark inquiry as CONTACTED in the DB if it is currently PENDING
    if (whatsappModal.status === 'PENDING') {
      handleUpdateStatus(whatsappModal.id, 'CONTACTED');
    }

    setWhatsappModal(null);
  };

  const handleDirectWhatsapp = (item) => {
    if (!item.phone) {
      triggerToast('No phone number provided for WhatsApp contact.', 'error');
      return;
    }
    let sanitizedPhone = item.phone.replace(/\D/g, '');
    if (sanitizedPhone.length === 10) {
      sanitizedPhone = '91' + sanitizedPhone;
    }
    const courseText = item.course ? ` regarding the course "${item.course}"` : '';
    const subjectText = item.subject ? ` regarding "${item.subject}"` : '';
    const defaultMsg = `Hi ${item.name}, I'm connecting from LearnHub${courseText || subjectText}. How can we assist you today?`;

    const waUrl = `https://web.whatsapp.com/send?phone=${sanitizedPhone}&text=${encodeURIComponent(defaultMsg)}`;
    window.open(waUrl, '_blank');

    if (item.status === 'PENDING') {
      handleUpdateStatus(item.id, 'CONTACTED');
    }
  };

  const handleDirectMail = (item) => {
    const subject = item.course 
      ? `Regarding your course inquiry: ${item.course}` 
      : item.subject 
      ? `Regarding your inquiry: ${item.subject}` 
      : 'Inquiry from LearnHub';
    const body = `Hi ${item.name},\n\nThank you for reaching out to LearnHub. We received your query:\n"${item.message || ''}"\n\nHow can we help you further?\n\nBest regards,\nLearnHub Team`;
    
    const mailUrl = `mailto:${item.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailUrl, '_blank');

    if (item.status === 'PENDING') {
      handleUpdateStatus(item.id, 'CONTACTED');
    }
  };

  const getSourceBadge = (type) => {
    switch (type) {
      case 'CONTACT_PAGE':
        return <span className={`${styles.badge} ${styles.badgeContact}`}>Contact Page</span>;
      case 'BOTTOM_FORM':
        return <span className={`${styles.badge} ${styles.badgeBottom}`}>Bottom Qs Form</span>;
      case 'COUNSELLING_FORM':
        return <span className={`${styles.badge} ${styles.badgeCounselling}`}>Counselling</span>;
      default:
        return <span className={`${styles.badge}`}>{type}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pending</span>;
      case 'CONTACTED':
        return <span className={`${styles.statusBadge} ${styles.statusContacted}`}>Contacted</span>;
      case 'RESOLVED':
        return <span className={`${styles.statusBadge} ${styles.statusResolved}`}>Resolved</span>;
      default:
        return <span className={`${styles.statusBadge}`}>{status}</span>;
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* Header and Statistics */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inquiries & Leads</h1>
          <p className={styles.subtitle}>Manage customer queries, request forms, and connect with prospective students</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchInquiries} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterCard}>
        <form onSubmit={handleSearchSubmit} className={styles.filterForm}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              placeholder="Search by name, email, phone, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>Search</button>
          </div>

          <div className={styles.selectGroup}>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONTACTED">Contacted</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Source Forms</option>
              <option value="CONTACT_PAGE">Contact Us Page</option>
              <option value="BOTTOM_FORM">Bottom Qs Form</option>
              <option value="COUNSELLING_FORM">Counselling Form</option>
            </select>

            {(search || statusFilter || typeFilter) && (
              <button 
                type="button" 
                onClick={handleClearFilters}
                className={styles.clearBtn}
              >
                Clear Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Inquiries Table / Grid */}
      {loading ? (
        <div className={styles.loaderArea}>
          <div className={styles.spinner} />
          <p>Loading inquiries...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className={styles.emptyArea}>
          <span>✉️</span>
          <h3>No inquiries found</h3>
          <p>Adjust your search filters or check back later.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.inquiriesTable}>
            <thead>
              <tr>
                <th>Date Received</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Course/Subject</th>
                <th>Message</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((item) => (
                <tr key={item.id} className={item.status === 'PENDING' ? styles.rowPending : ''}>
                  <td className={styles.dateCol}>
                    {formatDate(item.createdAt)}
                  </td>
                  <td className={styles.nameCol}>
                    <div className={styles.userName}>{item.name}</div>
                  </td>
                  <td className={styles.emailCol}>
                    <div className={styles.emailWrapper}>
                      <span className={styles.userEmail}>{item.email}</span>
                      <button 
                        onClick={() => handleDirectMail(item)}
                        className={`${styles.contactBtn} ${styles.contactBtnMail}`}
                        title={`Email ${item.name} (${item.email})`}
                      >
                        <MailIcon />
                      </button>
                    </div>
                  </td>
                  <td className={styles.phoneCol}>
                    {item.phone ? (
                      <div className={styles.phoneWrapper}>
                        <span className={styles.userPhone}>{item.phone}</span>
                        <button 
                          onClick={() => handleDirectWhatsapp(item)}
                          className={`${styles.contactBtn} ${styles.contactBtnWa}`}
                          title={`WhatsApp ${item.name} (${item.phone})`}
                        >
                          <WhatsAppIcon />
                        </button>
                      </div>
                    ) : (
                      <span className={styles.noPhone}>—</span>
                    )}
                  </td>
                  <td className={styles.topicCol}>
                    {item.course && (
                      <div className={styles.interestCourse}>
                        <strong>Course:</strong> {item.course}
                      </div>
                    )}
                    {item.subject && (
                      <div className={styles.interestSubject}>
                        <strong>Subject:</strong> {item.subject}
                      </div>
                    )}
                    {!item.course && !item.subject && (
                      <span className={styles.noTopic}>—</span>
                    )}
                  </td>
                  <td className={styles.messageCol}>
                    <div className={styles.messageSnippet}>
                      {item.message ? (
                        item.message.length > 80 ? `${item.message.slice(0, 80)}...` : item.message
                      ) : (
                        <em style={{ color: 'var(--text-muted)' }}>No message text</em>
                      )}
                    </div>
                  </td>
                  <td>
                    {getSourceBadge(item.type)}
                  </td>
                  <td>
                    {getStatusBadge(item.status)}
                  </td>
                  <td className={styles.actionCol}>
                    <div className={styles.actionRow}>
                      <button 
                        onClick={() => setSelectedInquiry(item)} 
                        className={styles.actionBtnView} 
                        title="View Details"
                      >
                        👁️
                      </button>
                      {item.phone && (
                        <button 
                          onClick={() => openWhatsappModal(item)} 
                          className={styles.actionBtnWa} 
                          title="Connect on WhatsApp"
                        >
                          💬
                        </button>
                      )}
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className={styles.statusSelect}
                        title="Change Status"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className={styles.actionBtnDelete} 
                        title="Delete inquiry"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                disabled={page === 1}
                className={styles.pageBtn}
              >
                ◀ Prev
              </button>
              <span className={styles.pageInfo}>
                Page <strong>{page}</strong> of {pagination.totalPages}
              </span>
              <button 
                onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))} 
                disabled={page === pagination.totalPages}
                className={styles.pageBtn}
              >
                Next ▶
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inquiry Detail View Modal */}
      {selectedInquiry && (
        <div className={styles.modalOverlay} onClick={() => setSelectedInquiry(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Lead Detail Details</h3>
              <button className={styles.modalClose} onClick={() => setSelectedInquiry(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalMetaGrid}>
                <div>
                  <label>Full Name</label>
                  <div>{selectedInquiry.name}</div>
                </div>
                <div>
                  <label>Email Address</label>
                  <div><a href={`mailto:${selectedInquiry.email}`} className={styles.mailLink}>{selectedInquiry.email}</a></div>
                </div>
                <div>
                  <label>Phone Number</label>
                  <div>{selectedInquiry.phone || 'Not provided'}</div>
                </div>
                <div>
                  <label>Submission Source</label>
                  <div>{getSourceBadge(selectedInquiry.type)}</div>
                </div>
                <div>
                  <label>Date Received</label>
                  <div>{formatDate(selectedInquiry.createdAt)}</div>
                </div>
                <div>
                  <label>Current Status</label>
                  <div>{getStatusBadge(selectedInquiry.status)}</div>
                </div>
              </div>

              {(selectedInquiry.subject || selectedInquiry.course) && (
                <div className={styles.modalDetailsRow}>
                  {selectedInquiry.subject && (
                    <div style={{ marginBottom: '10px' }}>
                      <label>Subject</label>
                      <div className={styles.modalTitleVal}>{selectedInquiry.subject}</div>
                    </div>
                  )}
                  {selectedInquiry.course && (
                    <div>
                      <label>Course of Interest</label>
                      <div className={styles.modalTitleVal}>{selectedInquiry.course}</div>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.modalMessageBlock}>
                <label>User Message / Query</label>
                <div className={styles.modalMessageContent}>
                  {selectedInquiry.message || <em style={{ color: 'var(--text-muted)' }}>No message text submitted.</em>}
                </div>
              </div>

              <div className={styles.modalActionsRow}>
                <div className={styles.statusUpdateGroup}>
                  <label>Update Status:</label>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleUpdateStatus(selectedInquiry.id, e.target.value)}
                    className={styles.modalStatusSelect}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                <div className={styles.modalRightActions}>
                  {selectedInquiry.phone && (
                    <button 
                      onClick={() => {
                        openWhatsappModal(selectedInquiry);
                        setSelectedInquiry(null);
                      }} 
                      className={styles.modalWaBtn}
                    >
                      💬 WhatsApp Connect
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(selectedInquiry.id)} 
                    className={styles.modalDeleteBtn}
                  >
                    🗑️ Delete Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Message Builder Modal */}
      {whatsappModal && (
        <div className={styles.modalOverlay} onClick={() => setWhatsappModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h3>💬 Connect via WhatsApp Web</h3>
              <button className={styles.modalClose} onClick={() => setWhatsappModal(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalHelpText}>
                You are connecting with <strong>{whatsappModal.name}</strong> ({whatsappModal.phone}).
                This will redirect you to WhatsApp Web containing your prefilled message.
              </p>
              
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Prefilled Message Text</label>
                <textarea
                  value={whatsappMsg}
                  onChange={(e) => setWhatsappMsg(e.target.value)}
                  rows={4}
                  className={styles.modalTextarea}
                />
              </div>

              <div className={styles.whatsappFooter}>
                <button 
                  onClick={() => setWhatsappModal(null)} 
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleWhatsappSend} 
                  className={styles.sendBtn}
                >
                  Launch WhatsApp Web ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
