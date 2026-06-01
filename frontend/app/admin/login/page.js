'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setGeneralToken, setGeneralUser } from '@/lib/api';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password.trim()) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setApiError('');
      try {
        const res = await api.login({ email: form.email, password: form.password });
        if (res.data.user.role !== 'ADMIN' && res.data.user.role !== 'INSTRUCTOR') {
          setApiError('Access denied. Privileged access required.');
          return;
        }

        setGeneralToken(res.data.token);
        setGeneralUser(res.data.user);
        router.push('/admin/dashboard');
        router.refresh();
      } catch (err) {
        setApiError(err.message || 'Invalid credentials. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
    if (apiError) setApiError('');
  };

  return (
    <div className={styles.page}>
      {/* Background orbs */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      <div className={styles.card}>
        <div className={styles.iconWrapper}>⚡</div>

        <h1 className={styles.cardTitle}>Admin Panel</h1>
        <p className={styles.cardSubtitle}>Sign in with your admin credentials</p>

        {apiError && (
          <div className={styles.apiError}>{apiError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email Address</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>✉️</span>
              <input
                type="email"
                placeholder="admin@lms.com"
                className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
                value={form.email}
                onChange={handleChange('email')}
                disabled={loading}
                suppressHydrationWarning={true}
              />
            </div>
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`${styles.formInput} ${errors.password ? styles.formInputError : ''}`}
                value={form.password}
                onChange={handleChange('password')}
                disabled={loading}
                suppressHydrationWarning={true}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                suppressHydrationWarning={true}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading} suppressHydrationWarning={true}>
            {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>
          ← Back to Website
        </Link>
      </div>
    </div>
  );
}
