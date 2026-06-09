const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

// Helper to parse cookies from Socket.IO handshake headers
function parseCookies(cookieString) {
  if (!cookieString) return {};
  return cookieString.split(';').reduce((acc, pair) => {
    const [key, value] = pair.split('=').map(c => c.trim());
    if (key && value) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

// In-memory registry of active live classrooms and participants
// { [liveClassId]: { [socketId]: { id, name, role, uid, socketId, micMuted, videoMuted, speakAllowed, handRaised } } }
const activeRooms = {};

function setupLiveClassSocket(io) {
  const liveClassNamespace = io.of('/live-class');

  // Authenticate user via lmsToken (student) or generalToken (admin/instructor)
  liveClassNamespace.use(async (socket, next) => {
    try {
      const auth = socket.handshake.auth || {};
      const query = socket.handshake.query || {};
      const cookies = parseCookies(socket.handshake.headers.cookie);
      
      const token = auth.token || query.token || cookies.lms_token || cookies.general_token;

      if (!token) {
        return next(new Error('Authentication error: No session token provided'));
      }

      let user = null;

      // Try decoding with LMS JWT secret first
      try {
        const decoded = jwt.verify(token, process.env.LMS_JWT_SECRET);
        const credential = await prisma.lmsCredential.findUnique({
          where: { id: decoded.lmsCredentialId },
          include: {
            generalUser: {
              select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true }
            }
          }
        });
        if (credential && credential.isActive) {
          user = {
            id: credential.id,
            generalUserId: credential.generalUserId,
            name: `${credential.generalUser.firstName} ${credential.generalUser.lastName}`,
            email: credential.generalUser.email,
            avatarUrl: credential.generalUser.avatarUrl,
            role: credential.generalUser.role, // 'USER'
          };
        }
      } catch (err) {
        // Fall back to general JWT secret
        try {
          const decoded = jwt.verify(token, process.env.GENERAL_JWT_SECRET);
          const generalUser = await prisma.generalUser.findUnique({
            where: { id: decoded.userId },
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true }
          });
          if (generalUser) {
            user = {
              id: generalUser.id,
              generalUserId: generalUser.id,
              name: `${generalUser.firstName} ${generalUser.lastName}`,
              email: generalUser.email,
              avatarUrl: generalUser.avatarUrl,
              role: generalUser.role, // 'ADMIN' or 'INSTRUCTOR'
            };
          }
        } catch (err2) {
          return next(new Error('Authentication error: Invalid session token'));
        }
      }

      if (!user) {
        return next(new Error('Authentication error: User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: ' + error.message));
    }
  });

  liveClassNamespace.on('connection', (socket) => {
    const user = socket.user;
    let currentRoomId = null;

    console.log(`[Socket.IO/LiveClass] Connected: ${user.name} (${user.role})`);

    // Handle joining room
    socket.on('join-classroom', async ({ liveClassId, uid }) => {
      const isHostRole = user.role === 'INSTRUCTOR' || user.role === 'ADMIN';

      if (!isHostRole) {
        try {
          const liveClass = await prisma.liveClass.findUnique({
            where: { id: liveClassId },
            include: {
              batch: {
                select: {
                  students: {
                    where: { id: user.generalUserId },
                    select: { id: true }
                  }
                }
              }
            }
          });

          if (!liveClass) {
            socket.emit('error', { message: 'Live class not found.' });
            return;
          }

          const isTargetedToAll = !liveClass.batchId && !liveClass.studentId;
          const isTargetedToMyBatch = !!(liveClass.batchId && liveClass.batch && liveClass.batch.students.length > 0);
          const isTargetedToMeIndividually = !!(liveClass.studentId && liveClass.studentId === user.generalUserId);

          if (!isTargetedToAll && !isTargetedToMyBatch && !isTargetedToMeIndividually) {
            socket.emit('error', { message: 'You are not authorized to join this live classroom.' });
            return;
          }
        } catch (err) {
          console.error('[Socket.IO/LiveClass] Error verifying room authorization:', err);
          socket.emit('error', { message: 'Internal server error verifying classroom authorization.' });
          return;
        }
      }

      currentRoomId = liveClassId;
      socket.join(liveClassId);

      if (!activeRooms[liveClassId]) {
        activeRooms[liveClassId] = {};
      }

      // Check if user is instructor / admin to give automatic speaking rights

      const participant = {
        id: user.id,
        name: user.name,
        role: user.role,
        uid: parseInt(uid) || 0,
        socketId: socket.id,
        micMuted: false,
        videoMuted: false,
        speakAllowed: isHostRole, // Instructors speak instantly, students need permission
        handRaised: false,
      };

      activeRooms[liveClassId][socket.id] = participant;

      console.log(`[Socket.IO/LiveClass] ${user.name} joined room ${liveClassId} with RTC UID ${uid}`);

      // Emit active participant list to the joining user
      socket.emit('classroom-users', Object.values(activeRooms[liveClassId]));

      // Notify other users in the room
      socket.to(liveClassId).emit('user-joined', participant);
    });

    // Handle toggling local camera/mic states
    socket.on('toggle-media', ({ micMuted, videoMuted }) => {
      if (!currentRoomId || !activeRooms[currentRoomId]?.[socket.id]) return;

      const p = activeRooms[currentRoomId][socket.id];
      p.micMuted = !!micMuted;
      p.videoMuted = !!videoMuted;

      // Broadcast changes
      socket.to(currentRoomId).emit('user-media-updated', {
        socketId: socket.id,
        uid: p.uid,
        micMuted: p.micMuted,
        videoMuted: p.videoMuted
      });
    });

    // Handle student raising hand
    socket.on('raise-hand', () => {
      if (!currentRoomId || !activeRooms[currentRoomId]?.[socket.id]) return;

      const p = activeRooms[currentRoomId][socket.id];
      p.handRaised = true;

      // Notify the room (especially moderators)
      liveClassNamespace.to(currentRoomId).emit('user-updated', p);
    });

    // Handle moderator granting speak permission
    socket.on('moderator-grant-speaking', ({ targetSocketId }) => {
      if (!currentRoomId || !activeRooms[currentRoomId]?.[socket.id]) return;

      const caller = activeRooms[currentRoomId][socket.id];
      if (caller.role !== 'INSTRUCTOR' && caller.role !== 'ADMIN') return; // Only mods

      const target = activeRooms[currentRoomId]?.[targetSocketId];
      if (!target) return;

      target.speakAllowed = true;
      target.handRaised = false; // Lower hand

      // Notify target client to initiate speaking streams
      liveClassNamespace.to(targetSocketId).emit('speaking-rights-changed', { allowed: true });
      
      // Update room participant list
      liveClassNamespace.to(currentRoomId).emit('user-updated', target);
      console.log(`[Socket.IO/LiveClass] Moderator ${caller.name} granted speak rights to ${target.name}`);
    });

    // Handle moderator revoking speak permission
    socket.on('moderator-revoke-speaking', ({ targetSocketId }) => {
      if (!currentRoomId || !activeRooms[currentRoomId]?.[socket.id]) return;

      const caller = activeRooms[currentRoomId][socket.id];
      if (caller.role !== 'INSTRUCTOR' && caller.role !== 'ADMIN') return;

      const target = activeRooms[currentRoomId]?.[targetSocketId];
      if (!target) return;

      target.speakAllowed = false;
      target.handRaised = false;

      // Notify target client to disconnect streams
      liveClassNamespace.to(targetSocketId).emit('speaking-rights-changed', { allowed: false });
      
      // Update room participant list
      liveClassNamespace.to(currentRoomId).emit('user-updated', target);
      console.log(`[Socket.IO/LiveClass] Moderator ${caller.name} revoked speak rights from ${target.name}`);
    });

    // Handle moderator muting student camera/mic remotely
    socket.on('moderator-mute-track', ({ targetSocketId, trackType }) => {
      if (!currentRoomId || !activeRooms[currentRoomId]?.[socket.id]) return;

      const caller = activeRooms[currentRoomId][socket.id];
      if (caller.role !== 'INSTRUCTOR' && caller.role !== 'ADMIN') return;

      const target = activeRooms[currentRoomId]?.[targetSocketId];
      if (!target) return;

      // Notify target client to forcefully disable track
      liveClassNamespace.to(targetSocketId).emit('force-mute-track', { trackType });
      
      if (trackType === 'audio') target.micMuted = true;
      if (trackType === 'video') target.videoMuted = true;

      liveClassNamespace.to(currentRoomId).emit('user-updated', target);
      console.log(`[Socket.IO/LiveClass] Moderator ${caller.name} muted student ${target.name}'s ${trackType}`);
    });

    // Handle instructor ending the session
    socket.on('instructor-ended-session', async () => {
      if (!currentRoomId || !activeRooms[currentRoomId]?.[socket.id]) return;

      const caller = activeRooms[currentRoomId][socket.id];
      if (caller.role !== 'INSTRUCTOR' && caller.role !== 'ADMIN') return;

      try {
        await prisma.liveClass.update({
          where: { id: currentRoomId },
          data: {
            status: 'COMPLETED',
            endedAt: new Date(),
          },
        });
        console.log(`[Socket.IO/LiveClass] Database updated: Class ${currentRoomId} set to COMPLETED.`);
      } catch (dbErr) {
        console.error(`[Socket.IO/LiveClass] Error ending session in database:`, dbErr);
      }

      // Broadcast to all participants in the room
      liveClassNamespace.to(currentRoomId).emit('class-ended');
    });

    // Handle chat messaging
    socket.on('send-message', ({ text }) => {
      if (!currentRoomId || !activeRooms[currentRoomId]?.[socket.id]) return;

      const sender = activeRooms[currentRoomId][socket.id];
      const message = {
        id: Math.random().toString(36).substring(2, 9),
        senderName: sender.name,
        senderRole: sender.role,
        senderSocketId: socket.id,
        text,
        timestamp: new Date().toISOString(),
      };

      liveClassNamespace.to(currentRoomId).emit('new-message', message);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket.IO/LiveClass] Disconnected: ${user.name}`);
      if (currentRoomId && activeRooms[currentRoomId]?.[socket.id]) {
        const participant = activeRooms[currentRoomId][socket.id];
        delete activeRooms[currentRoomId][socket.id];

        // Notify room members
        socket.to(currentRoomId).emit('user-left', {
          socketId: socket.id,
          uid: participant.uid,
        });

        // Clean up empty rooms
        if (Object.keys(activeRooms[currentRoomId]).length === 0) {
          delete activeRooms[currentRoomId];
        }
      }
    });
  });

  return liveClassNamespace;
}

module.exports = { setupLiveClassSocket };
