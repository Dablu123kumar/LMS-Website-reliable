'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, getGeneralUser } from '@/lib/api';
import styles from './page.module.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalCategories: 0,
    totalEnrollments: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [myCourseIds, setMyCourseIds] = useState([]);

  useEffect(() => {
    const currentUser = getGeneralUser();
    setUser(currentUser);

    async function loadDashboard() {
      try {
        const [coursesRes, categoriesRes, studentsRes] = await Promise.all([
          api.adminGetCourses(),
          api.getCategories(),
          api.adminGetStudents(1, 100), // Larger page size to filter on client
        ]);

        const courses = coursesRes?.data || [];
        const categories = categoriesRes?.data || [];
        const studentsData = studentsRes?.data || [];

        if (currentUser && currentUser.role === 'INSTRUCTOR') {
          const instructorName = `${currentUser.firstName} ${currentUser.lastName}`.toLowerCase();
          const myCourses = courses.filter(
            (c) => c.instructorName?.toLowerCase() === instructorName
          );
          const ids = myCourses.map((c) => c.id);
          setMyCourseIds(ids);

          const myStudents = studentsData.filter((s) =>
            s.enrollments?.some((e) => ids.includes(e.courseId))
          );

          const totalEnrollments = myStudents.reduce((sum, s) => {
            const myEnrs = s.enrollments?.filter((e) => ids.includes(e.courseId)) || [];
            return sum + myEnrs.length;
          }, 0);

          const myCategoryIds = [...new Set(myCourses.map((c) => c.categoryId))];
          const myCategories = categories.filter((cat) => myCategoryIds.includes(cat.id));

          setStats({
            totalCourses: myCourses.length,
            totalStudents: myStudents.length,
            totalCategories: myCategories.length,
            totalEnrollments,
          });

          setRecentStudents(myStudents.slice(0, 5));
        } else {
          // Admin View
          const totalStudents = studentsRes?.pagination?.total || studentsData.length;
          const totalEnrollments = studentsData.reduce(
            (sum, s) => sum + (s._count?.enrollments || 0), 0
          );

          setStats({
            totalCourses: courses.length,
            totalStudents,
            totalCategories: categories.length,
            totalEnrollments,
          });

          setRecentStudents(studentsData.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading dashboard...</div>
      </div>
    );
  }

  const isInstructor = user?.role === 'INSTRUCTOR';

  const statCards = [
    { icon: '📚', label: isInstructor ? 'My Courses' : 'Total Courses', value: stats.totalCourses, color: 'blue', href: '/admin/courses' },
    { icon: '👥', label: isInstructor ? 'My Students' : 'Total Students', value: stats.totalStudents, color: 'green', href: '/admin/students' },
    ...(!isInstructor
      ? [{ icon: '📂', label: 'Categories', value: stats.totalCategories, color: 'purple', href: '/admin/courses' }]
      : []),
    { icon: '🎓', label: 'Enrollments', value: stats.totalEnrollments, color: 'amber', href: '/admin/students' },
  ];

  const quickActions = [
    ...(!isInstructor ? [{ icon: '➕', label: 'Add Course', href: '/admin/courses', color: 'blue' }] : []),
    { icon: '📡', label: 'Schedule Live Class', href: '/admin/live-classes', color: 'rose' },
    { icon: '👥', label: 'View Students', href: '/admin/students', color: 'green' },
  ];

  return (
    <div className={styles.page}>
      {/* Welcome Card */}
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeContent}>
          <h2 className={styles.welcomeTitle}>
            Welcome back, {isInstructor ? `${user?.firstName} (Instructor)` : 'Admin'}! 👋
          </h2>
          <p className={styles.welcomeSubtitle}>
            Here&apos;s an overview of your LMS {isInstructor ? 'courses and students' : 'platform'}.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className={`${styles.statCard} ${styles[`statCard_${stat.color}`]}`}>
            <span className={styles.statIcon}>{stat.icon}</span>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
      </div>
      <div className={styles.actionsGrid}>
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href} className={`${styles.actionCard} ${styles[`actionCard_${action.color}`]}`}>
            <span className={styles.actionIcon}>{action.icon}</span>
            <span className={styles.actionLabel}>{action.label}</span>
            <span className={styles.actionArrow}>→</span>
          </Link>
        ))}
      </div>

      {/* Recent Students */}
      {recentStudents.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              {isInstructor ? 'Recent Students in My Courses' : 'Recent Students'}
            </h3>
            <Link href="/admin/students" className={styles.viewAllLink}>View All →</Link>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Enrollments</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => (
                  <tr key={student.id}>
                    <td className={styles.studentName}>
                      <div className={styles.studentAvatar}>
                        {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                      </div>
                      {student.firstName} {student.lastName}
                    </td>
                    <td className={styles.studentEmail}>{student.email}</td>
                    <td>
                      <span className={styles.enrollBadge}>
                        {isInstructor ? (
                          student.enrollments?.filter((e) => myCourseIds.includes(e.courseId)).length
                        ) : (
                          student._count?.enrollments || 0
                        )}{' '}
                        courses
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
