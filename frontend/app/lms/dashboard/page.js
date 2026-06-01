'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { enrolledCourses as mockEnrolledCourses, upcomingLiveClasses as mockLiveClasses, notifications as mockNotifications } from '@/lib/data';
import styles from './page.module.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getCountdown(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Starting now!';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  return parts.join(' ') + ' remaining';
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const notifIcons = {
  'live-class': '📡',
  'course-update': '📢',
  'achievement': '🏆',
  'reminder': '⏰',
  'system': '⚙️',
};

export default function DashboardPage() {
  const [user, setUser] = useState({ firstName: 'Student' });
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    averageProgress: 0,
    unreadNotifications: 0,
  });
  const [coursesList, setCoursesList] = useState([]);
  const [notifsList, setNotifsList] = useState([]);
  const [liveList, setLiveList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const meRes = await api.getLmsMe();
        if (meRes?.data) {
          setUser(meRes.data.user || { firstName: 'Student' });
          if (meRes.data.enrolledCourses) {
            const mapped = meRes.data.enrolledCourses.map((e) => ({
              id: e.course.id,
              title: e.course.title,
              thumbnailUrl: e.course.thumbnailUrl || '/thumbnails/default.jpg',
              progress: e.progressPercent || 0,
              completedLessons: Math.round(((e.progressPercent || 0) / 100) * 12),
              totalLessons: 12,
              lastAccessed: e.enrolledAt,
            }));
            setCoursesList(mapped);
          }
        }

        const statsRes = await api.getStats();
        if (statsRes?.data) {
          setStats(statsRes.data);
        }

        const notifRes = await api.getNotifications(1);
        if (notifRes?.data?.notifications) {
          const mappedNotifs = notifRes.data.notifications.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type === 'LIVE_REMINDER' || n.type === 'LIVE_STARTED' ? 'live-class' : 'course-update',
            time: n.sentAt,
            read: n.isRead,
          }));
          setNotifsList(mappedNotifs.slice(0, 4));
        }

        const coursesRes = await api.getMyCourses();
        if (coursesRes?.data && Array.isArray(coursesRes.data)) {
          if (coursesRes.data.length > 0) {
            const firstCourseId = coursesRes.data[0].course.id;
            const contentRes = await api.getCourseContent(firstCourseId);
            if (contentRes?.data?.liveClasses) {
              const mappedLive = contentRes.data.liveClasses.map((lc) => ({
                id: lc.id,
                title: lc.title,
                course: coursesRes.data[0].course.title,
                date: lc.scheduledAt,
                duration: '1 hour',
                instructor: coursesRes.data[0].course.instructorName || 'Instructor',
                meetingUrl: lc.meetingUrl,
                status: lc.status,
              }));
              setLiveList(mappedLive.slice(0, 2));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load LMS dashboard data from API, using mock data:', err);
        setUser({ firstName: 'Amit' });
        setStats({
          enrolledCourses: mockEnrolledCourses.length,
          completedCourses: mockEnrolledCourses.filter(c => c.progress === 100).length,
          averageProgress: 67,
          unreadNotifications: 2,
        });
        setCoursesList(mockEnrolledCourses);
        setNotifsList(mockNotifications.slice(0, 4));
        setLiveList(mockLiveClasses.slice(0, 2));
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Welcome Card */}
      <div className={styles.welcomeCard}>
        <h1 className={styles.welcomeTitle}>Welcome back, {user.firstName}! 👋</h1>
        <p className={styles.welcomeSubtitle}>Continue your learning journey</p>
        <p className={styles.welcomeDate}>{today}</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📚</span>
          <div className={`${styles.statValue} ${styles.statValueBlue}`}>{stats.enrolledCourses}</div>
          <div className={styles.statLabel}>Enrolled Courses</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✅</span>
          <div className={`${styles.statValue} ${styles.statValueGreen}`}>{stats.completedCourses}</div>
          <div className={styles.statLabel}>Completed</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🔄</span>
          <div className={`${styles.statValue} ${styles.statValueAmber}`}>{stats.enrolledCourses - stats.completedCourses}</div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🏆</span>
          <div className={`${styles.statValue} ${styles.statValuePurple}`}>{stats.averageProgress}%</div>
          <div className={styles.statLabel}>Avg Progress</div>
        </div>
      </div>

      {/* Upcoming Live Classes */}
      {liveList.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📡 Upcoming Live Classes</h2>
          </div>
          <div className={styles.liveGrid}>
            {liveList.map((cls) => {
              const isLive = cls.status === 'LIVE' || new Date(cls.date).getTime() - Date.now() < 0;
              const isToday =
                new Date(cls.date).toDateString() === new Date().toDateString();

              return (
                <div key={cls.id} className={styles.liveCard}>
                  <div className={styles.liveCardTop}>
                    <span
                      className={`${styles.liveBadge} ${
                        isLive || isToday ? styles.liveBadgeRed : styles.liveBadgeYellow
                      }`}
                    >
                      <span className={styles.livePulse} />
                      {isLive ? 'LIVE NOW' : isToday ? 'TODAY' : 'UPCOMING'}
                    </span>
                    <span className={styles.liveDuration}>{cls.duration}</span>
                  </div>
                  <h3 className={styles.liveTitle}>{cls.title}</h3>
                  <p className={styles.liveCourse}>{cls.course}</p>
                  <p className={styles.liveDateTime}>📅 {formatDate(cls.date)}</p>
                  <p className={styles.liveCountdown}>⏱️ {getCountdown(cls.date)}</p>
                  <div className={styles.liveBottom}>
                    <span className={styles.liveInstructor}>
                      👨‍🏫 {cls.instructor}
                    </span>
                    {isLive ? (
                      <a
                        href={cls.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.joinBtn} ${styles.joinBtnActive}`}
                        style={{ textDecoration: 'none', textAlign: 'center' }}
                      >
                        Join Class
                      </a>
                    ) : (
                      <button className={`${styles.joinBtn} ${styles.joinBtnDisabled}`} disabled>
                        Not Started
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Continue Learning */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>📖 Continue Learning</h2>
        <Link href="/lms/courses" className={styles.viewAllLink}>
          View All →
        </Link>
      </div>
      <div className={styles.continueGrid}>
        {coursesList.length > 0 ? (
          coursesList.slice(0, 2).map((course) => (
            <div key={course.id} className={styles.continueCard}>
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className={styles.continueThumb}
              />
              <div className={styles.continueInfo}>
                <h3 className={styles.continueTitle}>{course.title}</h3>

                <div className={styles.progressWrapper}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressPercent}>{course.progress}%</span>
                    <span className={styles.progressLessons}>
                      {course.completedLessons}/{course.totalLessons} lessons
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className={styles.continueBottom}>
                  <span className={styles.lastAccessed}>
                    {timeAgo(course.lastAccessed)}
                  </span>
                  <Link href={`/lms/courses/${course.id}`} className={styles.continueBtn}>
                    {course.progress === 100 ? 'Review' : 'Continue'}
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: 'span 2', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>You are not enrolled in any courses yet.</p>
            <Link href="/courses" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500', marginTop: '0.5rem', display: 'inline-block' }}>
              Browse Catalog →
            </Link>
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      {notifsList.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🔔 Recent Notifications</h2>
            <Link href="/lms/notifications" className={styles.viewAllLink}>
              View All →
            </Link>
          </div>
          <div className={styles.notifList}>
            {notifsList.map((notif) => (
              <div key={notif.id} className={styles.notifItem}>
                <span className={styles.notifIcon}>
                  {notifIcons[notif.type] || '📌'}
                </span>
                <div className={styles.notifContent}>
                  <div className={styles.notifTitle}>{notif.title}</div>
                  <div className={styles.notifMessage}>{notif.message}</div>
                </div>
                <div className={styles.notifMeta}>
                  <span className={styles.notifTime}>{timeAgo(notif.time)}</span>
                  {!notif.read && <span className={styles.unreadDot} />}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
