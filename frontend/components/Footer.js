import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        {/* Column 1 — About */}
        <div className={styles.col}>
          <div className={styles.footerLogo}>
            <span className={styles.logoIcon}>📚</span>
            <span className={styles.logoText}>
              Learn<span className={styles.logoAccent}>Hub</span>
            </span>
          </div>
          <p className={styles.about}>
            Empowering learners with expert-led, industry-relevant courses.
            Build skills that matter and advance your career with LearnHub.
          </p>
          <div className={styles.social}>
            <a href="#" className={styles.socialLink} aria-label="Twitter">𝕏</a>
            <a href="#" className={styles.socialLink} aria-label="LinkedIn">in</a>
            <a href="#" className={styles.socialLink} aria-label="YouTube">▶</a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">📷</a>
          </div>
        </div>

        {/* Column 2 — Quick Links */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Quick Links</h4>
          <ul className={styles.linkList}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/courses">All Courses</Link></li>
            <li><Link href="/#categories">Categories</Link></li>
            <li><Link href="/#faq">FAQ</Link></li>
            <li><Link href="/auth/login">Login</Link></li>
          </ul>
        </div>

        {/* Column 3 — Top Courses */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Top Courses</h4>
          <ul className={styles.linkList}>
            <li><Link href="/courses/complete-react-nextjs-masterclass">React & Next.js</Link></li>
            <li><Link href="/courses/python-data-science-ml">Python Data Science</Link></li>
            <li><Link href="/courses/aws-cloud-practitioner-devops">AWS & DevOps</Link></li>
            <li><Link href="/courses/deep-learning-transformers">Deep Learning</Link></li>
            <li><Link href="/courses/figma-ui-design-masterclass">Figma Design</Link></li>
          </ul>
        </div>

        {/* Column 4 — Contact & Newsletter */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Stay Updated</h4>
          <p className={styles.newsletterText}>
            Subscribe to our newsletter for latest courses and updates.
          </p>
          <form className={styles.newsletter} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className={styles.newsletterInput}
              aria-label="Email for newsletter"
              suppressHydrationWarning={true}
            />
            <button type="submit" className={styles.newsletterBtn} suppressHydrationWarning={true}>→</button>
          </form>
          <div className={styles.contactInfo}>
            <p>📧 hello@learnhub.com</p>
            <p>📞 +91 98765 43210</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomBarInner}`}>
          <p>© {new Date().getFullYear()} LearnHub. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
