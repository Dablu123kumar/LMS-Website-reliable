'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { notifications as mockNotifications } from '@/lib/data';
import styles from './page.module.css';

const iconMap = {
  LIVE_REMINDER: '📡',
  LIVE_STARTED: '📡',
  RECORDING_UPLOADED: '🎥',
  ANNOUNCEMENT: '📢',
};

const typeMap = {
  LIVE_REMINDER: 'live-class',
  LIVE_STARTED: 'live-class',
  RECORDING_UPLOADED: 'recording',
  ANNOUNCEMENT: 'announcement',
};

const iconBgMap = {
  'live-class': styles.notifIconLive,
  recording: styles.notifIconRecording,
  announcement: styles.notifIconAnnouncement,
  progress: styles.notifIconProgress,
  achievement: styles.notifIconAchievement,
  update: styles.notifIconUpdate,
  reminder: styles.notifIconReminder,
  system: styles.notifIconSystem,
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications(1);
      if (res?.data?.notifications) {
        // Map DB notifications to UI structure
        const mapped = res.data.notifications.map((n) => ({
          id: n.id,
          type: typeMap[n.type] || 'announcement',
          icon: iconMap[n.type] || '📢',
          title: n.title,
          message: n.message,
          time: n.sentAt,
          read: n.isRead,
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('API error on notifications, using mock:', err);
      // Map mock data structure
      const mappedMock = mockNotifications.map((n, i) => ({
        id: n.id || `mock-${i}`,
        type: n.type || 'announcement',
        icon: n.icon || '📢',
        title: n.title,
        message: n.message,
        time: n.time,
        read: n.read,
      }));
      setNotifications(mappedMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const toggleRead = async (id) => {
    // If it's a mock notification, toggle locally
    if (String(id).startsWith('mock-') || String(id).startsWith('n')) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
      );
      return;
    }

    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notif of unread) {
      if (!String(notif.id).startsWith('mock-') && !String(notif.id).startsWith('n')) {
        try {
          await api.markNotificationRead(notif.id);
        } catch (e) {}
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Notifications</h1>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={markAllRead}>
            ✓ Mark All as Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All<span className={styles.tabCount}>({notifications.length})</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'unread' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread<span className={styles.tabCount}>({unreadCount})</span>
        </button>
      </div>

      {/* Notification List */}
      {filtered.length > 0 ? (
        <div className={styles.notifList}>
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`${styles.notifItem} ${
                !notif.read ? styles.notifItemUnread : ''
              }`}
              onClick={() => toggleRead(notif.id)}
            >
              <div
                className={`${styles.notifIconWrapper} ${
                  iconBgMap[notif.type] || ''
                }`}
              >
                {notif.icon}
              </div>
              <div className={styles.notifContent}>
                <div className={styles.notifTitle}>{notif.title}</div>
                <div className={styles.notifMessage}>{notif.message}</div>
              </div>
              <div className={styles.notifMeta}>
                <span className={styles.notifTime}>{timeAgo(notif.time)}</span>
                {!notif.read && <span className={styles.unreadDot} />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔔</span>
          <h3 className={styles.emptyTitle}>All caught up!</h3>
          <p className={styles.emptyText}>
            No unread notifications at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
