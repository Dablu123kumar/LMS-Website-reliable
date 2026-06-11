'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { userProfile as mockProfile, enrolledCourses as mockEnrolledCourses } from '@/lib/data';
import styles from './page.module.css';


export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    lmsUsername: '',
    memberSince: '',
    role: '',
  });


  const [enrollments, setEnrollments] = useState([]);

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getProfile();
        if (res?.data) {
          const u = res.data.user || {};
          setProfile({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            phone: u.phone || '',
            email: u.email || '',
            lmsUsername: res.data.lmsUsername || '',
            memberSince: res.data.createdAt || new Date().toISOString(),
            role: u.role || 'USER',
          });
          setEnrollments(res.data.enrollments || []);
        }
      } catch (err) {
        console.error('Failed to load profile from API, using mock data:', err);
        setProfile({
          firstName: mockProfile.firstName,
          lastName: mockProfile.lastName,
          phone: mockProfile.phone,
          email: mockProfile.email,
          lmsUsername: mockProfile.lmsUsername,
          memberSince: mockProfile.memberSince,
          role: mockProfile.role || 'USER',
        });
        setEnrollments(mockEnrolledCourses.map((c) => ({
          courseId: c.id,
          courseTitle: c.title,
          courseSlug: c.slug || '',
          progressPercent: c.progress,
          enrolledAt: c.lastAccessed || new Date().toISOString(),
        })));
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => {
      setStatus({ type: '', message: '' });
    }, 5000);
  };

  const handleProfileChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswords({ ...passwords, [field]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      showStatus('error', 'First name and last name are required.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      
      // Update local storage user if needed
      if (typeof window !== 'undefined') {
        const localUser = localStorage.getItem('lms_user');
        if (localUser) {
          const parsed = JSON.parse(localUser);
          parsed.firstName = profile.firstName;
          parsed.lastName = profile.lastName;
          localStorage.setItem('lms_user', JSON.stringify(parsed));
          
          // Trigger a layout re-render for avatar/nav initials
          window.dispatchEvent(new Event('storage'));
        }
      }

      showStatus('success', 'Profile updated successfully.');
    } catch (err) {
      console.error(err);
      showStatus('error', err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showStatus('error', 'Please fill in all password fields.');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showStatus('error', 'New passwords do not match.');
      return;
    }
    if (passwords.newPass.length < 6) {
      showStatus('error', 'New password must be at least 6 characters.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPasswords({ current: '', newPass: '', confirm: '' });
      showStatus('success', 'Password updated successfully.');
    } catch (err) {
      console.error(err);
      showStatus('error', err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    const doubleCheck = confirm(
      '⚠️ WARNING: Are you absolutely sure you want to deactivate your LMS account? ' +
      'You will lose access to all your enrolled courses, records, and certificates immediately. ' +
      'This action cannot be undone.'
    );
    if (!doubleCheck) return;

    try {
      await api.deactivateAccount();
      
      // Clear tokens and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
      }
      
      alert('Your LMS account has been deactivated successfully.');
      router.push('/lms/login');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to deactivate account.');
    }
  };

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading student profile...</div>
      </div>
    );
  }

  const memberDate = new Date(profile.memberSince).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const initials = `${profile.firstName ? profile.firstName[0] : ''}${profile.lastName ? profile.lastName[0] : ''}`.toUpperCase() || 'S';

  return (
    <div className={styles.page}>
      {status.message && (
        <div className={`${styles.toast} ${status.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
          {status.type === 'error' ? '❌' : '✅'} {status.message}
        </div>
      )}

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarCircle}>{initials}</div>
        <div className={styles.profileInfo}>
          <h1>{profile.firstName} {profile.lastName}</h1>
          <p className={styles.profileEmail}>{profile.email}</p>
          <div className={styles.profileMeta}>
            <span className={styles.memberSince}>
              📅 Member since {memberDate}
            </span>
            <span className={styles.usernameBadge}>
              👤 LMS: {profile.lmsUsername}
            </span>
          </div>
        </div>
      </div>

      {/* Admin/Instructor Dashboard Access */}
      {(profile.role === 'ADMIN' || profile.role === 'INSTRUCTOR') && (
        <div className={styles.dashboardCard}>
          <div className={styles.dashboardCardContent}>
            <h3>{profile.role === 'ADMIN' ? '⚡ Administrator' : '🎓 Course Instructor'}</h3>
            <p>You have privileged access to the LearnHub administration console.</p>
          </div>
          <Link href="/admin/dashboard" className={styles.dashboardLink}>
            {profile.role === 'ADMIN' ? 'Go to Admin Dashboard →' : 'Go to Instructor Dashboard →'}
          </Link>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile Details
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security & Password
        </button>
      </div>

      {activeTab === 'profile' ? (
        <>
          {/* Edit Profile */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>✏️ Edit Profile</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={profile.firstName}
                  onChange={handleProfileChange('firstName')}
                  placeholder="First Name"
                  disabled={savingProfile}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={profile.lastName}
                  onChange={handleProfileChange('lastName')}
                  placeholder="Last Name"
                  disabled={savingProfile}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={profile.phone}
                  onChange={handleProfileChange('phone')}
                  placeholder="Phone Number"
                  disabled={savingProfile}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={profile.email}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <button 
              className={styles.saveBtn} 
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>

          {/* Enrollment History */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>📚 Enrollment History</h2>
            <div className={styles.tableWrapper}>
              {enrollments.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Enrolled Date</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((course) => (
                      <tr key={course.courseId}>
                        <td style={{ fontWeight: 600 }}>{course.courseTitle}</td>
                        <td>
                          {new Date(course.enrolledAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td>
                          <div className={styles.progressCell}>
                            <div className={styles.progressBarSmall}>
                              <div
                                className={styles.progressFillSmall}
                                style={{ width: `${course.progressPercent}%` }}
                              />
                            </div>
                            <span className={styles.progressText}>
                              {course.progressPercent}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusCell} ${
                              course.progressPercent >= 100
                                ? styles.statusCompleted
                                : styles.statusInProgress
                            }`}
                          >
                            {course.progressPercent >= 100 ? '✅ Completed' : '🔄 In Progress'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No enrollment history found.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Change Password */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>🔒 Change Password</h2>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Current Password</label>
                <input
                  type="password"
                  className={styles.formInput}
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChange={handlePasswordChange('current')}
                  disabled={updatingPassword}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Password</label>
                <input
                  type="password"
                  className={styles.formInput}
                  placeholder="Enter new password"
                  value={passwords.newPass}
                  onChange={handlePasswordChange('newPass')}
                  disabled={updatingPassword}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm New Password</label>
                <input
                  type="password"
                  className={styles.formInput}
                  placeholder="Confirm new password"
                  value={passwords.confirm}
                  onChange={handlePasswordChange('confirm')}
                  disabled={updatingPassword}
                />
              </div>
            </div>
            <button 
              className={styles.saveBtn} 
              onClick={handleUpdatePassword}
              disabled={updatingPassword}
            >
              {updatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>

          {/* Danger Zone */}
          <div className={styles.dangerCard}>
            <h2 className={styles.dangerTitle}>⚠️ Danger Zone</h2>
            <p className={styles.dangerText}>
              Once you deactivate your account, all your progress, certificates, and enrolled
              courses will be permanently deleted. This action cannot be undone.
            </p>
            <button
              className={styles.dangerBtn}
              onClick={handleDeactivate}
            >
              Deactivate Account
            </button>
          </div>
        </>
      )}
    </div>
  );
}
