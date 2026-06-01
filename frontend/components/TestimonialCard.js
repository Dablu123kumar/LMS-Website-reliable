import styles from './TestimonialCard.module.css';

export default function TestimonialCard({ testimonial }) {
  const { name, role, content, avatar, rating } = testimonial;

  return (
    <div className={styles.card}>
      <div className={styles.stars}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < rating ? styles.starFull : styles.starEmpty}>★</span>
        ))}
      </div>
      <p className={styles.quote}>&ldquo;{content}&rdquo;</p>
      <div className={styles.author}>
        <img src={avatar} alt={name} className={styles.avatar} />
        <div>
          <p className={styles.name}>{name}</p>
          <p className={styles.role}>{role}</p>
        </div>
      </div>
    </div>
  );
}
