const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

/**
 * Set up Socket.IO /notifications namespace for real-time notifications.
 * LMS users authenticate with their lmsToken to join their personal room.
 */
function setupNotificationSocket(io) {
  const notificationNamespace = io.of('/notifications');

  // Authentication middleware for Socket.IO
  notificationNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.LMS_JWT_SECRET);

      const credential = await prisma.lmsCredential.findUnique({
        where: { id: decoded.lmsCredentialId },
        select: {
          id: true,
          lmsUsername: true,
          isActive: true,
          generalUserId: true,
        },
      });

      if (!credential || !credential.isActive) {
        return next(new Error('Authentication error: Invalid or inactive credentials'));
      }

      socket.lmsUser = {
        credentialId: credential.id,
        generalUserId: credential.generalUserId,
        lmsUsername: credential.lmsUsername,
      };

      next();
    } catch (error) {
      next(new Error('Authentication error: ' + error.message));
    }
  });

  notificationNamespace.on('connection', (socket) => {
    const { credentialId, lmsUsername } = socket.lmsUser;

    console.log(`[Socket.IO] LMS user connected: ${lmsUsername} (${credentialId})`);

    // Join personal room
    socket.join(`user:${credentialId}`);

    // Handle mark-as-read
    socket.on('markRead', async (notificationId) => {
      try {
        await prisma.notification.updateMany({
          where: { id: notificationId, userId: credentialId },
          data: { isRead: true },
        });
        socket.emit('notificationRead', { id: notificationId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Handle mark-all-as-read
    socket.on('markAllRead', async () => {
      try {
        await prisma.notification.updateMany({
          where: { userId: credentialId, isRead: false },
          data: { isRead: true },
        });
        socket.emit('allNotificationsRead', { success: true });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark all notifications as read' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] LMS user disconnected: ${lmsUsername} (${reason})`);
    });
  });

  return notificationNamespace;
}

/**
 * Emit a notification to a specific user via Socket.IO.
 * @param {import('socket.io').Server} io - Socket.IO server instance
 * @param {string} userId - LMS credential ID of the user
 * @param {object} notification - Notification data
 */
function emitNotification(io, userId, notification) {
  if (io) {
    io.of('/notifications').to(`user:${userId}`).emit('notification', notification);
  }
}

module.exports = { setupNotificationSocket, emitNotification };
