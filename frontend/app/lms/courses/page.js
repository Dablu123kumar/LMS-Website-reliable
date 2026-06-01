'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { enrolledCourses as mockCourses, categories as mockCategories } from '@/lib/data';
import styles from './page.module.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await api.getMyCourses();
        if (res?.data && Array.isArray(res.data)) {
          const mapped = res.data.map((e) => ({
            id: e.course.id,
            title: e.course.title,
            thumbnailUrl: e.course.thumbnailUrl || '/thumbnails/default.jpg',
            category: e.course.category?.slug || 'web-development',
            categoryName: e.course.category?.name || 'Web Development',
            progress: e.progressPercent || 0,
            completedLessons: Math.round(((e.progressPercent || 0) / 100) * 12),
            totalLessons: 12,
            lastAccessed: e.enrolledAt,
            status: e.progressPercent >= 100 ? 'completed' : 'in-progress',
            instructorName: e.course.instructorName || 'Expert Instructor',
            durationHours: e.course.durationHours || 20,
          }));
          setCoursesList(mapped);
        }
      } catch (err) {
        console.error('API error, falling back to mock data:', err);
        setCoursesList(mockCourses);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = coursesList.filter((c) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in-progress') return c.status === 'in-progress';
    if (activeTab === 'completed') return c.status === 'completed';
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All', count: coursesList.length },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: coursesList.filter((c) => c.status === 'in-progress').length,
    },
    {
      id: 'completed',
      label: 'Completed',
      count: coursesList.filter((c) => c.status === 'completed').length,
    },
  ];

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading your courses...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Courses</h1>
        <p className={styles.pageSubtitle}>
          Track your progress and continue learning
        </p>
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className={styles.tabCount}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Course List */}
      {filteredCourses.length > 0 ? (
        <div className={styles.courseList}>
          {filteredCourses.map((course) => {
            const category = mockCategories.find((c) => c.id === course.category) || { icon: '📚', name: course.categoryName || course.category };
            const isCompleted = course.status === 'completed';

            return (
              <div key={course.id} className={styles.courseCard}>
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className={styles.courseThumb}
                />
                <div className={styles.courseInfo}>
                  <div className={styles.courseTop}>
                    {category && (
                      <span className={styles.categoryBadge}>
                        {category.icon} {category.name}
                      </span>
                    )}
                    <span
                      className={`${styles.statusBadge} ${
                        isCompleted ? styles.statusCompleted : styles.statusInProgress
                      }`}
                    >
                      {isCompleted ? '✅ Completed' : '🔄 In Progress'}
                    </span>
                  </div>

                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <p className={styles.courseInstructor}>
                    by {course.instructorName}
                  </p>

                  <div className={styles.progressWrapper}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressPercent}>
                        {course.progress}% complete
                      </span>
                      <span className={styles.progressLessons}>
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${
                          isCompleted ? styles.progressFillComplete : ''
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.courseBottom}>
                    <div className={styles.courseMeta}>
                      <span>🕐 Last accessed: {timeAgo(course.lastAccessed)}</span>
                      <span>⏱️ {course.durationHours}h total</span>
                    </div>
                    <Link
                      href={`/lms/courses/${course.id}`}
                      className={`${styles.continueBtn} ${
                        isCompleted ? styles.reviewBtn : ''
                      }`}
                    >
                      {isCompleted ? 'Review Course' : 'Continue Learning'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <h3 className={styles.emptyTitle}>No courses found</h3>
          <p className={styles.emptyText}>
            No courses match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}
