'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './VideoPlayer.module.css';

export default function VideoPlayer({ src, title, poster }) {
  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef(null);

  const formatTime = (t) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) videoRef.current.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const toggleFullscreen = () => {
    const wrapper = videoRef.current?.parentElement;
    if (!wrapper) return;
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  const handleContextMenu = (e) => e.preventDefault();

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={styles.wrapper}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={src || ''}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        onContextMenu={handleContextMenu}
        controlsList="nodownload"
        disablePictureInPicture
        playsInline
        onClick={togglePlay}
      />

      {/* Play overlay when paused */}
      {!playing && (
        <button className={styles.playOverlay} onClick={togglePlay}>
          <span className={styles.playIcon}>▶</span>
        </button>
      )}

      {/* Controls */}
      <div className={`${styles.controls} ${showControls ? styles.controlsVisible : ''}`}>
        {/* Progress bar */}
        <div className={styles.progress} ref={progressRef} onClick={handleProgressClick}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
        </div>

        <div className={styles.controlsRow}>
          {/* Left */}
          <div className={styles.controlsLeft}>
            <button className={styles.controlBtn} onClick={togglePlay}>
              {playing ? '⏸' : '▶️'}
            </button>
            <button className={styles.controlBtn} onClick={toggleMute}>
              {muted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
            />
            <span className={styles.time}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right */}
          <div className={styles.controlsRight}>
            <button className={styles.controlBtn} onClick={toggleFullscreen}>
              {fullscreen ? '⊟' : '⛶'}
            </button>
          </div>
        </div>
      </div>

      {/* No video placeholder */}
      {!src && (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>🎬</span>
          <p>Select a lesson to start watching</p>
        </div>
      )}
    </div>
  );
}
