'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getGeneralUser, setGeneralToken, setGeneralUser, api } from '@/lib/api';
import styles from './layout.module.css';

const navItems = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/courses', icon: '📚', label: 'Courses' },
  { href: '/admin/categories', icon: '🏷️', label: 'Categories' },
  { href: '/admin/students', icon: '👥', label: 'Students' },
  { href: '/admin/live-classes', icon: '📡', label: 'Live Classes' },
];

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/courses': 'Course Management',
  '/admin/categories': 'Category Management',
  '/admin/students': 'Student Management',
  '/admin/live-classes': 'Live Classes',
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('admin_sidebar_collapsed') === 'true';
      setSidebarCollapsed(val);
    }
  }, []);

  const toggleSidebarCollapse = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_sidebar_collapsed', String(nextState));
    }
  };

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
      toggleSidebarCollapse();
    }
  };


  useEffect(() => {
    // Don't guard the login page
    if (pathname === '/admin/login') {
      setAuthChecked(true);
      return;
    }

    const storedUser = getGeneralUser();

    if (!storedUser || (storedUser.role !== 'ADMIN' && storedUser.role !== 'INSTRUCTOR')) {
      router.push('/admin/login');
      return;
    }

    setUser(storedUser);
    setAuthChecked(true);
  }, [pathname, router]);

  // Don't render layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Don't render until auth is checked
  if (!authChecked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-muted)' }}>Checking permissions...</div>
      </div>
    );
  }

  const getPageTitle = () => pageTitles[pathname] || 'Admin Panel';
  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Failed to log out admin/instructor on server:', err);
    }
    setGeneralToken(null);
    setGeneralUser(null);
    router.push('/admin/login');
  };

  const getInitials = () => {
    if (!user) return 'AD';
    return `${(user.firstName || 'A').charAt(0)}${(user.lastName || 'D').charAt(0)}`.toUpperCase();
  };

  return (
    <div className={`${styles.layoutWrapper} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <button 
          className={styles.toggleCollapseBtn} 
          onClick={toggleSidebarCollapse}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? '›' : '‹'}
        </button>

        <Link href="/admin/dashboard" className={styles.sidebarLogo} onClick={closeSidebar}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>LearnHub</span>
          <span className={styles.adminBadge}>{user?.role || 'ADMIN'}</span>
        </Link>


        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={closeSidebar}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backLink} onClick={closeSidebar} title={sidebarCollapsed ? "View Website" : undefined}>
            <span className={styles.navIcon}>🌐</span>
            <span>View Website</span>
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout} title={sidebarCollapsed ? "Logout" : undefined}>
            <span className={styles.navIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} />
      )}

      {/* Main */}
      <div className={styles.mainArea}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              className={styles.hamburger}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
          </div>

          <div className={styles.topBarRight}>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>{user?.firstName || 'Admin'}</span>
              <span className={styles.adminRole}>Administrator</span>
            </div>
            <div className={styles.userAvatar}>
              {getInitials()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
