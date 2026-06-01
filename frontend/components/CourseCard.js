import Link from 'next/link';
import styles from './CourseCard.module.css';

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? styles.starFull : i === full && half ? styles.starHalf : styles.starEmpty}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function CourseCard({ course }) {
  const {
    slug,
    title,
    shortDescription,
    price,
    discountPrice,
    thumbnailUrl,
    instructor,
    difficultyLevel,
    durationHours,
    ratingAvg,
    enrollmentCount,
    category,
  } = course;

  const diffClass =
    difficultyLevel === 'Beginner'
      ? 'badge-green'
      : difficultyLevel === 'Intermediate'
      ? 'badge-amber'
      : 'badge-rose';

  return (
    <Link href={`/courses/${slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={thumbnailUrl} alt={title} className={styles.image} loading="lazy" />
        <span className={`badge ${diffClass} ${styles.diffBadge}`}>{difficultyLevel}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>{category.replace(/-/g, ' ')}</span>
          <span className={styles.duration}>⏱ {durationHours}h</span>
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{shortDescription}</p>

        <div className={styles.instructor}>
          <img src={instructor.avatar} alt={instructor.name} className={styles.avatar} />
          <span>{instructor.name}</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.rating}>
            <Stars rating={ratingAvg} />
            <span className={styles.ratingNum}>{ratingAvg}</span>
            <span className={styles.enrollCount}>({enrollmentCount.toLocaleString()})</span>
          </div>
          <div className={styles.priceBlock}>
            {discountPrice < price && (
              <span className={styles.originalPrice}>₹{price.toLocaleString()}</span>
            )}
            <span className={styles.price}>₹{(discountPrice || price).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
