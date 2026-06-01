'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setGeneralToken, setGeneralUser } from '@/lib/api';
import styles from './page.module.css';

export default function LoginPage() {
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
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
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
        setGeneralToken(res.data.token);
        setGeneralUser(res.data.user);
        router.push('/courses');
        router.refresh();
      } catch (err) {
        setApiError(err.message || 'Failed to login. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className={styles.page}>
      {/* Left Side — Form */}
      <div className={styles.leftSide}>
        <div className={styles.formWrapper}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>L</span>
            <span className={styles.logoText}>LearnHub</span>
          </Link>

          <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Welcome Back</h1>
            <p className={styles.formSubtitle}>Login to browse and purchase courses</p>

            {apiError && <div className={styles.apiError} style={{color: '#f43f5e', marginBottom: '1rem', textAlign: 'center'}}>{apiError}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>✉️</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
                    value={form.email}
                    onChange={handleChange('email')}
                    disabled={loading}
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

              <div className={styles.formRow}>
                <label className={styles.checkbox}>
                  <input type="checkbox" disabled={loading} /> Remember me
                </label>
                <Link href="#" className={styles.forgotLink}>
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className={styles.switchText}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className={styles.switchLink}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side — Decorative */}
      <div className={styles.rightSide}>
        <div className={styles.decorCircle1} />
        <div className={styles.decorCircle2} />
        <div className={styles.decorCircle3} />
        <div className={styles.decorCircle4} />

        <div className={styles.rightContent}>
          <h2 className={styles.rightTitle}>Start Learning Today</h2>
          <p className={styles.rightSubtitle}>
            Join thousands of students building their careers with expert-led courses.
          </p>

          <div className={styles.sellingPoints}>
            <div className={styles.sellingPoint}>
              <div className={styles.spIcon}>📚</div>
              <div className={styles.spText}>
                <h4>Access 50+ Courses</h4>
                <p>Curated content from industry experts</p>
              </div>
            </div>
            <div className={styles.sellingPoint}>
              <div className={styles.spIcon}>📡</div>
              <div className={styles.spText}>
                <h4>Live Interactive Classes</h4>
                <p>Real-time Q&A with instructors</p>
              </div>
            </div>
            <div className={styles.sellingPoint}>
              <div className={styles.spIcon}>🏆</div>
              <div className={styles.spText}>
                <h4>Expert Instructors</h4>
                <p>Learn from top industry professionals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
