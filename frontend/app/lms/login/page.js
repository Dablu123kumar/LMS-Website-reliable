'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setLmsToken, setLmsUser } from '@/lib/api';
import styles from './page.module.css';

export default function LmsLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
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
        const res = await api.lmsLogin({
          lmsUsername: form.username,
          lmsPassword: form.password,
        });
        setLmsToken(res.data.token);
        setLmsUser(res.data.user);
        router.push('/lms/dashboard');
        router.refresh();
      } catch (err) {
        setApiError(err.message || 'Invalid username or password.');
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
        <div className={styles.iconWrapper}>🎓</div>

        <h1 className={styles.cardTitle}>LMS Dashboard Login</h1>
        <p className={styles.cardSubtitle}>Access your learning dashboard</p>

        <div className={styles.infoBanner}>
          <span className={styles.infoBannerIcon}>🔑</span>
          <span className={styles.infoBannerText}>
            Use the credentials sent to your email after purchasing a course.
            Check your inbox (and spam folder) for your login details.
          </span>
        </div>

        {apiError && <div className={styles.apiError} style={{color: '#f43f5e', marginBottom: '1rem', textAlign: 'center'}}>{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Username</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>👤</span>
              <input
                type="text"
                placeholder="Enter your LMS username"
                className={`${styles.formInput} ${errors.username ? styles.formInputError : ''}`}
                value={form.username}
                onChange={handleChange('username')}
                disabled={loading}
              />
            </div>
            {errors.username && <span className={styles.errorMsg}>{errors.username}</span>}
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
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Accessing Dashboard...' : 'Access Dashboard'}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>
          ← Back to Website
        </Link>

        <hr className={styles.divider} />

        <p className={styles.supportText}>
          Forgot your credentials?{' '}
          <Link href="#" className={styles.supportLink}>
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
