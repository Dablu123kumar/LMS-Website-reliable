'use client';

import { useState, useEffect } from 'react';
import styles from './Preloader.module.css';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing LearnHub...');
  const [isDone, setIsDone] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Prevent body overflow while loading
    document.body.style.overflow = 'hidden';

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 80);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (progress < 25) {
      setStatusText('Connecting to LearnHub Engine...');
    } else if (progress < 50) {
      setStatusText('Configuring Glass UI Canvas...');
    } else if (progress < 75) {
      setStatusText('Loading Course Database...');
    } else if (progress < 95) {
      setStatusText('Optimizing Interactive Features...');
    } else if (progress === 100) {
      setStatusText('Ready! Welcome to LearnHub.');
      const doneTimeout = setTimeout(() => {
        setIsDone(true);
        const hideTimeout = setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = '';
        }, 600); // match CSS transition duration
        return () => clearTimeout(hideTimeout);
      }, 500);
      return () => clearTimeout(doneTimeout);
    }
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.preloaderContainer} ${isDone ? styles.fadeOut : ''}`}>
      <div className={styles.loaderContent}>
        {/* Glow effect backdrops */}
        <div className={styles.glowBg} />

        <div className={styles.logoAndText}>
          <div className={styles.logoBadge}>LH</div>
          <h1 className={styles.title}>LEARNHUB</h1>
          <p className={styles.subtitle}>ELEVATING EDUCATION</p>
        </div>

        {/* Progress bar wrapper */}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {/* Status texts & percentage */}
        <div className={styles.statusRow}>
          <span className={styles.statusText}>{statusText}</span>
          <span className={styles.percentage}>{progress}%</span>
        </div>
      </div>

      <div className={styles.decorLines}>
        <div className={styles.line1} />
        <div className={styles.line2} />
      </div>
    </div>
  );
}
