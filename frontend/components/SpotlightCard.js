'use client';

import { useRef, useState } from 'react';
import styles from './SpotlightCard.module.css';

export default function SpotlightCard({ children, className = '', style = {}, glowColor = 'rgba(99, 102, 241, 0.08)', borderGlowColor = 'rgba(99, 102, 241, 0.35)' }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  const handleMouseEnter = () => setIsFocused(true);
  const handleMouseLeave = () => setIsFocused(false);

  return (
    <div
      ref={cardRef}
      className={`${styles.spotlightCard} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        '--mouse-x': `${coords.x}px`,
        '--mouse-y': `${coords.y}px`,
        '--glow-color': glowColor,
        '--border-glow-color': borderGlowColor
      }}
    >
      {/* Background radial spotlight */}
      <div className={`${styles.glowOverlay} ${isFocused ? styles.glowVisible : ''}`} />
      
      {/* Border outline spotlight */}
      <div className={`${styles.borderOverlay} ${isFocused ? styles.borderVisible : ''}`} />

      {/* Content wrapper */}
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );
}
