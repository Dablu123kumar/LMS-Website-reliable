'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
    role: '',
    createdAt: '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getMe();
        if (res?.data) {
          const u = res.data || {};
          setProfile({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            phone: u.phone || '',
            email: u.email || '',
            role: u.role || 'USER',
            createdAt: u.createdAt || new Date().toISOString(),
          });
        } else {
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

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
      const res = await api.updateGeneralProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
      
      // Update local storage user
      if (typeof window !== 'undefined') {
        const localUser = localStorage.getItem('general_user');
        if (localUser) {
          const parsed = JSON.parse(localUser);
          parsed.firstName = profile.firstName;
          parsed.lastName = profile.lastName;
          localStorage.setItem('general_user', JSON.stringify(parsed));
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
      await api.updateGeneralPassword({
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

  if (loading) {
    return (
      <div className={styles.mainWrapper}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>Loading profile details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const memberDate = new Date(profile.createdAt).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const initials = `${profile.firstName ? profile.firstName[0] : ''}${profile.lastName ? profile.lastName[0] : ''}`.toUpperCase() || 'U';

  return (
    <div className={styles.mainWrapper}>
      <Navbar />

      <main className="container" style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: '80px', minHeight: '80vh' }}>
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
                  👤 Account: {profile.role}
                </span>
              </div>
            </div>
          </div>

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
          ) : (
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
