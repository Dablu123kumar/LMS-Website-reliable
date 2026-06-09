'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setGeneralToken, setGeneralUser } from '@/lib/api';
import styles from './page.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.terms) errs.terms = 'You must agree to the terms';
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
        const res = await api.signup({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        });
        setGeneralToken(res.data.token);
        setGeneralUser(res.data.user);
        router.push('/courses');
        router.refresh();
      } catch (err) {
        setApiError(err.message || 'Failed to sign up. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (field) => (e) => {
    const val = field === 'terms' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: val });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className={styles.page}>
      {/* Left Side — Form */}
      <div className={styles.leftSide}>
        <div className={styles.formWrapper}>
          <Link href="/" className={styles.logo}>
            <img src="/logo_dark.png" className={`${styles.logoImg} ${styles.logoLight}`} alt="LearnHub Logo" />
            <img src="/logo_light.png" className={`${styles.logoImg} ${styles.logoDark}`} alt="LearnHub Logo" />
          </Link>

          <div className={styles.formCard}>
             <h1 className={styles.formTitle}>Create Account</h1>
            <p className={styles.formSubtitle}>Start your learning journey today</p>

            {apiError && <div className={styles.apiError} style={{color: '#f43f5e', marginBottom: '1rem', textAlign: 'center'}}>{apiError}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>First Name</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>👤</span>
                    <input
                      type="text"
                      placeholder="First name"
                      className={`${styles.formInput} ${errors.firstName ? styles.formInputError : ''}`}
                      value={form.firstName}
                      onChange={handleChange('firstName')}
                      disabled={loading}
                    />
                  </div>
                  {errors.firstName && <span className={styles.errorMsg}>{errors.firstName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Last Name</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>👤</span>
                    <input
                      type="text"
                      placeholder="Last name"
                      className={`${styles.formInput} ${errors.lastName ? styles.formInputError : ''}`}
                      value={form.lastName}
                      onChange={handleChange('lastName')}
                      disabled={loading}
                    />
                  </div>
                  {errors.lastName && <span className={styles.errorMsg}>{errors.lastName}</span>}
                </div>
              </div>

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
                <label className={styles.formLabel}>Phone Number</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>📞</span>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
                    value={form.phone}
                    onChange={handleChange('phone')}
                    disabled={loading}
                  />
                </div>
                {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
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

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className={`${styles.formInput} ${errors.confirmPassword ? styles.formInputError : ''}`}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={loading}
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword}</span>}
              </div>

              <div className={styles.termsGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={handleChange('terms')}
                    disabled={loading}
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="#" className={styles.termsLink}>Terms of Service</Link>{' '}
                    &amp;{' '}
                    <Link href="#" className={styles.termsLink}>Privacy Policy</Link>
                  </span>
                </label>
                {errors.terms && <span className={styles.errorMsg}>{errors.terms}</span>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className={styles.switchText}>
              Already have an account?{' '}
              <Link href="/auth/login" className={styles.switchLink}>
                Sign In
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
          <h2 className={styles.rightTitle}>Join Our Community</h2>
          <p className={styles.rightSubtitle}>
            Start your learning journey with 1000+ students already making progress.
          </p>

          <div className={styles.sellingPoints}>
            <div className={styles.sellingPoint}>
              <div className={styles.spIcon}>🎯</div>
              <div className={styles.spText}>
                <h4>Structured Learning Paths</h4>
                <p>From beginner to advanced, step by step</p>
              </div>
            </div>
            <div className={styles.sellingPoint}>
              <div className={styles.spIcon}>📜</div>
              <div className={styles.spText}>
                <h4>Verified Certificates</h4>
                <p>Showcase your skills to employers</p>
              </div>
            </div>
            <div className={styles.sellingPoint}>
              <div className={styles.spIcon}>💬</div>
              <div className={styles.spText}>
                <h4>Community Support</h4>
                <p>Connect with peers and mentors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
