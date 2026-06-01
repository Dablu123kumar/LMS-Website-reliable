'use client';

import { useState, useEffect } from 'react';
import { api, getGeneralUser } from '@/lib/api';
import styles from './page.module.css';


export default function AdminLiveClassesPage() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'recordings'
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filter state
  const [filterCourse, setFilterCourse] = useState('');

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddRecordingModal, setShowAddRecordingModal] = useState(false);
  const [showStartLiveModal, setShowStartLiveModal] = useState(false);

  // Forms state
  const [scheduleForm, setScheduleForm] = useState({
    courseId: '',
    title: '',
    description: '',
    scheduledAt: '',
    meetingUrl: '',
  });

  const [recordingForm, setRecordingForm] = useState({
    courseId: '',
    liveClassId: '',
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    durationSeconds: '',
    sortOrder: '0',
  });

  const [activeLiveClass, setActiveLiveClass] = useState(null);
  const [meetingUrlInput, setMeetingUrlInput] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [coursesRes, liveClassesRes, recordingsRes] = await Promise.all([
        api.adminGetCourses(),
        api.adminGetLiveClasses(),
        api.adminGetRecordings(),
      ]);

      const user = getGeneralUser();
      let coursesData = coursesRes?.data || [];
      let liveClassesData = liveClassesRes?.data || [];
      let recordingsData = recordingsRes?.data || [];

      if (user && user.role === 'INSTRUCTOR') {
        const instructorName = `${user.firstName} ${user.lastName}`.toLowerCase();
        coursesData = coursesData.filter(c => c.instructorName?.toLowerCase() === instructorName);
        const myCourseIds = coursesData.map(c => c.id);

        liveClassesData = liveClassesData.filter(lc => myCourseIds.includes(lc.courseId));
        recordingsData = recordingsData.filter(r => myCourseIds.includes(r.courseId));
      }

      setCourses(coursesData);
      setLiveClasses(liveClassesData);
      setRecordings(recordingsData);
    } catch (err) {
      console.error('Failed to load admin live/recording data:', err);
      showToast(err.message || 'Failed to fetch data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ─── Live Class Operations ───
  async function handleScheduleSubmit(e) {
    e.preventDefault();
    if (!scheduleForm.courseId || !scheduleForm.title || !scheduleForm.scheduledAt) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.adminScheduleLiveClass({
        ...scheduleForm,
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
      });
      showToast('Live class scheduled successfully!');
      setShowScheduleModal(false);
      setScheduleForm({
        courseId: courses[0]?.id || '',
        title: '',
        description: '',
        scheduledAt: '',
        meetingUrl: '',
      });
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to schedule live class.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function openStartLiveModal(liveClass) {
    setActiveLiveClass(liveClass);
    setMeetingUrlInput(liveClass.meetingUrl || '');
    setShowStartLiveModal(true);
  }

  async function handleStartLiveSubmit(e) {
    e.preventDefault();
    if (!meetingUrlInput.trim()) {
      showToast('Please provide a meeting/streaming URL to start.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.adminStartLiveClass(activeLiveClass.id, { meetingUrl: meetingUrlInput });
      showToast('Live class started successfully!');
      setShowStartLiveModal(false);
      setActiveLiveClass(null);
      setMeetingUrlInput('');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to start live class.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEndLiveClass(id) {
    if (!confirm('Are you sure you want to end this live class? This action is permanent.')) return;
    try {
      await api.adminEndLiveClass(id);
      showToast('Live class completed successfully!');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to end live class.', 'error');
    }
  }

  async function handleNotifyStudents(id) {
    try {
      const res = await api.adminNotifyLiveClass(id);
      showToast(res.message || 'Notifications sent to enrolled students!');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to send notifications.', 'error');
    }
  }

  // ─── Recording Operations ───
  async function handleAddRecordingSubmit(e) {
    e.preventDefault();
    if (!recordingForm.courseId || !recordingForm.title || !recordingForm.videoUrl) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...recordingForm,
        liveClassId: recordingForm.liveClassId || null,
        durationSeconds: parseInt(recordingForm.durationSeconds) || 0,
        sortOrder: parseInt(recordingForm.sortOrder) || 0,
      };
      await api.adminAddRecording(payload);
      showToast('Recording added successfully!');
      setShowAddRecordingModal(false);
      setRecordingForm({
        courseId: courses[0]?.id || '',
        liveClassId: '',
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        durationSeconds: '',
        sortOrder: '0',
      });
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to add recording.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function prefillAddRecording(liveClass) {
    setRecordingForm({
      courseId: liveClass.courseId,
      liveClassId: liveClass.id,
      title: `Recording: ${liveClass.title}`,
      description: liveClass.description || '',
      videoUrl: '',
      thumbnailUrl: '',
      durationSeconds: '',
      sortOrder: '0',
    });
    setShowAddRecordingModal(true);
  }

  // Filter arrays
  const filteredLiveClasses = filterCourse
    ? liveClasses.filter((item) => item.courseId === filterCourse)
    : liveClasses;

  const filteredRecordings = filterCourse
    ? recordings.filter((item) => item.courseId === filterCourse)
    : recordings;

  // Filter live classes for recording prefill selection
  const completedOrSelectedLiveClasses = courses.length > 0 
    ? liveClasses.filter(c => c.courseId === (recordingForm.courseId || courses[0].id))
    : [];

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading live classes & recordings...</div>
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
          <h2 className={styles.pageTitle}>Live Classes & Recordings</h2>
          <p className={styles.pageSubtitle}>Schedule live interactions and upload course lecture videos</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.scheduleBtn} onClick={() => {
            setScheduleForm({
              courseId: courses[0]?.id || '',
              title: '',
              description: '',
              scheduledAt: '',
              meetingUrl: '',
            });
            setShowScheduleModal(true);
          }}>
            📡 Schedule Live Class
          </button>
          <button className={styles.uploadBtn} onClick={() => {
            setRecordingForm({
              courseId: courses[0]?.id || '',
              liveClassId: '',
              title: '',
              description: '',
              videoUrl: '',
              thumbnailUrl: '',
              durationSeconds: '',
              sortOrder: '0',
            });
            setShowAddRecordingModal(true);
          }}>
            📹 Add Recording
          </button>
        </div>
      </div>

      {/* Top Filter and Navigation Tab */}
      <div className={styles.controlsRow}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'live' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('live')}
          >
            📡 Live Sessions ({filteredLiveClasses.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'recordings' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('recordings')}
          >
            📹 Uploaded Recordings ({filteredRecordings.length})
          </button>
        </div>

        <div className={styles.filterBar}>
          <select
            className={styles.filterSelect}
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Sessions Tab */}
      {activeTab === 'live' && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Live Session Details</th>
                <th>Course</th>
                <th>Scheduled At</th>
                <th>Status</th>
                <th>Notification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLiveClasses.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.cellMain}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      {item.description && <p className={styles.itemDesc}>{item.description}</p>}
                      {item.meetingUrl && (
                        <a href={item.meetingUrl} target="_blank" rel="noopener noreferrer" className={styles.linkUrl}>
                          🔗 Meeting Link
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={styles.courseBadge}>{item.course?.title || 'Unknown Course'}</span>
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      <span className={styles.dateText}>
                        {new Date(item.scheduledAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className={styles.timeText}>
                        {new Date(item.scheduledAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status_${item.status?.toLowerCase()}`]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.notifiedBadge} ${item.notificationSent ? styles.notifiedYes : styles.notifiedNo}`}>
                      {item.notificationSent ? '🔔 Notified' : '🔕 Not Sent'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      {item.status === 'SCHEDULED' && (
                        <>
                          <button className={styles.startBtn} onClick={() => openStartLiveModal(item)}>
                            ▶️ Start
                          </button>
                          <button className={styles.notifyBtn} onClick={() => handleNotifyStudents(item.id)}>
                            📣 Notify
                          </button>
                        </>
                      )}
                      {item.status === 'LIVE' && (
                        <>
                          <button className={styles.endBtn} onClick={() => handleEndLiveClass(item.id)}>
                            ⏹️ End
                          </button>
                          <button className={styles.notifyBtn} onClick={() => handleNotifyStudents(item.id)}>
                            📣 Ping Live
                          </button>
                        </>
                      )}
                      {item.status === 'COMPLETED' && (
                        <button className={styles.addRecBtn} onClick={() => prefillAddRecording(item)}>
                          ➕ Add Video
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLiveClasses.length === 0 && (
            <div className={styles.emptyState}>No live sessions scheduled or run yet.</div>
          )}
        </div>
      )}

      {/* Uploaded Recordings Tab */}
      {activeTab === 'recordings' && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Recording Details</th>
                <th>Course</th>
                <th>Video Information</th>
                <th>Added At</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecordings.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.cellMain}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      {item.description && <p className={styles.itemDesc}>{item.description}</p>}
                    </div>
                  </td>
                  <td>
                    <span className={styles.courseBadge}>{item.course?.title || 'Unknown Course'}</span>
                  </td>
                  <td>
                    <div className={styles.videoMetaCell}>
                      <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className={styles.linkUrl}>
                        📺 Watch Lecture
                      </a>
                      <span className={styles.durationText}>
                        ⏱️ {Math.floor(item.durationSeconds / 60)}m {item.durationSeconds % 60}s
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.dateText}>
                      {new Date(item.uploadedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecordings.length === 0 && (
            <div className={styles.emptyState}>No lecture recordings uploaded yet.</div>
          )}
        </div>
      )}

      {/* ─── Schedule Live Session Modal ─── */}
      {showScheduleModal && (
        <div className={styles.modalOverlay} onClick={() => setShowScheduleModal(false)}>
          <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>📡 Schedule Live Session</h3>
              <button className={styles.closeBtn} onClick={() => setShowScheduleModal(false)}>✕</button>
            </div>

            <form onSubmit={handleScheduleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Course *</label>
                <select
                  className={styles.formInput}
                  value={scheduleForm.courseId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, courseId: e.target.value })}
                  required
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Session Title *</label>
                <input
                  className={styles.formInput}
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="e.g. Q&A Session and Doubt Solving"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Scheduled Time *</label>
                <input
                  className={styles.formInput}
                  type="datetime-local"
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Default Meeting/Stream URL</label>
                <input
                  className={styles.formInput}
                  value={scheduleForm.meetingUrl}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetingUrl: e.target.value })}
                  placeholder="e.g. Zoom link, Google Meet link, YouTube stream"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={`${styles.formInput} ${styles.textArea}`}
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  placeholder="Add what this session covers, prerequisites, details..."
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Video Recording Modal ─── */}
      {showAddRecordingModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddRecordingModal(false)}>
          <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>📹 Add Video Recording</h3>
              <button className={styles.closeBtn} onClick={() => setShowAddRecordingModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddRecordingSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Course *</label>
                  <select
                    className={styles.formInput}
                    value={recordingForm.courseId}
                    onChange={(e) => setRecordingForm({ ...recordingForm, courseId: e.target.value, liveClassId: '' })}
                    required
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Link to Live Session (Optional)</label>
                  <select
                    className={styles.formInput}
                    value={recordingForm.liveClassId}
                    onChange={(e) => setRecordingForm({ ...recordingForm, liveClassId: e.target.value })}
                  >
                    <option value="">None (Independent upload)</option>
                    {completedOrSelectedLiveClasses.map((lc) => (
                      <option key={lc.id} value={lc.id}>
                        {lc.title} ({lc.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Recording Title *</label>
                  <input
                    className={styles.formInput}
                    value={recordingForm.title}
                    onChange={(e) => setRecordingForm({ ...recordingForm, title: e.target.value })}
                    placeholder="e.g. Session 5 Recording"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duration (in seconds) *</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    min="1"
                    value={recordingForm.durationSeconds}
                    onChange={(e) => setRecordingForm({ ...recordingForm, durationSeconds: e.target.value })}
                    placeholder="e.g. 3600 (1 hour)"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Video Link (Streaming URL) *</label>
                  <input
                    className={styles.formInput}
                    value={recordingForm.videoUrl}
                    onChange={(e) => setRecordingForm({ ...recordingForm, videoUrl: e.target.value })}
                    placeholder="e.g. YouTube URL, Vimeo URL, MP4 link"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thumbnail Link (Optional)</label>
                  <input
                    className={styles.formInput}
                    value={recordingForm.thumbnailUrl}
                    onChange={(e) => setRecordingForm({ ...recordingForm, thumbnailUrl: e.target.value })}
                    placeholder="Image cover URL"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Order Rank (Ascending order in lesson list)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={recordingForm.sortOrder}
                  onChange={(e) => setRecordingForm({ ...recordingForm, sortOrder: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={`${styles.formInput} ${styles.textArea}`}
                  value={recordingForm.description}
                  onChange={(e) => setRecordingForm({ ...recordingForm, description: e.target.value })}
                  placeholder="Details of the lecture..."
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowAddRecordingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Uploading...' : 'Save Recording'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Start Live Session Modal ─── */}
      {showStartLiveModal && (
        <div className={styles.modalOverlay} onClick={() => setShowStartLiveModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>🔴 Start Live Stream</h3>
            <p className={styles.modalText}>
              You are about to transition &ldquo;{activeLiveClass?.title}&rdquo; to LIVE. Enrolled students will be able to join via this link.
            </p>
            <form onSubmit={handleStartLiveSubmit}>
              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label className={styles.formLabel}>Meeting/Stream URL *</label>
                <input
                  className={styles.formInput}
                  value={meetingUrlInput}
                  onChange={(e) => setMeetingUrlInput(e.target.value)}
                  placeholder="e.g. Zoom or Meet URL"
                  required
                  autoFocus
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowStartLiveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.confirmStartBtn} disabled={submitting}>
                  {submitting ? 'Starting...' : 'Launch Live Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
