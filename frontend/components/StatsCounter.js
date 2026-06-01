'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './StatsCounter.module.css';

function CounterItem({ icon, label, end, suffix = '+' }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = Math.ceil(end / 60);
    const interval = setInterval(() => {
      current += step;
      if (current >= end) {
        current = end;
        clearInterval(interval);
      }
      setCount(current);
    }, 25);
    return () => clearInterval(interval);
  }, [started, end]);

  return (
    <div className={styles.item} ref={ref}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.value}>
        {count.toLocaleString()}{suffix}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default function StatsCounter({ items }) {
  return (
    <div className={styles.wrapper}>
      <div className={`container ${styles.grid}`}>
        {items.map((item, i) => (
          <CounterItem key={i} {...item} />
        ))}
      </div>
    </div>
  );
}
