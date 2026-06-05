'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { courses, categories, testimonials, faqItems } from '@/lib/data';
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
      { threshold: 0.05 }
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
  const router = useRouter();
  const [coursesList, setCoursesList] = useState(courses);
  const [categoriesList, setCategoriesList] = useState(categories);
  const [activeTab, setActiveTab] = useState('all');

  // Hero Slider Index State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Forms State
  const [counsellingForm, setCounsellingForm] = useState({ name: '', phone: '', email: '', course: '' });
  const [counsellingSubmitting, setCounsellingSubmitting] = useState(false);
  const [counsellingSuccess, setCounsellingSuccess] = useState(false);

  const [bottomForm, setBottomForm] = useState({ name: '', phone: '', email: '', course: '', message: '' });
  const [bottomSubmitting, setBottomSubmitting] = useState(false);
  const [bottomSuccess, setBottomSuccess] = useState(false);



  // Auto-play interval for hero slider
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  // Fetch course list and categories list from API if available
  useEffect(() => {
    async function loadData() {
      try {
        const cRes = await api.getCourses();
        const catRes = await api.getCategories();
        if (cRes?.data && Array.isArray(cRes.data) && cRes.data.length > 0) {
          setCoursesList(cRes.data);
        }
        if (catRes?.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
          const adaptedCats = catRes.data.map((cat) => {
            const matchedMock = categories.find((mc) => mc.id === cat.slug);
            return {
              id: cat.slug,
              name: cat.name,
              description: cat.description || (matchedMock ? matchedMock.description : ''),
              courseCount: cat.courseCount,
              icon: matchedMock ? matchedMock.icon : '🌐',
              color: matchedMock ? matchedMock.color : '#6366f1',
            };
          });
          setCategoriesList(adaptedCats);
        }
      } catch (err) {
        console.error('Failed to load home page data from backend:', err);
      }
    }
    loadData();
  }, []);

  // Filter courses based on active dynamic tab
  const filteredCourses = activeTab === 'all'
    ? coursesList
    : coursesList.filter((c) => {
        const catSlug = typeof c.category === 'object' ? c.category?.slug : c.category;
        return catSlug === activeTab;
      });

  const featuredCourses = filteredCourses.slice(0, 6);

  // Form Handlers
  const handleCounsellingSubmit = async (e) => {
    e.preventDefault();
    setCounsellingSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setCounsellingSubmitting(false);
    setCounsellingSuccess(true);
    setCounsellingForm({ name: '', phone: '', email: '', course: '' });
    setTimeout(() => setCounsellingSuccess(false), 5000);
  };

  const handleBottomSubmit = async (e) => {
    e.preventDefault();
    setBottomSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setBottomSubmitting(false);
    setBottomSuccess(true);
    setBottomForm({ name: '', phone: '', email: '', course: '', message: '' });
    setTimeout(() => setBottomSuccess(false), 5000);
  };



  const heroSlides = [
    {
      title: 'Full Stack Web Development Program',
      subtitle: 'Build production-ready web applications with React, Next.js, Node.js, and SQL databases. Learn full-stack developer practices.',
      badge: '💻 Hands-on coding track',
      accentColor: '#6366f1',
      glow: 'rgba(99, 102, 241, 0.15)',
      tech: 'React • Next.js • Node.js • PostgreSQL • Prisma',
      bgImage: '/web_dev_banner.png'
    },
    {
      title: 'UI/UX & Creative Graphic Designing',
      subtitle: 'Master wireframing, high-fidelity UI design systems, and user testing inside Figma to build interactive interfaces people love.',
      badge: '🎨 Professional design bootcamp',
      accentColor: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.15)',
      tech: 'Figma • UI Kits • Prototyping • Photoshop • Illustrator',
      bgImage: '/design_banner.png'
    },
    {
      title: 'AI, Machine Learning & Data Analytics',
      subtitle: 'Write complex database queries with SQL and build neural networks and LangChain applications using Python and AI toolkits.',
      badge: '🤖 Future-ready intelligence path',
      accentColor: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.15)',
      tech: 'Python • LangChain • OpenAI API • PyTorch • Pandas',
      bgImage: '/ai_ml_banner.png'
    }
  ];

  return (
    <div ref={pageRef} className={styles.mainWrapper}>
      <Navbar />

      {/* ── SECTION 2: HERO SLIDER (CAROUSEL) ── */}
      <section className={styles.heroSliderSection}>
        <div className={styles.sliderContainer}>
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`${styles.slide} ${idx === currentSlide ? styles.slideActive : ''}`}
              style={{ backgroundImage: `url(${slide.bgImage})` }}
            >
              <div
                className={styles.slideGlow}
                style={{ background: `radial-gradient(circle, ${slide.glow} 0%, transparent 70%)` }}
              />
              <div className={`container ${styles.slideContent}`}>
                <div className={styles.slideBadge} style={{ borderColor: `${slide.accentColor}40`, color: slide.accentColor }}>
                  {slide.badge}
                </div>
                <h1 className={styles.slideTitle}>
                  {slide.title}
                </h1>
                <p className={styles.slideSubtitle}>
                  {slide.subtitle}
                </p>
                <div className={styles.slideTech}>
                  <span>Technologies:</span> {slide.tech}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider dots */}
        <div className={styles.sliderDots}>
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dotButton} ${idx === currentSlide ? styles.dotActive : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>


      </section>

      {/* ── SECTION 3: ANNOUNCEMENT RIBBON ── */}
      <div className={styles.announcementRibbon}>
        <div className={styles.ribbonContainer}>
          <span className={styles.ribbonPulse}>🔥</span>
          <span className={styles.ribbonText}>
            <strong>ADMISSION OPEN:</strong> Secure up to 30% scholarship on classroom & online training batches. Register today!
          </span>
        </div>
      </div>

      {/* ── SECTION 4: MAIN CALLOUT ── */}
      <section className={`section ${styles.mainCalloutSection} reveal`}>
        <div className="container text-center">
          <h2 className={styles.calloutTitle}>
            Best IT Training & Internship with <span className="text-gradient">100% Placement Support</span>
          </h2>
          <p className={styles.calloutSub}>
            Elevate your skills under the guidance of senior developers and designers. 
            Our job-oriented curriculums are fully structured with real-world commercial projects, 
            interactive live sessions, and dedicated mock interview training to secure your dream role.
          </p>
        </div>
      </section>

      {/* ── SECTION 5: "WHO CAN JOIN" & COUNSELLING FORM ── */}
      <section className={`section ${styles.whoCanJoinSection} reveal`}>
        <div className="container">
          <h2 className="section-title text-center">
            Who Can Join Our <span className="text-gradient">Training & Internship Program?</span>
          </h2>
          <div className={styles.whoCanJoinGrid}>
            {/* Left side: Profiles grid */}
            <div className={styles.profilesGrid}>
              <div className={styles.profileCard}>
                <div className={styles.profileIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>🎓</div>
                <div className={styles.profileContent}>
                  <h3>Students & Freshers</h3>
                  <p>Build a solid coding foundation and learn design/development methodologies to kickstart your career with top portfolios.</p>
                </div>
              </div>
              <div className={styles.profileCard}>
                <div className={styles.profileIcon} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>💼</div>
                <div className={styles.profileContent}>
                  <h3>Job Seekers</h3>
                  <p>Acquire premium practical experience, complete capstone projects, and prepare with mock interviews to land your first IT job.</p>
                </div>
              </div>
              <div className={styles.profileCard}>
                <div className={styles.profileIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>👨‍💻</div>
                <div className={styles.profileContent}>
                  <h3>Working Professionals</h3>
                  <p>Transition roles or upgrade your skills. Master cloud deployments, DevOps pipelines, advanced architecture, and generative AI.</p>
                </div>
              </div>
              <div className={styles.profileCard}>
                <div className={styles.profileIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>📈</div>
                <div className={styles.profileContent}>
                  <h3>Business Owners & Creators</h3>
                  <p>Take charge of your product design, manage digital marketing campaigns, and build web platforms independently.</p>
                </div>
              </div>
            </div>

            {/* Right side: Counselling Form Card */}
            <div className={styles.counsellingFormCard}>
              <div className={styles.counsellingHeader}>
                <h3>Get Free Counselling</h3>
                <p>Enquire now to discuss career roadmaps with expert advisors</p>
              </div>
              
              {counsellingSuccess ? (
                <div className={styles.formSuccessMessage}>
                  <h4>🎉 Request Submitted!</h4>
                  <p>Thank you for reaching out. One of our senior career advisors will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleCounsellingSubmit} className={styles.counsellingForm}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      required
                      value={counsellingForm.name}
                      onChange={(e) => setCounsellingForm({ ...counsellingForm, name: e.target.value })}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      required
                      value={counsellingForm.phone}
                      onChange={(e) => setCounsellingForm({ ...counsellingForm, phone: e.target.value })}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={counsellingForm.email}
                      onChange={(e) => setCounsellingForm({ ...counsellingForm, email: e.target.value })}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <select
                      required
                      value={counsellingForm.course}
                      onChange={(e) => setCounsellingForm({ ...counsellingForm, course: e.target.value })}
                      suppressHydrationWarning
                    >
                      <option value="">-- Select Course of Interest --</option>
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={counsellingSubmitting} className={styles.formSubmitBtn} suppressHydrationWarning>
                    {counsellingSubmitting ? 'Sending...' : 'Send Request 🚀'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: "WHY CHOOSE US" SECTION ── */}
      <section className={`section ${styles.whyChooseSection} reveal`}>
        <div className="container">
          <div className={styles.whyChooseGrid}>
            {/* Left Image Collage */}
            <div className={styles.whyChooseImageWrapper}>
              <img
                src="/why_choose_us.png"
                alt="Practical Tech and Design training at LearnHub"
                className={styles.whyChooseImage}
              />
              <div className={styles.whyChooseFloatingGlow} />
            </div>

            {/* Right bullet list */}
            <div className={styles.whyChooseContent}>
              <h2 className="section-title">
                Why Choose <span className="text-gradient">LearnHub</span> For Your Learning?
              </h2>
              <p className={styles.whyChooseDesc}>
                We prioritize practical implementation over dry theory. Here is why thousands of candidates trust our training model:
              </p>
              
              <ul className={styles.whyChooseList}>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>Industry Expert Mentors</strong>
                    <p>Learn from active developers and professional designers working in top product companies.</p>
                  </div>
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>Commercial Live Projects</strong>
                    <p>Get hands-on coding on real client-facing servers and design actual UI components.</p>
                  </div>
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>100% Placement Drives</strong>
                    <p>Resume building services, dedicated portfolio reviews, mock HR rounds, and regular hiring events.</p>
                  </div>
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>Global Certifications</strong>
                    <p>Earn internationally-accepted training completion certificates to validate your engineering credentials.</p>
                  </div>
                </li>
                <li>
                  <span className={styles.checkIcon}>✓</span>
                  <div>
                    <strong>Flexible Timing Batches</strong>
                    <p>Classes scheduled on weekdays or weekends. Adapt learning speeds according to your university or work hours.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: BROWSE BY CATEGORY PATHWAYS ── */}
      <section className={`section ${styles.categorySection} reveal`}>
        <div className="container">
          <h2 className="section-title text-center">
            Explore Our <span className="text-gradient">Learning Pathways</span>
          </h2>
          <div className={`grid ${styles.categoryGrid}`}>
            {categoriesList.map((cat) => (
              <div key={cat.id} className={styles.categoryCard} style={{ '--accent': cat.color }}>
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
                <div className={styles.categoryMeta}>
                  <span>📚 {cat.courseCount} Courses</span>
                  <Link href={`/courses?category=${cat.id}`} className={styles.categoryLink}>
                    View Courses →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: BLUE KEY FEATURES STRIP ── */}
      <div className={styles.blueFeaturesStrip}>
        <div className={`container ${styles.stripGrid}`}>
          <div className={styles.stripItem}>
            <span className={styles.stripIcon}>🎯</span>
            <div className={styles.stripText}>
              <h4>100% Practical Training</h4>
              <p>No slide decks, strictly live execution</p>
            </div>
          </div>
          <div className={styles.stripItem}>
            <span className={styles.stripIcon}>💻</span>
            <div className={styles.stripText}>
              <h4>Work on Live Projects</h4>
              <p>Deploy real working platforms</p>
            </div>
          </div>
          <div className={styles.stripItem}>
            <span className={styles.stripIcon}>🤝</span>
            <div className={styles.stripText}>
              <h4>Dedicated Placement Cell</h4>
              <p>Direct hiring drives with partners</p>
            </div>
          </div>
          <div className={styles.stripItem}>
            <span className={styles.stripIcon}>⏱️</span>
            <div className={styles.stripText}>
              <h4>Flexible Timings</h4>
              <p>Choose weekday or weekend batches</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 9: POPULAR COURSES WITH DYNAMIC TABS ── */}
      <section className={`section ${styles.popularCoursesSection} reveal`}>
        <div className="container">
          <h2 className="section-title text-center">
            Our Popular <span className="text-gradient">Training Programs</span>
          </h2>
          
          {/* Dynamic tabs controller */}
          <div className={styles.tabsScroller}>
            <div className={styles.tabsContainer}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('all')}
                suppressHydrationWarning
              >
                All Courses
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.tabBtn} ${activeTab === cat.id ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab(cat.id)}
                  suppressHydrationWarning
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Courses grid */}
          <div className={styles.coursesGrid}>
            {featuredCourses.length > 0 ? (
              featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className={styles.noCoursesFound}>
                <h4>No courses found in this category.</h4>
                <p>We are currently updating our curricula. Please check back later or enquiry now!</p>
              </div>
            )}
          </div>

          <div className={styles.seeAllCoursesLink}>
            <Link href="/courses" className="btn btn-secondary">
              Browse All Courses →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 10: TOP TECHNOLOGIES WE OFFER ── */}
      <section className={`section ${styles.technologiesSection} reveal`}>
        <div className="container">
          <h2 className="section-title text-center">
            Top Technologies <span className="text-gradient">We Offer</span>
          </h2>
          <p className="section-subtitle text-center">
            Master stack modules aligned with top tech giants and modern design agencies
          </p>

          <div className={styles.techGrid}>
            <div className={styles.techItem} title="HTML5">
              <span className={styles.techLogo}>🌐</span>
              <span>HTML5 & CSS3</span>
            </div>
            <div className={styles.techItem} title="JavaScript">
              <span className={styles.techLogo}>⚡</span>
              <span>JavaScript</span>
            </div>
            <div className={styles.techItem} title="React.js">
              <span className={styles.techLogo}>⚛️</span>
              <span>React & Next.js</span>
            </div>
            <div className={styles.techItem} title="Node.js">
              <span className={styles.techLogo}>🟢</span>
              <span>Node & Express</span>
            </div>
            <div className={styles.techItem} title="Python">
              <span className={styles.techLogo}>🐍</span>
              <span>Python & Django</span>
            </div>
            <div className={styles.techItem} title="Prisma ORM">
              <span className={styles.techLogo}>💎</span>
              <span>PostgreSQL & Prisma</span>
            </div>
            <div className={styles.techItem} title="Figma">
              <span className={styles.techLogo}>🎨</span>
              <span>Figma UI/UX</span>
            </div>
            <div className={styles.techItem} title="Cloud Services">
              <span className={styles.techLogo}>☁️</span>
              <span>AWS Cloud</span>
            </div>
            <div className={styles.techItem} title="Docker">
              <span className={styles.techLogo}>🐳</span>
              <span>Docker & K8s</span>
            </div>
            <div className={styles.techItem} title="Creative Suite">
              <span className={styles.techLogo}>🖌️</span>
              <span>Adobe Photoshop</span>
            </div>
            <div className={styles.techItem} title="Vector Art">
              <span className={styles.techLogo}>📐</span>
              <span>Adobe Illustrator</span>
            </div>
            <div className={styles.techItem} title="Video Post">
              <span className={styles.techLogo}>🎬</span>
              <span>Premiere & VFX</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 11: OUR LEARNING PROCESS ── */}
      <section className={`section ${styles.processSection} reveal`}>
        <div className="container">
          <h2 className="section-title text-center">
            How We Help You <span className="text-gradient">Get Placed</span>
          </h2>
          <div className={styles.processGrid}>
            <div className={styles.processStep}>
              <div className={styles.stepNum}>01</div>
              <h3>Industry Curriculums</h3>
              <p>Learn structured, project-first courses designed and validated by industry engineering leaders.</p>
            </div>
            <div className={styles.processArrow}>➔</div>
            <div className={styles.processStep}>
              <div className={styles.stepNum}>02</div>
              <h3>Live Project Work</h3>
              <p>Develop real components, deploy applications on cloud servers, and maintain codebases.</p>
            </div>
            <div className={styles.processArrow}>➔</div>
            <div className={styles.processStep}>
              <div className={styles.stepNum}>03</div>
              <h3>Reviews & Portfolios</h3>
              <p>Seniors audit your design frames and code commits, helping you build high-impact GitHub & Behance portfolios.</p>
            </div>
            <div className={styles.processArrow}>➔</div>
            <div className={styles.processStep}>
              <div className={styles.stepNum}>04</div>
              <h3>Placement Drives</h3>
              <p>Submit resumes to recruitment partners, participate in mock HR interview rounds, and clear direct hiring drives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 12: STUDENT SUCCESS PLACEMENT ROW ── */}
      <section className={`section ${styles.studentSuccessSection} reveal`}>
        <div className="container">
          <h2 className="section-title text-center">
            Congratulations To Our <span className="text-gradient">Certified Alumni</span>
          </h2>
          <p className="section-subtitle text-center">
            Proudly showing our candidates holding completion and placement credentials
          </p>

          <div className={styles.studentAlumniRow}>
            <div className={styles.alumniCard}>
              <div className={styles.alumniBadge}>Placed at Tech Mahindra</div>
              <div className={styles.alumniAvatar}>👨‍🎓</div>
              <h3>Rahul Kumar</h3>
              <p>Full Stack Developer</p>
            </div>
            <div className={styles.alumniCard}>
              <div className={styles.alumniBadge}>Placed at Infosys</div>
              <div className={styles.alumniAvatar}>👩‍🎓</div>
              <h3>Priya Sharma</h3>
              <p>UI/UX Product Designer</p>
            </div>
            <div className={styles.alumniCard}>
              <div className={styles.alumniBadge}>Placed at Wipro</div>
              <div className={styles.alumniAvatar}>👨‍🎓</div>
              <h3>Amit Verma</h3>
              <p>Python Backend Engineer</p>
            </div>
            <div className={styles.alumniCard}>
              <div className={styles.alumniBadge}>Placed at Cognizant</div>
              <div className={styles.alumniAvatar}>👩‍🎓</div>
              <h3>Neha Gupta</h3>
              <p>DevOps & Cloud Engineer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 13: STUDENT REVIEWS & GOOGLE BADGE ── */}
      <section className={`section ${styles.reviewsSection} reveal`}>
        <div className="container">
          <div className={styles.reviewsWidgetHeader}>
            <div>
              <h2 className="section-title">What Our <span className="text-gradient">Students Say</span></h2>
              <p>Join thousands of successful candidates who transformed their skills.</p>
            </div>
            {/* Google Rating Badge */}
            <div className={styles.googleRatingBadge}>
              <div className={styles.googleLogo}>Google Rating</div>
              <div className={styles.ratingInfo}>
                <span className={styles.stars}>⭐⭐⭐⭐⭐</span>
                <span className={styles.score}><strong>4.9 / 5.0</strong> based on 1240+ reviews</span>
              </div>
            </div>
          </div>

          <div className={styles.reviewsGrid}>
            {testimonials.map((t) => (
              <div key={t.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewInfo}>
                    <h4>{t.name}</h4>
                    <span>{t.role}</span>
                  </div>
                  <span className={styles.reviewQuoteSign}>“</span>
                </div>
                <p className={styles.reviewText}>{t.text}</p>
                <div className={styles.reviewStars}>⭐⭐⭐⭐⭐</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 14: PLACEMENT PARTNERS MARQUEE ── */}
      <section className={`section ${styles.partnersSection} reveal`}>
        <div className="container">
          <h2 className="section-title text-center">
            Our Graduates Work At <span className="text-gradient">Leading Companies</span>
          </h2>
          
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeTrack}>
              {/* First Set */}
              <div className={styles.marqueeItem}>Google</div>
              <div className={styles.marqueeItem}>Amazon</div>
              <div className={styles.marqueeItem}>TCS</div>
              <div className={styles.marqueeItem}>Infosys</div>
              <div className={styles.marqueeItem}>Wipro</div>
              <div className={styles.marqueeItem}>Cognizant</div>
              <div className={styles.marqueeItem}>HCL Tech</div>
              <div className={styles.marqueeItem}>Tech Mahindra</div>
              <div className={styles.marqueeItem}>Accenture</div>
              
              {/* Duplicate Set for Loop */}
              <div className={styles.marqueeItem}>Google</div>
              <div className={styles.marqueeItem}>Amazon</div>
              <div className={styles.marqueeItem}>TCS</div>
              <div className={styles.marqueeItem}>Infosys</div>
              <div className={styles.marqueeItem}>Wipro</div>
              <div className={styles.marqueeItem}>Cognizant</div>
              <div className={styles.marqueeItem}>HCL Tech</div>
              <div className={styles.marqueeItem}>Tech Mahindra</div>
              <div className={styles.marqueeItem}>Accenture</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 15: OFFLINE/ONLINE MARKETING BANNERS ── */}
      <section className={`section ${styles.marketingBannersSection} reveal`}>
        <div className="container">
          <div className={styles.marketingGrid}>
            <div className={`${styles.marketingCard} ${styles.marketingCardOffline}`}>
              <span className={styles.marketingIcon}>🏫</span>
              <h3>Classroom Training (Offline)</h3>
              <p>Attend interactive modules directly at our Sector 34, Chandigarh center. Experience 1-on-1 developer desks, physical computer labs, and face-to-face mentorship.</p>
              <div className={styles.marketingBadge}>Interactive Classroom batches</div>
            </div>
            <div className={`${styles.marketingCard} ${styles.marketingCardOnline}`}>
              <span className={styles.marketingIcon}>💻</span>
              <h3>Virtual Classroom (Online Live)</h3>
              <p>Learn from anywhere in India with our live stream classes. Connect with mentors via real-time screen shares, interact on collaborative Slack chats, and access recorded libraries.</p>
              <div className={styles.marketingBadge}>Live Interactive Streams</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 16: BOTTOM FORM + FAQ ACCORDION SPLIT ── */}
      <section className={`section ${styles.bottomSplitSection} reveal`} id="faq">
        <div className="container">
          <div className={styles.bottomSplitGrid}>
            {/* Left: Get in touch form */}
            <div className={styles.contactFormCard}>
              <div className={styles.contactHeader}>
                <h2>Have Any <span className="text-gradient">Questions?</span></h2>
                <p>Submit your details and our team will get back to you within 24 hours.</p>
              </div>

              {bottomSuccess ? (
                <div className={styles.formSuccessMessage}>
                  <h4>🎉 Message Received!</h4>
                  <p>Thank you. Our recruitment and training coordination team will contact you very soon.</p>
                </div>
              ) : (
                <form onSubmit={handleBottomSubmit} className={styles.contactForm}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={bottomForm.name}
                      onChange={(e) => setBottomForm({ ...bottomForm, name: e.target.value })}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      required
                      value={bottomForm.phone}
                      onChange={(e) => setBottomForm({ ...bottomForm, phone: e.target.value })}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={bottomForm.email}
                      onChange={(e) => setBottomForm({ ...bottomForm, email: e.target.value })}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <select
                      required
                      value={bottomForm.course}
                      onChange={(e) => setBottomForm({ ...bottomForm, course: e.target.value })}
                      suppressHydrationWarning
                    >
                      <option value="">-- Select Course of Interest --</option>
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <textarea
                      placeholder="Your Message / Query"
                      rows="4"
                      required
                      value={bottomForm.message}
                      onChange={(e) => setBottomForm({ ...bottomForm, message: e.target.value })}
                      suppressHydrationWarning
                    />
                  </div>
                  <button type="submit" disabled={bottomSubmitting} className={styles.formSubmitBtn} suppressHydrationWarning>
                    {bottomSubmitting ? 'Sending...' : 'Send Message ✉️'}
                  </button>
                </form>
              )}
            </div>

            {/* Right: FAQ Accordion */}
            <div className={styles.faqAccordionCol}>
              <h2 className={styles.faqColTitle}>Frequently Asked <span className="text-gradient">Questions</span></h2>
              <p className={styles.faqColSubtitle}>Get instant answers about our training, batch timings, credentials, and internship programs</p>
              <FAQAccordion items={faqItems} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
