'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatsCounter from '@/components/StatsCounter';
import styles from './page.module.css';

export default function AboutPage() {
  const statsItems = [
    { icon: '👥', label: 'Active Learners', end: 10000, suffix: '+' },
    { icon: '📚', label: 'Technical Courses', end: 150, suffix: '+' },
    { icon: '👨‍🏫', label: 'Dedicated Mentors', end: 50, suffix: '+' },
    { icon: '⭐', label: 'Satisfaction Rate', end: 99, suffix: '%' }
  ];

  const values = [
    {
      icon: '🚀',
      title: 'Project-Based Learning',
      description: 'We believe in learning by doing. Our courses focus on real-world projects that mirror industry requirements.'
    },
    {
      icon: '📈',
      title: 'Career Acceleration',
      description: 'From resume reviews to mock interviews, our curriculum and resources are geared towards landing your dream job.'
    },
    {
      icon: '🤝',
      title: 'Expert Support',
      description: 'Get your doubts resolved by professional mentors who are actively working in the industry.'
    },
    {
      icon: '♾️',
      title: 'Lifetime Access',
      description: 'Learn at your own pace. All courses come with lifetime access, including future updates and community discussions.'
    }
  ];

  const team = [
    {
      name: 'Dablu Kumar',
      role: 'Founder & Lead Architect',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      bio: 'Full Stack Engineer with 7+ years of experience designing scalable distributed applications and ed-tech solutions.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Dr. Priya Patel',
      role: 'Head of Artificial Intelligence',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
      bio: 'Former AI research scientist with a PhD in Machine Learning. Passionate about teaching deep neural network engineering.',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'Alex Mercer',
      role: 'Director of Curriculum & UX',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
      bio: 'Product Designer and curriculum designer specializing in creating immersive and engaging student learning pathways.',
      linkedin: '#',
      twitter: '#'
    }
  ];

  return (
    <div className={styles.mainWrapper}>
      <Navbar />

      {/* Hero Header */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.badge}>Our Story</span>
            <h1 className={styles.title}>
              Empowering Minds, <br />
              Shaping the <span className="text-gradient">Future</span>
            </h1>
            <p className={styles.subtitle}>
              At LearnHub, we are redefining online education by bridging the gap between theoretical knowledge and real-world career requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className={styles.statsSection}>
        <StatsCounter items={statsItems} />
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className={styles.visionGrid}>
            <div className={`glass-card-static ${styles.visionCard}`}>
              <div className={styles.visionIcon}>🎯</div>
              <h3>Our Mission</h3>
              <p>
                To deliver premium, accessible, and high-impact educational resources that enable learners globally to transition into technology and design roles, fostering growth and self-reliance.
              </p>
            </div>
            <div className={`glass-card-static ${styles.visionCard}`}>
              <div className={styles.visionIcon}>👁️‍🗨️</div>
              <h3>Our Vision</h3>
              <p>
                To become the world's most trusted online learning environment, celebrated for producing job-ready engineering talent and offering elite guidance at every stage of the student journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className={`section ${styles.valuesBg}`}>
        <div className="container">
          <div className="section-title">
            <h2>Our Core <span className="text-gradient">Values</span></h2>
          </div>
          <p className="section-subtitle">
            These guiding principles form the foundation of our curriculum and student community.
          </p>

          <div className={styles.valuesGrid}>
            {values.map((v, i) => (
              <div key={i} className={`glass-card ${styles.valueCard}`}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Meet the <span className="text-gradient">Mentors</span></h2>
          </div>
          <p className="section-subtitle">
            Learn from seasoned professionals who bring direct industry experience and deep domain knowledge.
          </p>

          <div className={styles.teamGrid}>
            {team.map((member, i) => (
              <div key={i} className={`glass-card ${styles.teamCard}`}>
                <div className={styles.imageWrapper}>
                  <img
                    src={member.image}
                    alt={member.name}
                    className={styles.teamImage}
                  />
                </div>
                <div className={member.infoWrapper}>
                  <h4 className={styles.memberName}>{member.name}</h4>
                  <span className={styles.memberRole}>{member.role}</span>
                  <p className={styles.memberBio}>{member.bio}</p>
                  <div className={styles.memberSocials}>
                    <a href={member.linkedin} aria-label="LinkedIn">in</a>
                    <a href={member.twitter} aria-label="Twitter">𝕏</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
