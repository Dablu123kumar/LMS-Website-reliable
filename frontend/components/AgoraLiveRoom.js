'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import styles from './AgoraLiveRoom.module.css';

// Keep track of any active leave promise for a given user UID to prevent UID conflict on fast remounts
const activeLeaves = new Map();

/**
 * Custom in-app video room component using Agora RTC Web SDK.
 * @param {string} channelName - Name of the channel (liveClassId)
 * @param {string} token - Temporary authorization token from backend
 * @param {string} appId - Agora App ID
 * @param {number} uid - Positive integer user UID
 * @param {boolean} isHost - True if admin/instructor (pushes video), false if student (watches only)
 * @param {function} onLeave - Callback function when user exits the stream room
 */
export default function AgoraLiveRoom({ channelName, token, appId, uid, isHost, onLeave }) {
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);
  const [initError, setInitError] = useState(null);

  // Synchronization states
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'users'
  const [chatInput, setChatInput] = useState('');
  const [allowedToSpeak, setAllowedToSpeak] = useState(isHost);
  const [handRaised, setHandRaised] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const localVideoRef = useRef(null);
  const rtcClientRef = useRef(null);
  const socketRef = useRef(null);

  const micMutedRef = useRef(micMuted);
  const videoMutedRef = useRef(videoMuted);
  const localAudioTrackRef = useRef(localAudioTrack);
  const localVideoTrackRef = useRef(localVideoTrack);
  const sessionEndedRef = useRef(false);
  const handleLeaveRef = useRef(null);

  useEffect(() => {
    micMutedRef.current = micMuted;
    videoMutedRef.current = videoMuted;
    localAudioTrackRef.current = localAudioTrack;
    localVideoTrackRef.current = localVideoTrack;
  }, [micMuted, videoMuted, localAudioTrack, localVideoTrack]);

  // Socket.IO Room Coordination
  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') 
      : 'http://localhost:5000';

    const socket = io(`${apiBaseUrl}/live-class`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to live classroom server room.');
      socket.emit('join-classroom', { liveClassId: channelName, uid });
    });

    socket.on('classroom-users', (users) => {
      setParticipants(users);
    });

    socket.on('user-joined', (user) => {
      setParticipants((prev) => {
        if (prev.find((u) => u.socketId === user.socketId)) return prev;
        return [...prev, user];
      });
    });

    socket.on('user-left', ({ socketId, uid: leftUid }) => {
      setParticipants((prev) => prev.filter((u) => u.socketId !== socketId));
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== leftUid));
    });

    socket.on('user-updated', (updatedUser) => {
      setParticipants((prev) =>
        prev.map((u) => (u.socketId === updatedUser.socketId ? updatedUser : u))
      );
    });

    socket.on('user-media-updated', ({ socketId, micMuted: isMicMuted, videoMuted: isVideoMuted }) => {
      setParticipants((prev) =>
        prev.map((u) =>
          u.socketId === socketId ? { ...u, micMuted: isMicMuted, videoMuted: isVideoMuted } : u
        )
      );
    });

    socket.on('speaking-rights-changed', ({ allowed }) => {
      setAllowedToSpeak(allowed);
      if (!allowed) {
        setHandRaised(false);
      }
    });

    socket.on('force-mute-track', ({ trackType }) => {
      if (trackType === 'audio') {
        setMicMuted(true);
        if (localAudioTrackRef.current) {
          localAudioTrackRef.current.setEnabled(false);
        }
        socket.emit('toggle-media', { micMuted: true, videoMuted: videoMutedRef.current });
      } else if (trackType === 'video') {
        setVideoMuted(true);
        if (localVideoTrackRef.current) {
          localVideoTrackRef.current.setEnabled(false);
        }
        socket.emit('toggle-media', { micMuted: micMutedRef.current, videoMuted: true });
      }
    });

    socket.on('new-message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('class-ended', () => {
      console.log('[Socket] Live class session ended.');
      sessionEndedRef.current = true;
      if (!isHost) {
        alert('The instructor has ended this live session.');
      }
      if (handleLeaveRef.current) {
        handleLeaveRef.current(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [channelName, uid]);

  // Agora Client Setup
  useEffect(() => {
    let active = true;
    let client = null;

    async function initRTC() {
      try {
        if (!appId || appId === 'demo-app-id') {
          throw new Error('AGORA_APP_ID_NOT_CONFIGURED');
        }

        // Wait for any pending leave operation for this user UID to complete first!
        if (activeLeaves.has(uid)) {
          console.log(`[Agora] Waiting for pending leave to complete for UID ${uid}...`);
          await activeLeaves.get(uid);
        }

        if (!active) return;

        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        if (!active) return;
        AgoraRTC.setLogLevel(3);

        client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
        if (!active) return;
        rtcClientRef.current = client;

        // Set role based on initial host/student status
        await client.setClientRole(isHost ? 'host' : 'audience');
        if (!active) {
          await client.leave();
          return;
        }

        client.on('connection-state-change', (curState) => {
          if (active) setConnectionState(curState);
        });

        // Subscribing to publisher streams (for students and co-hosts)
        client.on('user-published', async (user, mediaType) => {
          if (!active) return;
          await client.subscribe(user, mediaType);

          if (active) {
            if (mediaType === 'video') {
              setRemoteUsers((prev) => {
                if (prev.find((u) => u.uid === user.uid)) return prev;
                return [...prev, user];
              });
            }
            if (mediaType === 'audio') {
              user.audioTrack.play();
              setIsAudioSpeaking(true);
            }
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (active && mediaType === 'video') {
            setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          }
          if (mediaType === 'audio') {
            setIsAudioSpeaking(false);
          }
        });

        client.on('user-left', (user) => {
          if (active) {
            setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
            setIsAudioSpeaking(false);
          }
        });

        // Join channel
        const clientUid = await client.join(appId, channelName, token, uid);
        if (!active) {
          if (!activeLeaves.has(uid)) {
            const leavePromise = client.leave().then(() => {
              activeLeaves.delete(uid);
            }).catch(() => {
              activeLeaves.delete(uid);
            });
            activeLeaves.set(uid, leavePromise);
            await leavePromise;
          }
          return;
        }
        console.log(`[Agora] Joined channel: ${channelName} with UID: ${clientUid}`);
        
        if (active) setJoined(true);
      } catch (err) {
        console.error('[Agora] Initialization failed:', err);
        if (active) {
          const errMsg = err.message || String(err);
          const errName = err.name || '';
          
          if (errMsg.includes('AGORA_APP_ID_NOT_CONFIGURED') || errMsg.includes('invalid vendor key') || errMsg.includes('CAN_NOT_GET_GATEWAY_SERVER')) {
            setInitError('Agora credentials are not configured or are invalid. Please configure the AGORA_APP_ID and AGORA_APP_CERTIFICATE variables in your backend .env file to run live classes.');
          } else if (errName === 'NotAllowedError' || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('Permission dismissed') || errMsg.includes('NotAllowedError')) {
            setInitError('Microphone or Camera access was denied by your browser. Please click the camera/microphone lock icon in your browser address bar, reset permissions, reload the page, and allow access to start streaming.');
          } else if (errMsg.includes('UID_CONFLICT') || errMsg.includes('uid conflict')) {
            setInitError('A connection conflict occurred because this session is already active (common during fast hot-reloads). Please click "Exit Classroom" and try joining again in a few seconds.');
          } else {
            setInitError(errMsg);
          }
        }
      }
    }

    initRTC();

    return () => {
      active = false;
      async function leaveChannel() {
        const targetClient = client || rtcClientRef.current;
        if (targetClient) {
          targetClient.removeAllListeners();
          const leavePromise = targetClient.leave().then(() => {
            console.log(`[Agora] Safely left and closed stream channel for UID ${uid}.`);
            activeLeaves.delete(uid);
          }).catch((err) => {
            console.error(`[Agora] Error leaving channel for UID ${uid}:`, err);
            activeLeaves.delete(uid);
          });
          activeLeaves.set(uid, leavePromise);
          await leavePromise;
        }
      }
      leaveChannel();
    };
  }, [channelName, token, appId, uid, isHost]);

  // Dynamic stream promotion / demotion hook
  useEffect(() => {
    let active = true;
    let localAudio = null;
    let localVideo = null;

    async function manageStream() {
      const client = rtcClientRef.current;
      if (!client || !joined) return;

      try {
        if (allowedToSpeak) {
          await client.setClientRole('host');
          
          const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
          localAudio = await AgoraRTC.createMicrophoneAudioTrack();
          localVideo = await AgoraRTC.createCameraVideoTrack();

          if (!active) {
            localAudio.close();
            localVideo.close();
            return;
          }

          // Initial state matching our local toggles
          await localAudio.setEnabled(!micMuted);
          await localVideo.setEnabled(!videoMuted);

          setLocalAudioTrack(localAudio);
          setLocalVideoTrack(localVideo);

          // Render local camera stream preview
          if (localVideoRef.current) {
            localVideo.play(localVideoRef.current);
          }

          await client.publish([localAudio, localVideo]);
          console.log('[Agora] Dynamically published local streaming tracks.');

          // Broadcast active media states
          if (socketRef.current) {
            socketRef.current.emit('toggle-media', { micMuted, videoMuted });
          }
        } else {
          // Revert to subscriber audience
          if (localAudioTrackRef.current) {
            localAudioTrackRef.current.stop();
            localAudioTrackRef.current.close();
            setLocalAudioTrack(null);
          }
          if (localVideoTrackRef.current) {
            localVideoTrackRef.current.stop();
            localVideoTrackRef.current.close();
            setLocalVideoTrack(null);
          }
          await client.setClientRole('audience');
          console.log('[Agora] Revoked speaking tracks, role changed to Audience.');
        }
      } catch (err) {
        console.error('[Agora] Dynamic stream error:', err);
      }
    }

    manageStream();

    return () => {
      active = false;
      if (localAudio) {
        localAudio.stop();
        localAudio.close();
      }
      if (localVideo) {
        localVideo.stop();
        localVideo.close();
      }
    };
  }, [allowedToSpeak, joined]);

  // Leave classroom callback
  const handleLeave = async (wasEnded = false) => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      }
      if (rtcClientRef.current) {
        rtcClientRef.current.removeAllListeners();
        await rtcClientRef.current.leave();
        console.log('[Agora] Left channel via Exit button.');
      }
    } catch (err) {
      console.error('[Agora] Error during leave:', err);
    }
    setJoined(false);
    setRemoteUsers([]);
    setLocalAudioTrack(null);
    setLocalVideoTrack(null);
    setConnectionState('DISCONNECTED');
    setInitError(null);
    setParticipants([]);
    setChatMessages([]);
    setAllowedToSpeak(isHost);
    setHandRaised(false);
    if (onLeave) onLeave(wasEnded || sessionEndedRef.current);
  };

  handleLeaveRef.current = handleLeave;

  // Triggered by "Exit Classroom" button click
  const exitClassroom = () => {
    if (isHost) {
      const end = confirm('Do you want to end this live session permanently for all students?');
      if (end) {
        sessionEndedRef.current = true;
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('instructor-ended-session');
        } else {
          handleLeave(true);
        }
      } else {
        handleLeave(false);
      }
    } else {
      handleLeave(false);
    }
  };

  // Toggle local mic
  const toggleMic = async () => {
    const nextMuted = !micMuted;
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!nextMuted);
    }
    setMicMuted(nextMuted);
    if (socketRef.current) {
      socketRef.current.emit('toggle-media', { micMuted: nextMuted, videoMuted });
    }
  };

  // Toggle local camera
  const toggleVideo = async () => {
    const nextMuted = !videoMuted;
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!nextMuted);
    }
    setVideoMuted(nextMuted);
    if (socketRef.current) {
      socketRef.current.emit('toggle-media', { micMuted, videoMuted: nextMuted });
    }
  };

  // Moderator operations
  const handleGrantSpeaking = (targetSocketId) => {
    if (socketRef.current) {
      socketRef.current.emit('moderator-grant-speaking', { targetSocketId });
    }
  };

  const handleRevokeSpeaking = (targetSocketId) => {
    if (socketRef.current) {
      socketRef.current.emit('moderator-revoke-speaking', { targetSocketId });
    }
  };

  const handleMuteTrack = (targetSocketId, trackType) => {
    if (socketRef.current) {
      socketRef.current.emit('moderator-mute-track', { targetSocketId, trackType });
    }
  };

  // Student hand raising
  const handleRaiseHand = () => {
    setHandRaised(true);
    if (socketRef.current) {
      socketRef.current.emit('raise-hand');
    }
  };

  // Message chat actions
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (socketRef.current) {
      socketRef.current.emit('send-message', { text: chatInput });
      setChatInput('');
    }
  };

  const getStatusTextClass = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return styles.statusConnected;
      case 'CONNECTING':
      case 'RECONNECTING':
        return styles.statusConnecting;
      default:
        return styles.statusDisconnected;
    }
  };

  if (initError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorScreen}>
          <span className={styles.errorIcon}>⚠️</span>
          <h4 className={styles.errorTitle}>Classroom Connection Failed</h4>
          <p className={styles.errorSubtitle}>{initError}</p>
          <button onClick={handleLeave} className={styles.errorActionBtn}>
            Exit Classroom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.classroomGrid} ${!sidebarVisible ? styles.classroomGridCollapsed : ''} ${isFullscreen ? styles.fullscreenOverlay : ''}`}>
      {/* Left Stream Screen Stage */}
      <div className={styles.streamPanel}>
        {/* Upper Status Layer */}
        <div className={styles.infoOverlay}>
          <div className={styles.liveBadge}>
            <span className={styles.liveBadgeDot} />
            <span>🔴 In-App Live</span>
          </div>
          <div className={styles.participantCount}>
            👥 {participants.length} Active Classroom
          </div>
        </div>

        {/* Main Streaming Display */}
        <div className={styles.mainStage}>
          {allowedToSpeak ? (
            <div className={styles.localVideoContainer}>
              <div ref={localVideoRef} className={styles.localVideo} />
              {videoMuted && (
                <div className={styles.waitingScreen}>
                  <span className={styles.pulsatingIcon}>🎥</span>
                  <h4 className={styles.waitingTitle}>Camera is Off</h4>
                  <p className={styles.waitingSubtitle}>Students can still hear your microphone.</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.remoteVideoContainer}>
              {remoteUsers.length > 0 ? (
                remoteUsers.map((user) => (
                  <AgoraRemoteVideoPlayer key={user.uid} user={user} />
                ))
              ) : (
                <div className={styles.waitingScreen}>
                  <span className={styles.pulsatingIcon}>📡</span>
                  <h4 className={styles.waitingTitle}>Waiting for Instructor</h4>
                  <p className={styles.waitingSubtitle}>
                    The live class will begin automatically once the instructor publishes their camera stream.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio Waveform Indicator */}
        {!allowedToSpeak && remoteUsers.length > 0 && (
          <div className={`${styles.waveformIndicator} ${isAudioSpeaking ? styles.isAudioActive : ''}`}>
            <span className={styles.waveBar} />
            <span className={styles.waveBar} />
            <span className={styles.waveBar} />
            <span className={styles.waveBar} />
          </div>
        )}

        {/* Connection status pills */}
        <div className={styles.connectionStatus}>
          Status: <span className={getStatusTextClass()}>{connectionState}</span>
        </div>

        {/* Bottom media controller overlay */}
        <div className={styles.controlBar}>
          {allowedToSpeak && (
            <>
              <button
                onClick={toggleMic}
                className={`${styles.controlBtn} ${micMuted ? styles.controlBtnActive : ''}`}
                title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {micMuted ? '🔇' : '🎙️'}
              </button>
              <button
                onClick={toggleVideo}
                className={`${styles.controlBtn} ${videoMuted ? styles.controlBtnActive : ''}`}
                title={videoMuted ? 'Start Video' : 'Stop Video'}
              >
                {videoMuted ? '🚫' : '📹'}
              </button>
            </>
          )}

          {!isHost && !allowedToSpeak && (
            <div className={styles.studentControls}>
              {handRaised ? (
                <div className={styles.handRaisedIndicator}>
                  <span>🖐️</span> Hand Raised
                </div>
              ) : (
                <button onClick={handleRaiseHand} className={styles.raiseHandBtn}>
                  <span>🖐️</span> Raise Hand
                </button>
              )}
            </div>
          )}

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={`${styles.controlBtn} ${!sidebarVisible ? styles.controlBtnActive : ''}`}
            title={sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            💬
          </button>

          {/* Toggle Fullscreen / Overlay Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`${styles.controlBtn}`}
            title={isFullscreen ? 'Zoom Out to Original Screen' : 'Zoom to Full Screen'}
          >
            {isFullscreen ? '↙️' : '↗️'}
          </button>

          <button onClick={exitClassroom} className={`${styles.controlBtn} ${styles.leaveBtn}`}>
            <span>❌</span>
            <span>{isHost ? 'End Session' : 'Leave Class'}</span>
          </button>
        </div>
      </div>

      {/* Right Collaboration Sidebar Panel */}
      {sidebarVisible && (
        <div className={styles.sidebarPanel}>
          <div className={styles.sidebarTabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              💬 Chat
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Classmates ({participants.length})
            </button>
          </div>

          <div className={styles.sidebarContent}>
            {activeTab === 'chat' && (
              <div className={styles.chatTab}>
                <div className={styles.messageList}>
                  {chatMessages.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                      Welcome to Live Chat! Feel free to ask questions.
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMsgHost = msg.senderRole === 'INSTRUCTOR' || msg.senderRole === 'ADMIN';
                      return (
                        <div
                          key={msg.id}
                          className={`${styles.message} ${isMsgHost ? styles.messageInstructor : ''}`}
                        >
                          <div className={styles.msgHeader}>
                            <span className={styles.msgSender}>{msg.senderName}</span>
                            <span className={`${styles.msgRole} ${isMsgHost ? styles.msgRoleInstructor : ''}`}>
                              {isMsgHost ? 'Instructor' : 'Student'}
                            </span>
                          </div>
                          <div className={styles.msgText}>{msg.text}</div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                            <span className={styles.msgTime}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <form onSubmit={handleSendMessage} className={styles.chatForm}>
                  <input
                    type="text"
                    className={styles.chatInput}
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className={styles.chatSendBtn}>
                    Send
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'users' && (
              <div className={styles.usersTab}>
                {participants.map((p) => {
                  const isUserHost = p.role === 'INSTRUCTOR' || p.role === 'ADMIN';
                  const isMe = p.uid === uid;
                  
                  return (
                    <div key={p.socketId} className={styles.userRow}>
                      <div className={styles.userInfo}>
                        <span className={styles.userDisplayName}>
                          {p.name} {isMe && <span className={styles.userSelfTag}>You</span>}
                        </span>
                        <div className={styles.userSubDetails}>
                          <span className={`${styles.userRoleBadge} ${isUserHost ? styles.userRoleBadgeInstructor : ''}`}>
                            {isUserHost ? 'Instructor' : 'Student'}
                          </span>
                          {p.speakAllowed && (
                            <span className={styles.mediaStatusDot}>
                              {p.micMuted ? '🔇' : '🎙️'} {p.videoMuted ? '🚫' : '📹'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.userActions}>
                        {p.handRaised && <span className={styles.handRaisedBadge}>🖐️ Hand</span>}
                        
                        {/* Moderator Controls */}
                        {isHost && !isUserHost && (
                          <>
                            {p.speakAllowed ? (
                              <>
                                <button
                                  onClick={() => handleMuteTrack(p.socketId, 'audio')}
                                  className={`${styles.actionIconBtn} ${p.micMuted ? styles.actionIconBtnActive : ''}`}
                                  title="Mute Mic"
                                  disabled={p.micMuted}
                                >
                                  🎙️
                                </button>
                                <button
                                  onClick={() => handleMuteTrack(p.socketId, 'video')}
                                  className={`${styles.actionIconBtn} ${p.videoMuted ? styles.actionIconBtnActive : ''}`}
                                  title="Mute Camera"
                                  disabled={p.videoMuted}
                                >
                                  📹
                                </button>
                                <button
                                  onClick={() => handleRevokeSpeaking(p.socketId)}
                                  className={`${styles.actionTextBtn} ${styles.actionTextBtnSecondary}`}
                                  title="Revoke Speaking Rights"
                                >
                                  Revoke
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleGrantSpeaking(p.socketId)}
                                className={styles.actionTextBtn}
                                title="Grant Speaking Rights"
                              >
                                Allow Speak
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Dedicated sub-component to handle binding/unbinding of remote video tracks to the DOM.
 */
function AgoraRemoteVideoPlayer({ user }) {
  const ref = useRef(null);

  useEffect(() => {
    let active = true;

    if (user.videoTrack && ref.current) {
      user.videoTrack.play(ref.current);
    }

    return () => {
      active = false;
      if (user.videoTrack) {
        user.videoTrack.stop();
      }
    };
  }, [user]);

  return <div ref={ref} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
}
