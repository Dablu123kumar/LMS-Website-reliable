'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './layout.module.css';

const navItems = [
  { href: '/lms/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/lms/courses', icon: '📚', label: 'My Courses' },
  { href: '/lms/notifications', icon: '🔔', label: 'Notifications', badge: 2 },
  { href: '/lms/profile', icon: '👤', label: 'Profile' },
];

const pageTitles = {
  '/lms/dashboard': 'Dashboard',
  '/lms/courses': 'My Courses',
  '/lms/notifications': 'Notifications',
  '/lms/profile': 'Profile',
};

import { useRouter } from 'next/navigation';
import { api, getLmsUser, setLmsToken, setLmsUser } from '@/lib/api';

export default function LmsLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('lms_sidebar_collapsed') === 'true';
      setSidebarCollapsed(val);
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(activeTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', nextTheme === 'light' ? '#f8fafc' : '#0a0e27');
    }
  };

  const toggleSidebarCollapse = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_sidebar_collapsed', String(nextState));
    }
  };

  useEffect(() => {
    // Check if lms user is logged in
    const lmsUser = getLmsUser();
    setUser(lmsUser);
  }, [pathname]);

  // Don't render layout for LMS login page
  if (pathname === '/lms/login') {
    return <>{children}</>;
  }

  const getPageTitle = () => {
    if (pathname.startsWith('/lms/courses/') && pathname !== '/lms/courses') {
      return 'Course Content';
    }
    return pageTitles[pathname] || 'Dashboard';
  };

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await api.lmsLogout();
    } catch (err) {
      console.error('Failed to log out LMS user on server:', err);
    }
    setLmsToken(null);
    setLmsUser(null);
    router.push('/lms/login');
  };

  const getInitials = () => {
    if (!user) return 'ST';
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.firstName) return user.firstName.slice(0, 2).toUpperCase();
    if (user.lmsUsername) return user.lmsUsername.slice(0, 2).toUpperCase();
    return 'ST';
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

        <Link href="/lms/dashboard" className={styles.sidebarLogo} onClick={closeSidebar}>
          <span className={styles.logoIcon}>L</span>
          <span className={styles.logoText}>LearnHub</span>
          <span className={styles.lmsBadge}>LMS</span>
        </Link>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/lms/courses' && pathname.startsWith('/lms/courses/'));

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
                {item.badge && !sidebarCollapsed && (
                  <span className={styles.navBadge}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : undefined}
          >
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
            <button
              onClick={toggleTheme}
              className={styles.themeToggleBtn}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link href="/lms/notifications" className={styles.notifBtn}>
              🔔
              <span className={styles.notifDot} />
            </Link>
            <Link href="/lms/profile" className={styles.userAvatar}>
              {getInitials()}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
