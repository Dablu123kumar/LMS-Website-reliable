'use client';

import { useState, useEffect } from 'react';
import { api, getGeneralUser, getFullUrl } from '@/lib/api';
import AgoraLiveRoom from '@/components/AgoraLiveRoom';
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
  const [uploadingRecordingVideo, setUploadingRecordingVideo] = useState(false);
  const [uploadingRecordingThumbnail, setUploadingRecordingThumbnail] = useState(false);

  // Agora custom in-app live classroom states
  const [streamingToken, setStreamingToken] = useState(null);
  const [streamingAppId, setStreamingAppId] = useState('');
  const [streamingUid, setStreamingUid] = useState(0);
  const [streamingLiveClassId, setStreamingLiveClassId] = useState(null);

  // Batch management states
  const [showManageBatchesModal, setShowManageBatchesModal] = useState(false);
  const [selectedCourseIdForBatches, setSelectedCourseIdForBatches] = useState('');
  const [batchesList, setBatchesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [activeBatch, setActiveBatch] = useState(null); // editing/creating batch
  const [batchForm, setBatchForm] = useState({
    batchName: '',
    studentIds: []
  });

  // Scheduling target states
  const [targetingMode, setTargetingMode] = useState('ALL'); // 'ALL' | 'BATCH' | 'STUDENT'
  const [selectedTargetBatchId, setSelectedTargetBatchId] = useState('');
  const [selectedTargetStudentId, setSelectedTargetStudentId] = useState('');

  async function loadBatchesAndStudents(courseId) {
    if (!courseId) return;
    try {
      const [batchesRes, studentsRes] = await Promise.all([
        api.adminGetBatches(courseId),
        api.adminGetCourseStudents(courseId)
      ]);
      setBatchesList(batchesRes?.data || []);
      setStudentsList(studentsRes?.data || []);
    } catch (err) {
      console.error('Failed to load batches or students:', err);
      showToast('Failed to load batches/students.', 'error');
    }
  }

  async function handleStartLiveClassDirect(item) {
    if (!confirm(`Are you sure you want to launch the live class "${item.title}"?`)) return;
    
    setSubmitting(true);
    try {
      // 1. Transition class state to LIVE on server
      if (item.status === 'SCHEDULED') {
        await api.adminStartLiveClass(item.id, { meetingUrl: 'in-app' });
      }
      
      // 2. Fetch Agora Publisher token
      const res = await api.adminGetLiveClassToken(item.id);
      if (res?.success && res.data) {
        setStreamingToken(res.data.token);
        setStreamingAppId(res.data.appId);
        setStreamingUid(res.data.uid);
        setStreamingLiveClassId(item.id);
        showToast('In-App Live Stream started!');
        // Refresh list to reflect LIVE status
        await loadData();
      } else {
        showToast('Failed to generate stream token.', 'error');
      }
    } catch (err) {
      console.error('[Agora] Host start error:', err);
      showToast(err.message || 'Failed to start live stream.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStopStreaming(endPermanently = false) {
    if (endPermanently && streamingLiveClassId) {
      try {
        await api.adminEndLiveClass(streamingLiveClassId);
        showToast('Live session ended permanently.');
      } catch (err) {
        showToast('Failed to end live session on server.', 'error');
      }
    }
    setStreamingLiveClassId(null);
    setStreamingToken(null);
    await loadData();
  }

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
          setRecordingForm((prev) => ({ ...prev, [field]: res.url }));
          showToast('File uploaded successfully!');
        } else {
          showToast('Failed to upload file.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Error uploading file.', 'error');
      } finally {
        setUploading(false);
      }
    };
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (scheduleForm.courseId) {
      loadBatchesAndStudents(scheduleForm.courseId);
    }
  }, [scheduleForm.courseId]);

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

    if (targetingMode === 'BATCH' && !selectedTargetBatchId) {
      showToast('Please select a targeted batch.', 'error');
      return;
    }

    if (targetingMode === 'STUDENT' && !selectedTargetStudentId) {
      showToast('Please select a targeted student.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.adminScheduleLiveClass({
        ...scheduleForm,
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
        batchId: targetingMode === 'BATCH' ? selectedTargetBatchId : null,
        studentId: targetingMode === 'STUDENT' ? selectedTargetStudentId : null,
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
      setTargetingMode('ALL');
      setSelectedTargetBatchId('');
      setSelectedTargetStudentId('');
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
          <button
            onClick={() => {
              const defaultCourseId = courses[0]?.id || '';
              setSelectedCourseIdForBatches(defaultCourseId);
              if (defaultCourseId) {
                loadBatchesAndStudents(defaultCourseId);
              }
              setShowManageBatchesModal(true);
            }}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-base)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            👥 Manage Batches
          </button>
          <button className={styles.scheduleBtn} onClick={() => {
            const defaultCourseId = courses[0]?.id || '';
            setScheduleForm({
              courseId: defaultCourseId,
              title: '',
              description: '',
              scheduledAt: '',
              meetingUrl: '',
            });
            setTargetingMode('ALL');
            setSelectedTargetBatchId('');
            setSelectedTargetStudentId('');
            if (defaultCourseId) {
              loadBatchesAndStudents(defaultCourseId);
            }
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

      {streamingLiveClassId ? (
        <div style={{ marginBottom: '30px', padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <span style={{ animation: 'pulse 1.5s infinite', color: '#ef4444' }}>🔴</span> 
            <span>Broadcasting:</span> 
            <span style={{ color: 'var(--text-muted)' }}>
              {liveClasses.find(lc => lc.id === streamingLiveClassId)?.title}
            </span>
          </h3>
          <AgoraLiveRoom
            channelName={streamingLiveClassId}
            token={streamingToken}
            appId={streamingAppId}
            uid={streamingUid}
            isHost={true}
            onLeave={(wasEnded) => {
              handleStopStreaming(wasEnded);
            }}
          />
        </div>
      ) : null}
 
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
                      {item.batch && (
                        <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          🎯 Batch: {item.batch.batchName}
                        </span>
                      )}
                      {item.student && (
                        <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          👤 Student: {item.student.firstName} {item.student.lastName}
                        </span>
                      )}
                      {!item.batchId && !item.studentId && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          👥 Target: All Students
                        </span>
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
                          <button className={styles.startBtn} onClick={() => handleStartLiveClassDirect(item)}>
                            ▶️ Start
                          </button>
                          <button className={styles.notifyBtn} onClick={() => handleNotifyStudents(item.id)}>
                            📣 Notify
                          </button>
                        </>
                      )}
                      {item.status === 'LIVE' && (
                        <>
                          <button className={styles.startBtn} style={{ backgroundColor: '#10b981', color: '#fff' }} onClick={() => handleStartLiveClassDirect(item)}>
                            🎥 Resume
                          </button>
                          <button className={styles.endBtn} onClick={() => handleEndLiveClass(item.id)}>
                            ⏹️ End
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
                <label className={styles.formLabel}>Target Audience *</label>
                <select
                  className={styles.formInput}
                  value={targetingMode}
                  onChange={(e) => {
                    setTargetingMode(e.target.value);
                    setSelectedTargetBatchId('');
                    setSelectedTargetStudentId('');
                  }}
                  required
                >
                  <option value="ALL">All Enrolled Students</option>
                  <option value="BATCH">Specific Batch</option>
                  <option value="STUDENT">Individual Student</option>
                </select>
              </div>

              {targetingMode === 'BATCH' && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Select Batch *</label>
                  <select
                    className={styles.formInput}
                    value={selectedTargetBatchId}
                    onChange={(e) => setSelectedTargetBatchId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Batch --</option>
                    {batchesList.map((b) => (
                      <option key={b.id} value={b.id}>{b.batchName}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetingMode === 'STUDENT' && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Select Student *</label>
                  <select
                    className={styles.formInput}
                    value={selectedTargetStudentId}
                    onChange={(e) => setSelectedTargetStudentId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.email})</option>
                    ))}
                  </select>
                </div>
              )}

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
                    style={{ marginBottom: '8px' }}
                    required
                  />
                  <div className={styles.uploadContainer}>
                    <input 
                      type="file" 
                      accept="video/*" 
                      id="recording-video-upload" 
                      className={styles.fileInput} 
                      onChange={async (e) => {
                        const handler = await handleFileUpload('videoUrl', setUploadingRecordingVideo);
                        await handler(e);
                      }} 
                    />
                    <label htmlFor="recording-video-upload" className={styles.uploadBtn}>
                      {uploadingRecordingVideo ? 'Uploading... ⏳' : '📁 Upload Video File'}
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thumbnail Link (Optional)</label>
                  <input
                    className={styles.formInput}
                    value={recordingForm.thumbnailUrl}
                    onChange={(e) => setRecordingForm({ ...recordingForm, thumbnailUrl: e.target.value })}
                    placeholder="Image cover URL"
                    style={{ marginBottom: '8px' }}
                  />
                  <div className={styles.uploadContainer}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="recording-thumbnail-upload" 
                      className={styles.fileInput} 
                      onChange={async (e) => {
                        const handler = await handleFileUpload('thumbnailUrl', setUploadingRecordingThumbnail);
                        await handler(e);
                      }} 
                    />
                    <label htmlFor="recording-thumbnail-upload" className={styles.uploadBtn}>
                      {uploadingRecordingThumbnail ? 'Uploading... ⏳' : '📁 Upload Thumbnail'}
                    </label>
                  </div>
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
      {/* ─── Manage Course Batches Modal ─── */}
      {showManageBatchesModal && (
        <div className={styles.modalOverlay} onClick={() => {
          setShowManageBatchesModal(false);
          setActiveBatch(null);
          setBatchForm({ batchName: '', studentIds: [] });
        }}>
          <div className={styles.formModal} style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.formHeader}>
              <h3 className={styles.formTitle}>👥 Manage Course Batches</h3>
              <button className={styles.closeBtn} onClick={() => {
                setShowManageBatchesModal(false);
                setActiveBatch(null);
                setBatchForm({ batchName: '', studentIds: [] });
              }}>✕</button>
            </div>

            <div className={styles.modalBody} style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Select Course</label>
                <select
                  className={styles.formInput}
                  value={selectedCourseIdForBatches}
                  onChange={(e) => {
                    setSelectedCourseIdForBatches(e.target.value);
                    loadBatchesAndStudents(e.target.value);
                    setActiveBatch(null);
                    setBatchForm({ batchName: '', studentIds: [] });
                  }}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {selectedCourseIdForBatches && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Left Column: Batches List */}
                  <div style={{ borderRight: '1px solid var(--border-glass)', paddingRight: '20px' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Existing Batches</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                      {batchesList.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No batches created for this course yet.</div>
                      ) : (
                        batchesList.map((b) => (
                          <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{b.batchName}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.students?.length || 0} students</div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveBatch(b);
                                  setBatchForm({
                                    batchName: b.batchName,
                                    studentIds: b.students?.map((s) => s.id) || [],
                                  });
                                }}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '4px', cursor: 'pointer', color: 'var(--accent-blue)' }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!confirm('Are you sure you want to delete this batch?')) return;
                                  try {
                                    await api.adminDeleteBatch(b.id);
                                    showToast('Batch deleted successfully.');
                                    loadBatchesAndStudents(selectedCourseIdForBatches);
                                    if (activeBatch?.id === b.id) {
                                      setActiveBatch(null);
                                      setBatchForm({ batchName: '', studentIds: [] });
                                    }
                                  } catch (err) {
                                    showToast(err.message || 'Failed to delete batch.', 'error');
                                  }
                                }}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '4px', cursor: 'pointer', color: 'var(--accent-rose)' }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Form */}
                  <div>
                    <h4 style={{ marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {activeBatch ? `Edit Batch: ${activeBatch.batchName}` : 'Create New Batch'}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Batch Name *</label>
                        <input
                          className={styles.formInput}
                          value={batchForm.batchName}
                          onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                          placeholder="e.g. Evening Batch A"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Select Students</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                          {studentsList.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No students enrolled in this course yet.</div>
                          ) : (
                            studentsList.map((student) => {
                              const isChecked = batchForm.studentIds.includes(student.id);
                              return (
                                <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      setBatchForm((prev) => {
                                        const nextIds = prev.studentIds.includes(student.id)
                                          ? prev.studentIds.filter((id) => id !== student.id)
                                          : [...prev.studentIds, student.id];
                                        return { ...prev, studentIds: nextIds };
                                      });
                                    }}
                                  />
                                  <span>{student.firstName} {student.lastName} ({student.email})</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                        {activeBatch && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBatch(null);
                              setBatchForm({ batchName: '', studentIds: [] });
                            }}
                            style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--border-glass)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}
                          >
                            Cancel Edit
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={!batchForm.batchName.trim()}
                          onClick={async () => {
                            try {
                              if (activeBatch) {
                                await api.adminUpdateBatch(activeBatch.id, batchForm);
                                showToast('Batch updated successfully.');
                              } else {
                                await api.adminCreateBatch({
                                  courseId: selectedCourseIdForBatches,
                                  ...batchForm,
                                });
                                showToast('Batch created successfully.');
                              }
                              setBatchForm({ batchName: '', studentIds: [] });
                              setActiveBatch(null);
                              loadBatchesAndStudents(selectedCourseIdForBatches);
                            } catch (err) {
                              showToast(err.message || 'Failed to save batch.', 'error');
                            }
                          }}
                          style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontWeight: '600' }}
                        >
                          {activeBatch ? 'Update Batch' : 'Create Batch'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
