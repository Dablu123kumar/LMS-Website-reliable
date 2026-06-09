'use client';

import { useState, useEffect } from 'react';
import styles from './Typewriter.module.css';

export default function Typewriter({ words = [], typeSpeed = 80, eraseSpeed = 40, delay = 2500 }) {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;

    let timer;
    const fullWord = words[currentWordIdx];

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, eraseSpeed);
    } else {
      timer = setTimeout(() => {
        setCurrentText((prev) => fullWord.slice(0, prev.length + 1));
      }, typeSpeed);
    }

    if (!isDeleting && currentText === fullWord) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentWordIdx((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIdx, words, typeSpeed, eraseSpeed, delay]);

  return (
    <span className={styles.typewriterWrapper}>
      <span className={styles.typedText}>{currentText}</span>
      <span className={styles.cursor}>|</span>
    </span>
  );
}
