'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', exiting: false });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const showToastNotification = (message, type = 'success') => {
    setToast({ show: true, message, type, exiting: false });
    setTimeout(() => {
      setToast(prev => ({ ...prev, exiting: true }));
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success', exiting: false });
      }, 300);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        await api.createInquiry({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
          type: 'CONTACT_PAGE'
        });
        showToastNotification('Your message has been sent successfully! We will get back to you shortly.', 'success');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } catch (err) {
        showToastNotification(err.message || 'Failed to send message. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showToastNotification('Please fill in all required fields correctly.', 'error');
    }
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className={styles.mainWrapper}>
      <Navbar />

      {/* Hero Header */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.badge}>Get In Touch</span>
            <h1 className={styles.title}>
              Let&apos;s Connect & <br />
              Grow <span className="text-gradient">Together</span>
            </h1>
            <p className={styles.subtitle}>
              Have questions about our courses, team licensing, or custom career tracks? Reach out and we will help you get started.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content Grid */}
      <section className="section" style={{ paddingTop: '20px' }}>
        <div className="container">
          <div className={styles.contactGrid}>
            
            {/* Left Side: Info */}
            <div className={styles.infoArea}>
              <div className={`glass-card-static ${styles.infoCard}`}>
                <h3>Contact Information</h3>
                <p className={styles.infoDesc}>
                  Feel free to contact us via email, phone, or by visiting our Noida office. Our support team is ready to assist you.
                </p>

                <div className={styles.infoItems}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>✉️</div>
                    <div className={styles.infoText}>
                      <span>Email Us</span>
                      <a href="mailto:hello@learnhub.com">hello@learnhub.com</a>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>📞</div>
                    <div className={styles.infoText}>
                      <span>Call Us</span>
                      <a href="tel:+919876543210">+91 98765 43210</a>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>📍</div>
                    <div className={styles.infoText}>
                      <span>Our Campus</span>
                      <p>Sector 62, Noida, Uttar Pradesh, 201301, India</p>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>⏰</div>
                    <div className={styles.infoText}>
                      <span>Working Hours</span>
                      <p>Monday — Friday, 9:00 AM — 6:00 PM IST</p>
                    </div>
                  </div>
                </div>

                <hr className={styles.divider} />

                <h4>Follow Our Socials</h4>
                <div className={styles.socialGrid}>
                  <a href="#" className={styles.socialLink} aria-label="LinkedIn">LinkedIn</a>
                  <a href="#" className={styles.socialLink} aria-label="Twitter">Twitter</a>
                  <a href="#" className={styles.socialLink} aria-label="YouTube">YouTube</a>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className={styles.formArea}>
              <div className={`glass-card ${styles.formCard}`}>
                <h3>Send a Message</h3>
                <p className={styles.formDesc}>We respond to all inquiries within 24 business hours.</p>

                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Your Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className={`${styles.formInput} ${errors.name ? styles.formInputError : ''}`}
                      value={form.name}
                      onChange={handleChange('name')}
                      disabled={loading}
                    />
                    {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
                      value={form.email}
                      onChange={handleChange('email')}
                      disabled={loading}
                    />
                    {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className={styles.formInput}
                      value={form.phone}
                      onChange={handleChange('phone')}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject</label>
                    <input
                      type="text"
                      placeholder="What is this about?"
                      className={`${styles.formInput} ${errors.subject ? styles.formInputError : ''}`}
                      value={form.subject}
                      onChange={handleChange('subject')}
                      disabled={loading}
                    />
                    {errors.subject && <span className={styles.errorMsg}>{errors.subject}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Message</label>
                    <textarea
                      placeholder="Write your message here..."
                      className={`${styles.formInput} ${errors.message ? styles.formInputError : ''}`}
                      value={form.message}
                      onChange={handleChange('message')}
                      disabled={loading}
                      rows={5}
                    />
                    {errors.message && <span className={styles.errorMsg}>{errors.message}</span>}
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? (
                      <>
                        <span className={styles.spinner} /> Sending...
                      </>
                    ) : (
                      'Send Message ➔'
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Map Embed Section */}
      <section className="section" style={{ paddingTop: '0px' }}>
        <div className="container">
          <div className={`glass-card-static ${styles.mapContainer}`}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!11m18!1m12!1m3!1d3502.404284992524!2d77.3621459762413!3d28.617637775673895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce566c2dd61ab%3A0xcb13b190f845d452!2sSector%2062%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1717651234567!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="LearnHub Office Map"
              className={styles.mapIframe}
            />
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exit' : ''}`} style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 10000 }}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <div>{toast.message}</div>
        </div>
      )}

      <Footer />
    </div>
  );
}
