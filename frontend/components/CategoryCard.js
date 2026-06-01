import styles from './CategoryCard.module.css';

export default function CategoryCard({ category }) {
  const { icon, name, description, courseCount, color } = category;

  return (
    <div className={styles.card} style={{ '--cat-color': color }}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.desc}>{description}</p>
      <span className={styles.count}>{courseCount} Courses</span>
    </div>
  );
}
