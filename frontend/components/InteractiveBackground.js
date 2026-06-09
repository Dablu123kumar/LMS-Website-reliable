'use client';

import styles from './InteractiveBackground.module.css';

export default function InteractiveBackground() {
  return (
    <div className={styles.bgContainer}>
      <div className={styles.gridOverlay} />
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />
    </div>
  );
}
