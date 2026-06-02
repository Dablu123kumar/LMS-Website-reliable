'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import CategoryCard from '@/components/CategoryCard';
import TestimonialCard from '@/components/TestimonialCard';
import StatsCounter from '@/components/StatsCounter';
import { courses, categories, testimonials, faqItems, stats } from '@/lib/data';
import { api } from '@/lib/api';
import styles from './page.module.css';

/* ── Scroll Reveal Hook ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('revealed');
        });
      },
      { threshold: 0.1 }
    );
    const nodes = ref.current?.querySelectorAll('.reveal');
    nodes?.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── FAQ Accordion ── */
function FAQAccordion({ items }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className={styles.faqList}>
      {items.map((item, i) => (
        <div key={i} className={styles.faqItem}>
          <button
            className={styles.faqTrigger}
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            suppressHydrationWarning={true}
          >
            <span>{item.question}</span>
            <span className={`${styles.faqIcon} ${openIdx === i ? styles.faqIconOpen : ''}`}>
              ▾
            </span>
          </button>
          <div className={`${styles.faqContent} ${openIdx === i ? styles.faqContentOpen : ''}`}>
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const pageRef = useReveal();
  const [coursesList, setCoursesList] = useState(courses);

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await api.getCourses();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          console.log('Backend courses data on Home Page:', res.data);
          setCoursesList(res.data);
        }
      } catch (err) {
        console.error('Failed to load courses on Home Page from backend:', err);
      }
    }
    loadCourses();
  }, []);

  const featuredCourses = coursesList.slice(0, 6);

  const statItems = [
    { icon: '🎓', label: 'Students', end: stats.students },
    { icon: '📚', label: 'Courses', end: stats.courses },
    { icon: '🎥', label: 'Live Classes', end: stats.liveClasses },
    { icon: '👨‍🏫', label: 'Expert Instructors', end: stats.instructors },
  ];

  return (
    <div ref={pageRef}>
      <Navbar />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        {/* Background effects */}
        <div className={styles.heroBg}>
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />
          <div className={styles.dotGrid}>
            {Array.from({ length: 60 }, (_, i) => (
              <span key={i} className={styles.dot} style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            🚀 <span>Trusted by 1000+ learners nationwide</span>
          </div>
          <h1 className={styles.heroTitle}>
            Unlock Your Potential<br />
            with <span className="text-gradient">Expert-Led Courses</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Master in-demand skills in Web Development, Data Science, AI, Cloud, and Design
            with industry experts. Learn at your pace, earn certificates, and accelerate your career.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/courses" className="btn btn-primary btn-lg">
              Explore Courses →
            </Link>
            <Link href="/auth/signup" className="btn btn-secondary btn-lg">
              Start Free
            </Link>
          </div>

          {/* Floating tech icons */}
          <div className={styles.floatingIcons}>
            <span className={styles.floatIcon} style={{ top: '15%', left: '5%', animationDelay: '0s' }}>⚛️</span>
            <span className={styles.floatIcon} style={{ top: '25%', right: '8%', animationDelay: '1s' }}>🐍</span>
            <span className={styles.floatIcon} style={{ bottom: '30%', left: '10%', animationDelay: '2s' }}>☁️</span>
            <span className={styles.floatIcon} style={{ top: '10%', right: '20%', animationDelay: '0.5s' }}>🤖</span>
            <span className={styles.floatIcon} style={{ bottom: '20%', right: '5%', animationDelay: '1.5s' }}>🎨</span>
            <span className={styles.floatIcon} style={{ bottom: '10%', left: '25%', animationDelay: '2.5s' }}>📱</span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="reveal">
        <StatsCounter items={statItems} />
      </section>

      {/* ── CATEGORIES ── */}
      <section className={`section ${styles.categoriesSection}`} id="categories">
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">Browse by <span className="text-gradient">Category</span></h2>
            <p className="section-subtitle">
              Explore our diverse range of courses across the most in-demand tech domains
            </p>
          </div>
          <div className={`grid ${styles.categoriesGrid} reveal`}>
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ── */}
      <section className={`section ${styles.coursesSection}`}>
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">Featured <span className="text-gradient">Courses</span></h2>
            <p className="section-subtitle">
              Hand-picked courses designed by industry experts to fast-track your learning journey
            </p>
          </div>
          <div className={`${styles.coursesGrid} reveal`}>
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className={`${styles.seeAll} reveal`}>
            <Link href="/courses" className="btn btn-secondary">
              Browse All Courses →
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={`section ${styles.howSection}`}>
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">How It <span className="text-gradient">Works</span></h2>
            <p className="section-subtitle">
              Getting started is simple — three easy steps to transform your career
            </p>
          </div>
          <div className={`${styles.howGrid} reveal`}>
            <div className={styles.howStep}>
              <div className={styles.howIcon}>🔍</div>
              <div className={styles.howNum}>01</div>
              <h3>Browse & Choose</h3>
              <p>Explore our catalog of expert-led courses and find the perfect match for your goals.</p>
            </div>
            <div className={styles.howConnector}><span /></div>
            <div className={styles.howStep}>
              <div className={styles.howIcon}>💳</div>
              <div className={styles.howNum}>02</div>
              <h3>Purchase & Access</h3>
              <p>Complete your purchase and receive instant LMS login credentials via email.</p>
            </div>
            <div className={styles.howConnector}><span /></div>
            <div className={styles.howStep}>
              <div className={styles.howIcon}>🚀</div>
              <div className={styles.howNum}>03</div>
              <h3>Learn & Grow</h3>
              <p>Watch lessons, attend live classes, complete projects, and earn your certificate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={`section ${styles.testimonialSection}`}>
        <div className="container">
          <div className="reveal">
            <h2 className="section-title">What Our <span className="text-gradient">Students Say</span></h2>
            <p className="section-subtitle">
              Join thousands of satisfied learners who transformed their careers with LearnHub
            </p>
          </div>
        </div>
        <div className={`${styles.testimonialScroll} reveal`}>
          <div className={styles.testimonialTrack}>
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`section ${styles.faqSection}`} id="faq">
        <div className="container-sm">
          <div className="reveal">
            <h2 className="section-title">Frequently Asked <span className="text-gradient">Questions</span></h2>
            <p className="section-subtitle">
              Everything you need to know about learning on LearnHub
            </p>
          </div>
          <div className="reveal">
            <FAQAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`${styles.ctaSection} reveal`}>
        <div className="container">
          <div className={styles.ctaCard}>
            <h2>Ready to Start <span className="text-gradient">Learning?</span></h2>
            <p>
              Join 1000+ students already building their future with LearnHub.
              Your first step to expertise starts here.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Get Started Free →
              </Link>
              <Link href="/courses" className="btn btn-secondary btn-lg">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
