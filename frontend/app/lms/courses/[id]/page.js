'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { courses as mockCourses, enrolledCourses as mockEnrolledCourses } from '@/lib/data';
import VideoPlayer from '@/components/VideoPlayer';
import styles from './page.module.css';

const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4';

export default function CourseContentPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [expandedModules, setExpandedModules] = useState([0]);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadCourseContent() {
      try {
        const res = await api.getCourseContent(id);
        if (res?.data) {
          setCourse(res.data.course);
          setEnrolled(res.data.enrollment);
          setLiveClasses(res.data.liveClasses || []);
          setRecordings(res.data.recordings || []);
        } else {
          // Fallback to mock data
          const mock = mockCourses.find((c) => c.id === id);
          setCourse(mock || null);
          const mockEnr = mockEnrolledCourses.find((c) => c.id === id);
          setEnrolled(mockEnr || null);
        }
      } catch (err) {
        console.error('API error on course content, using mock data:', err);
        const mock = mockCourses.find((c) => c.id === id);
        setCourse(mock || null);
        const mockEnr = mockEnrolledCourses.find((c) => c.id === id);
        setEnrolled(mockEnr || null);
      } finally {
        setLoading(false);
      }
    }
    loadCourseContent();
  }, [id]);

  // Adjust syllabus structure dynamically if we have live classes or recordings
  const syllabusList = useMemo(() => {
    if (!course) return [];
    
    // Normalize syllabus to ensure every module has a 'lessons' array mapped from 'topics'
    let list = (course.syllabus || []).map((module) => {
      if (module.lessons) return module;
      const topics = module.topics || [];
      return {
        title: module.title || `Module ${module.week || ''}`,
        lessons: topics.map((topic) => ({
          title: topic,
          duration: '15:00',
        }))
      };
    });
    
    // Prepend Live Classes module if there are live classes
    if (liveClasses.length > 0) {
      list = [
        {
          title: '📡 Live Classes',
          lessons: liveClasses.map((lc) => ({
            title: `[Live] ${lc.title}`,
            duration: lc.status === 'LIVE' ? '🔴 Live Now' : 'Scheduled',
            isLive: true,
            meetingUrl: lc.meetingUrl,
          })),
        },
        ...list,
      ];
    }

    // Prepend Recorded Sessions module if there are recordings
    if (recordings.length > 0) {
      list = [
        {
          title: '📹 Recorded Sessions',
          lessons: recordings.map((rec) => ({
            title: `[Recording] ${rec.title}`,
            duration: `${Math.round(rec.durationSeconds / 60)} mins`,
            videoUrl: rec.videoUrl || SAMPLE_VIDEO,
            isRecording: true,
          })),
        },
        ...list,
      ];
    }

    return list;
  }, [course, liveClasses, recordings]);

  // Flatten lessons for navigation
  const allLessons = useMemo(() => {
    const flat = [];
    syllabusList.forEach((mod, mi) => {
      if (mod && mod.lessons) {
        mod.lessons.forEach((lesson, li) => {
          flat.push({ ...lesson, moduleIdx: mi, lessonIdx: li });
        });
      }
    });
    return flat;
  }, [syllabusList]);

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading course contents...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Course not found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
          This course doesn&apos;t exist in your enrollment.
        </p>
        <Link
          href="/lms/courses"
          style={{
            display: 'inline-block',
            marginTop: 16,
            padding: '10px 24px',
            background: 'var(--gradient-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
          }}
        >
          Back to My Courses
        </Link>
      </div>
    );
  }

  const currentFlatIdx = allLessons.findIndex(
    (l) => l.moduleIdx === currentModuleIdx && l.lessonIdx === currentLessonIdx
  );

  const currentLesson = syllabusList[currentModuleIdx]?.lessons[currentLessonIdx];
  const totalLessons = allLessons.length;
  const completedCount = completedLessons.size;
  const progress = enrolled?.progress || Math.round((completedCount / totalLessons) * 100);

  const toggleModule = (idx) => {
    setExpandedModules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const selectLesson = (mi, li) => {
    setCurrentModuleIdx(mi);
    setCurrentLessonIdx(li);
    if (!expandedModules.includes(mi)) {
      setExpandedModules((prev) => [...prev, mi]);
    }
    setSidebarOpen(false);
  };

  const toggleComplete = (mi, li) => {
    const key = `${mi}-${li}`;
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const goPrev = () => {
    if (currentFlatIdx > 0) {
      const prev = allLessons[currentFlatIdx - 1];
      selectLesson(prev.moduleIdx, prev.lessonIdx);
    }
  };

  const goNext = () => {
    if (currentFlatIdx < allLessons.length - 1) {
      const next = allLessons[currentFlatIdx + 1];
      selectLesson(next.moduleIdx, next.lessonIdx);
    }
  };

  return (
    <div className={styles.page}>
      {/* Curriculum Sidebar */}
      <aside
        className={`${styles.curriculumSidebar} ${
          sidebarOpen ? styles.curriculumSidebarOpen : ''
        }`}
      >
        <div className={styles.sidebarHeader}>
          <h2 className={styles.courseTitle}>{course.title}</h2>
          <p className={styles.progressInfo}>
            {completedCount}/{totalLessons} completed
          </p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className={styles.moduleList}>
          {syllabusList.map((module, mi) => (
            <div key={mi} className={styles.moduleItem}>
              <button
                className={styles.moduleHeader}
                onClick={() => toggleModule(mi)}
              >
                <span className={styles.moduleTitle}>{module.title}</span>
                <span
                  className={`${styles.moduleChevron} ${
                    expandedModules.includes(mi) ? styles.moduleChevronOpen : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              <div
                className={`${styles.lessonList} ${
                  expandedModules.includes(mi) ? styles.lessonListOpen : ''
                }`}
              >
                {module.lessons.map((lesson, li) => {
                  const isActive = mi === currentModuleIdx && li === currentLessonIdx;
                  const isDone = completedLessons.has(`${mi}-${li}`);

                  return (
                    <button
                      key={li}
                      className={`${styles.lessonItem} ${
                        isActive ? styles.lessonItemActive : ''
                      }`}
                      onClick={() => selectLesson(mi, li)}
                    >
                      <div
                        className={`${styles.lessonCheckbox} ${
                          isDone ? styles.lessonCheckboxDone : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(mi, li);
                        }}
                      >
                        {isDone && '✓'}
                      </div>
                      <div className={styles.lessonInfo}>
                        <div className={styles.lessonTitle}>{lesson.title}</div>
                      </div>
                      <span className={styles.lessonDuration}>{lesson.duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Video Player */}
        <div className={styles.videoSection}>
          <VideoPlayer
            src={currentLesson?.videoUrl || SAMPLE_VIDEO}
            title={currentLesson?.title || 'Select a lesson'}
            poster={course.thumbnailUrl}
          />
        </div>

        {/* Lesson Info */}
        <div className={styles.lessonContent}>
          <div className={styles.lessonHeader} style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 className={styles.currentLessonTitle} style={{ margin: 0 }}>
                {currentLesson?.title || 'Select a lesson'}
              </h2>
              {currentLesson?.isLive && (
                <a
                  href={currentLesson.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '0.4rem 1rem',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                    fontSize: '0.85rem',
                  }}
                >
                  🔴 Join Live Session
                </a>
              )}
            </div>
            <div className={styles.navButtons}>
              <button
                className={`${styles.navBtn} ${styles.prevBtn} ${
                  currentFlatIdx <= 0 ? styles.navBtnDisabled : ''
                }`}
                onClick={goPrev}
              >
                ← Previous
              </button>
              <button
                className={`${styles.navBtn} ${styles.nextBtn} ${
                  currentFlatIdx >= allLessons.length - 1 ? styles.navBtnDisabled : ''
                }`}
                onClick={goNext}
              >
                Next →
              </button>
            </div>
          </div>

          <p className={styles.lessonDescription}>
            This lesson covers {currentLesson?.title?.toLowerCase()} as part of the{' '}
            {syllabusList[currentModuleIdx]?.title} module. Duration:{' '}
            {currentLesson?.duration}.
          </p>

          {/* Content Tabs */}
          <div className={styles.contentTabs}>
            {['overview', 'resources', 'notes'].map((tab) => (
              <button
                key={tab}
                className={`${styles.contentTab} ${
                  activeTab === tab ? styles.contentTabActive : ''
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className={styles.tabContent}>
              <h3>Lesson Overview</h3>
              <p>
                In this lesson, you will learn about {currentLesson?.title}. This is
                part of the &quot;{syllabusList[currentModuleIdx]?.title}&quot; module in the{' '}
                {course.title} course.
              </p>
              <br />
              <p>
                <strong>Key Topics:</strong>
              </p>
              <ul>
                <li>Core concepts and fundamentals</li>
                <li>Hands-on implementation with examples</li>
                <li>Best practices and common pitfalls</li>
                <li>Practice exercises and challenges</li>
              </ul>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className={styles.tabContent}>
              <h3>Lesson Resources</h3>
              <div className={styles.resourceItem}>
                <span className={styles.resourceIcon}>📄</span>
                <div className={styles.resourceInfo}>
                  <div className={styles.resourceName}>Lesson Slides (PDF)</div>
                  <div className={styles.resourceSize}>2.4 MB</div>
                </div>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.resourceIcon}>💻</span>
                <div className={styles.resourceInfo}>
                  <div className={styles.resourceName}>Source Code (ZIP)</div>
                  <div className={styles.resourceSize}>1.1 MB</div>
                </div>
              </div>
              <div className={styles.resourceItem}>
                <span className={styles.resourceIcon}>📋</span>
                <div className={styles.resourceInfo}>
                  <div className={styles.resourceName}>Exercise Worksheet</div>
                  <div className={styles.resourceSize}>580 KB</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className={styles.tabContent}>
              <h3>Your Notes</h3>
              <textarea
                className={styles.notesArea}
                placeholder="Take notes for this lesson..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className={styles.notesHint}>
                Notes are saved locally in your browser.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile curriculum toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        📖
      </button>
    </div>
  );
}
