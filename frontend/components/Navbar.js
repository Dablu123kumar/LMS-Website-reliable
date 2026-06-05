'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getGeneralUser, setGeneralUser, setGeneralToken, getLmsUser, setLmsUser, setLmsToken, api } from '@/lib/api';
import styles from './Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setUser(getGeneralUser() || getLmsUser());
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);

    // Sync theme state with the html attribute set by the head blocking script
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(activeTheme);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(`.${styles.profileMenuContainer}`)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [profileOpen]);

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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Failed to log out on server:', err);
    }
    try {
      await api.lmsLogout();
    } catch (err) {
      console.error('Failed to log out of LMS on server:', err);
    }
    setGeneralToken(null);
    setGeneralUser(null);
    setLmsToken(null);
    setLmsUser(null);
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/courses?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>
            Learn<span className={styles.logoAccent}>Hub</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Home</Link>
          
          <div className={styles.dropdownParent}>
            <Link href="/courses" className={`${styles.navLink} ${styles.hasDropdown}`}>
              Courses <span className={styles.caret}>▾</span>
            </Link>
            
            <div className={styles.megaDropdown} suppressHydrationWarning>
              <div className={styles.dropdownInner}>
                {/* Designing Column */}
                <div className={styles.dropdownCol}>
                  <h4>Designing</h4>
                  <Link href="/courses?category=ui-ux-design" className={styles.dropdownSubLink}>Web Designing</Link>
                  <Link href="/courses?category=ui-ux-design" className={styles.dropdownSubLink}>UI UX Designing</Link>
                  <Link href="/courses?category=ui-ux-design" className={styles.dropdownSubLink}>Graphic Designing</Link>
                </div>
                
                {/* Marketing Column */}
                <div className={styles.dropdownCol}>
                  <h4>Marketing</h4>
                  <Link href="/courses?category=data-science" className={styles.dropdownSubLink}>Digital Marketing</Link>
                  <Link href="/courses?category=data-science" className={styles.dropdownSubLink}>SEO</Link>
                  <Link href="/courses?category=data-science" className={styles.dropdownSubLink}>SMM</Link>
                  <Link href="/courses?category=data-science" className={styles.dropdownSubLink}>Google Ads</Link>
                  <Link href="/courses?category=data-science" className={styles.dropdownSubLink}>Meta Ads</Link>
                  <Link href="/courses?category=data-science" className={styles.dropdownSubLink}>YouTube Marketing</Link>
                  <Link href="/courses?category=data-science" className={styles.dropdownSubLink}>Dropshipping</Link>
                </div>

                {/* Development Column */}
                <div className={styles.dropdownCol}>
                  <h4>Development</h4>
                  <Link href="/courses?category=ai-ml" className={styles.dropdownSubLink}>AI Agents and Automation</Link>
                  <Link href="/courses?category=web-development" className={styles.dropdownSubLink}>Full Stack Development</Link>
                  <Link href="/courses?category=web-development" className={styles.dropdownSubLink}>Front End Development</Link>
                  <Link href="/courses?category=data-science" className={styles.dropdownSubLink}>Data Science with Python</Link>
                  <Link href="/courses?category=ai-ml" className={styles.dropdownSubLink}>Artificial Intelligence with Python</Link>
                  <Link href="/courses?category=ai-ml" className={styles.dropdownSubLink}>Machine Learning with Python</Link>
                  <Link href="/courses?category=ai-ml" className={styles.dropdownSubLink}>Generative AI with Python</Link>
                  <Link href="/courses?category=web-development" className={styles.dropdownSubLink}>Python and Django Web Development</Link>
                </div>

                {/* Promo Column */}
                <div className={styles.promoCol}>
                  <Link href="/courses?category=ui-ux-design" className={styles.promoCard}>
                    <span className={styles.promoLabel}>Start Your Career</span>
                    <h5>Become a UI/UX Designer</h5>
                    <p>Practical training in modern app & website design.</p>
                  </Link>
                  <Link href="/courses?category=data-science" className={styles.promoCard}>
                    <span className={styles.promoLabel}>From Scrolling to Strategizing</span>
                    <h5>Digital Marketing</h5>
                    <p>Learn SEO, SMM, Meta Ads & Google Ads campaigns.</p>
                  </Link>
                  <Link href="/courses" className={styles.seeAllBtn}>
                    See All Courses ➔
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.dropdownParent}>
            <Link href="/#categories" className={`${styles.navLink} ${styles.hasDropdown}`}>
              Categories <span className={styles.caret}>▾</span>
            </Link>
            
            <div className={styles.megaDropdown} suppressHydrationWarning>
              <div className={styles.dropdownInner}>
                {/* Column 1 */}
                <div className={styles.dropdownCol}>
                  <h4>Web & Mobile</h4>
                  <Link href="/courses?category=web-development" className={styles.dropdownSubLink}>Web Development</Link>
                  <Link href="/courses?category=mobile-development" className={styles.dropdownSubLink}>Mobile Development</Link>
                </div>
                
                {/* Column 2 */}
                <div className={styles.dropdownCol}>
                  <h4>Data & Intelligence</h4>
                  <Link href="/courses?category=data-science" className={styles.dropdownSubLink}>Data Science</Link>
                  <Link href="/courses?category=ai-ml" className={styles.dropdownSubLink}>AI & Machine Learning</Link>
                </div>

                {/* Column 3 */}
                <div className={styles.dropdownCol}>
                  <h4>Design & Infrastructure</h4>
                  <Link href="/courses?category=ui-ux-design" className={styles.dropdownSubLink}>UI/UX Design</Link>
                  <Link href="/courses?category=cloud-devops" className={styles.dropdownSubLink}>Cloud & DevOps</Link>
                </div>

                {/* Promo Column */}
                <div className={styles.promoCol}>
                  <Link href="/courses?category=ai-ml" className={styles.promoCard}>
                    <span className={styles.promoLabel}>Featured Path</span>
                    <h5>Generative AI Track</h5>
                    <p>Build LLM agents, vector stores, and custom RAG chains.</p>
                  </Link>
                  <Link href="/courses?category=cloud-devops" className={styles.promoCard}>
                    <span className={styles.promoLabel}>In-Demand Skills</span>
                    <h5>Cloud & DevOps Engineer</h5>
                    <p>Master AWS deployment, Docker, and Kubernetes.</p>
                  </Link>
                  <Link href="/#categories" className={styles.seeAllBtn}>
                    Explore All Categories ➔
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className={styles.navSearch}>
          <form onSubmit={handleSearchSubmit} className={styles.navSearchForm}>
            <span className={styles.navSearchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.navSearchInput}
              suppressHydrationWarning
            />
          </form>
        </div>

        {/* Right side */}
        <div className={styles.navRight}>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.themeToggleBtn}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            suppressHydrationWarning
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Profile Menu Dropdown */}
          <div className={styles.profileMenuContainer}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={styles.profileAvatarBtn}
              aria-label="User Profile"
              title="Profile menu"
              suppressHydrationWarning
            >
              {user ? (
                <div className={styles.avatarCircleInitials} suppressHydrationWarning>
                  {user.firstName ? user.firstName[0].toUpperCase() : ''}
                  {user.lastName ? user.lastName[0].toUpperCase() : ''}
                </div>
              ) : (
                <div className={styles.avatarPlaceholder}>👤</div>
              )}
            </button>

            {profileOpen && (
              <div className={styles.profileDropdown} suppressHydrationWarning>
                {user && (
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownUserInitials}>
                      {user.firstName ? user.firstName[0].toUpperCase() : ''}
                      {user.lastName ? user.lastName[0].toUpperCase() : ''}
                    </div>
                    <div className={styles.dropdownUserInfo}>
                      <span className={styles.dropdownUserName}>{user.firstName} {user.lastName}</span>
                      <span className={styles.dropdownUserEmail}>{user.email}</span>
                    </div>
                  </div>
                )}
                <div className={styles.dropdownLinks}>
                  {user ? (
                    <>
                      <Link href="/lms/login" className={styles.dropdownLink} onClick={() => setProfileOpen(false)}>
                        🎓 LMS Dashboard
                      </Link>
                      <Link 
                        href={typeof window !== 'undefined' && !!localStorage.getItem('lms_user') ? "/lms/profile" : "/profile"} 
                        className={styles.dropdownLink} 
                        onClick={() => setProfileOpen(false)}
                      >
                        👤 My Profile
                      </Link>
                      <hr className={styles.dropdownDivider} />
                      <button onClick={() => { handleLogout(); setProfileOpen(false); }} className={styles.logoutBtn}>
                        🚪 Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className={styles.dropdownLink} onClick={() => setProfileOpen(false)}>
                        🔑 Log In
                      </Link>
                      <Link href="/auth/signup" className={styles.dropdownLink} onClick={() => setProfileOpen(false)}>
                        📝 Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuInner}>
          {/* Mobile Search Bar */}
          <div className={styles.mobileSearch}>
            <form onSubmit={handleSearchSubmit} className={styles.mobileSearchForm}>
              <span className={styles.mobileSearchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.mobileSearchInput}
                suppressHydrationWarning
              />
            </form>
          </div>
          <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/courses" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Courses</Link>
          <Link href="/#categories" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Categories</Link>
          <hr className="divider" />
          <button
            type="button"
            onClick={() => {
              toggleTheme();
              setMenuOpen(false);
            }}
            className={styles.mobileThemeToggle}
            suppressHydrationWarning
            style={{ marginBottom: '16px' }}
          >
            <span>Appearance</span>
            <span>{theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
          </button>

          {user ? (
            <>
              <div className={styles.mobileUserInfo} suppressHydrationWarning>
                <span className={styles.mobileWelcome}>Hi, {user.firstName}!</span>
                <span className={styles.mobileEmail}>{user.email}</span>
              </div>
              <Link 
                href={typeof window !== 'undefined' && !!localStorage.getItem('lms_user') ? "/lms/profile" : "/profile"} 
                className={styles.mobileLink} 
                onClick={() => setMenuOpen(false)}
              >
                👤 My Profile
              </Link>
              <Link href="/lms/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                🎓 LMS Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className={styles.mobileLogoutBtn}>
                🚪 Log Out
              </button>
            </>
          ) : (
            <div className={styles.mobileAuthBtns}>
              <Link href="/auth/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)} style={{ flex: 1 }}>
                Log In
              </Link>
              <Link href="/auth/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)} style={{ flex: 1 }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
