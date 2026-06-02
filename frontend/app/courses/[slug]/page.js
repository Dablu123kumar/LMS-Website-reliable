'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api, getGeneralUser, getFullUrl } from '@/lib/api';
import { courses as mockCourses, categories as mockCategories } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [expandedModules, setExpandedModules] = useState([0]);

  useEffect(() => {
    async function getCourse() {
      try {
        const res = await api.getCourseBySlug(slug);
        if (res?.data) {
          console.log('Backend course detail data:', res.data);
          setCourse(res.data);
        } else {
          const mock = mockCourses.find((c) => c.slug === slug);
          console.log('Mock course detail data (fallback):', mock);
          setCourse(mock || null);
        }
      } catch (err) {
        console.error('API error, using mock data:', err);
        const mock = mockCourses.find((c) => c.slug === slug);
        console.log('Mock course detail data (error fallback):', mock);
        setCourse(mock || null);
      } finally {
        setLoading(false);
      }
    }
    getCourse();
  }, [slug]);

  const handleBuy = async () => {
    const user = getGeneralUser();
    if (!user) {
      router.push(`/auth/login?redirect=/courses/${slug}`);
      return;
    }

    setPurchaseLoading(true);
    setPurchaseError('');
    try {
      const orderRes = await api.createOrder(course.id);
      const orderData = orderRes.data;

      // ─── Razorpay checkout flow ──────────────────────────────────────
      if (orderData.gateway === 'RAZORPAY') {
        // Load Razorpay script if not loaded
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
          });
        }

        const options = {
          key: orderData.razorpayKeyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'LearnHub',
          description: orderData.courseTitle,
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            contact: user.phone || '',
          },
          theme: { color: '#6366f1' },
          handler: async function (response) {
            try {
              await api.verifyPayment({
                orderId: orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              alert('Purchase successful! Your LMS Dashboard login credentials have been sent to your email.');
              router.push('/');
            } catch (err) {
              setPurchaseError(err.message || 'Payment verification failed.');
            } finally {
              setPurchaseLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setPurchaseLoading(false);
              setPurchaseError('Payment was cancelled.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return; // Don't set loading to false here — handler/ondismiss will
      }

      // ─── Manual / fallback flow ──────────────────────────────────────
      await api.verifyPayment({
        orderId: orderData.orderId,
      });
      alert('Purchase successful! Your LMS Dashboard login credentials have been sent to your email.');
      router.push('/');
    } catch (err) {
      setPurchaseError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };




  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="loader">Loading course details...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <div className={styles.notFound}>
            <span className={styles.notFoundIcon}>📚</span>
            <h2>Course Not Found</h2>
            <p className="text-secondary">The course you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/courses" className={styles.notFoundBtn}>
              Browse Courses
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const category = mockCategories.find((c) => c.id === course.category) || { name: course.category, icon: '📚' };
  const totalLessons = course.syllabus ? course.syllabus.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) : 0;
  const rawPercent = typeof course.discountPrice === 'number' && course.price > 0
    ? (course.discountPrice / course.price) * 100
    : 0;
  const discountPercent = rawPercent % 1 === 0 ? rawPercent.toFixed(0) : rawPercent.toFixed(2);

  const toggleModule = (idx) => {
    setExpandedModules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) stars.push('★');
    if (hasHalf) stars.push('★');
    while (stars.length < 5) stars.push('☆');
    return stars.join('');
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {/* Back link */}
        <div className={styles.backLinkContainer}>
          <Link href="/courses" className={styles.backLink}>
            <span className={styles.backArrow}>←</span> Back to Courses
          </Link>
        </div>

        {/* Hero Banner */}
        <section className={styles.hero}>
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${getFullUrl(course.thumbnailUrl)})` }}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <div className={styles.heroBadges}>
              {category && (
                <span className={styles.categoryBadge}>
                  {category.icon} {category.name}
                </span>
              )}
              <span
                className={styles.difficultyBadge}
                data-level={course.difficultyLevel}
              >
                {course.difficultyLevel}
              </span>
            </div>

            <h1 className={styles.heroTitle}>{course.title}</h1>
            <p className={styles.heroDescription}>{course.shortDescription}</p>

            <div className={styles.heroMeta}>
              <div className={styles.instructorMeta}>
                <img
                  src={getFullUrl(course.instructor.avatar)}
                  alt={course.instructor.name}
                  className={styles.instructorAvatar}
                />
                <div>
                  <span className={styles.instructorLabel}>Instructor</span>
                  <div className={styles.instructorName}>
                    {course.instructor.name}
                  </div>
                </div>
              </div>

              <div className={styles.ratingMeta}>
                <span className={styles.ratingStars}>
                  {renderStars(course.ratingAvg)}
                </span>
                <span className={styles.ratingValue}>{course.ratingAvg}</span>
              </div>

              <div className={styles.enrollmentBadge}>
                👥 <span>{course.enrollmentCount.toLocaleString()}</span> enrolled
              </div>

              <div className={styles.durationMeta}>
                🕐 {course.durationHours} hours
              </div>
            </div>
          </div>
        </section>

        {/* Two-column layout */}
        <div className={styles.content}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* What You'll Learn */}
            <section className={styles.learnSection}>
              <h2>✨ What You&apos;ll Learn</h2>
              <div className={styles.featuresGrid}>
                {course.features.map((feature, i) => (
                  <div key={i} className={styles.featureItem}>
                    <span className={styles.featureCheck}>✓</span>
                    <span className={styles.featureText}>{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Course Curriculum */}
            <section className={styles.curriculumSection}>
              <h2>📖 Course Curriculum</h2>
              <div className={styles.curriculumStats}>
                <span>{course.syllabus.length} modules</span> ·{' '}
                <span>{totalLessons} lessons</span> ·{' '}
                <span>{course.durationHours} hours</span>
              </div>

              {course.syllabus.map((module, idx) => (
                <div key={idx} className={styles.moduleItem}>
                  <button
                    className={styles.moduleHeader}
                    onClick={() => toggleModule(idx)}
                  >
                    <div className={styles.moduleLeft}>
                      <span className={styles.moduleNumber}>{idx + 1}</span>
                      <span className={styles.moduleTitle}>{module.title}</span>
                    </div>
                    <div className={styles.moduleRight}>
                      <span className={styles.lessonCount}>
                        {module.lessons.length} lessons
                      </span>
                      <span
                        className={`${styles.chevron} ${
                          expandedModules.includes(idx) ? styles.chevronOpen : ''
                        }`}
                      >
                        ▾
                      </span>
                    </div>
                  </button>

                  <div
                    className={`${styles.lessonsList} ${
                      expandedModules.includes(idx) ? styles.lessonsListOpen : ''
                    }`}
                  >
                    {module.lessons.map((lesson, li) => (
                      <div key={li} className={styles.lessonItem}>
                        <div className={styles.lessonLeft}>
                          <span className={styles.lessonIcon}>🎥</span>
                          <span className={styles.lessonTitle}>
                            {lesson.title}
                          </span>
                        </div>
                        <span className={styles.lessonDuration}>
                          {lesson.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* About the Course */}
            <section className={styles.descriptionSection}>
              <h2>📝 About This Course</h2>
              <p className={styles.descriptionText}>{course.description}</p>
            </section>

            {/* Instructor */}
            <section className={styles.instructorSection}>
              <h2>👨‍🏫 Your Instructor</h2>
              <div className={styles.instructorCard}>
                <img
                  src={getFullUrl(course.instructor.avatar)}
                  alt={course.instructor.name}
                  className={styles.instructorCardAvatar}
                />
                <div className={styles.instructorCardInfo}>
                  <h3>{course.instructor.name}</h3>
                  <div className="label">Course Instructor</div>
                  <p>{course.instructor.bio}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column — Price Card */}
          <div className={styles.rightColumn}>
            <div className={styles.priceCard}>
              <img
                src={getFullUrl(course.thumbnailUrl)}
                alt={course.title}
                className={styles.priceCardThumb}
              />

              <div className={styles.priceRow}>
                {typeof course.discountPrice === 'number' && course.discountPrice < course.price ? (
                  <>
                    <span className={styles.originalPrice}>
                      ₹{course.price.toLocaleString()}
                    </span>
                    <span className={styles.discountPrice}>
                      ₹{(course.price - course.discountPrice).toLocaleString()}
                    </span>
                    <span className={styles.discountPercent}>
                      {discountPercent}% OFF
                    </span>
                  </>
                ) : (
                  <span className={styles.discountPrice}>
                    ₹{course.price.toLocaleString()}
                  </span>
                )}
              </div>
              <p className={styles.priceNote}>⏰ Limited time offer</p>

              {purchaseError && (
                <div style={{ color: '#f43f5e', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                  {purchaseError}
                </div>
              )}

              <button
                className={styles.buyBtn}
                onClick={handleBuy}
                disabled={purchaseLoading}
              >
                {purchaseLoading ? 'Processing...' : 'Buy Now'}
              </button>
              <button className={styles.wishlistBtn}>
                ♡ Add to Wishlist
              </button>

              <hr className={styles.priceDivider} />

              <div className={styles.courseFeatures}>
                <div className={styles.courseFeatureItem}>
                  <span className="label">🕐 Duration</span>
                  <span className="value">{course.durationHours} hours</span>
                </div>
                <div className={styles.courseFeatureItem}>
                  <span className="label">📊 Level</span>
                  <span className="value">{course.difficultyLevel}</span>
                </div>
                <div className={styles.courseFeatureItem}>
                  <span className="label">🗣️ Language</span>
                  <span className="value">English</span>
                </div>
                <div className={styles.courseFeatureItem}>
                  <span className="label">📜 Certificate</span>
                  <span className="value">Yes</span>
                </div>
                <div className={styles.courseFeatureItem}>
                  <span className="label">♾️ Access</span>
                  <span className="value">Lifetime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />


    </>
  );
}
