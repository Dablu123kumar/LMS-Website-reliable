const jwt = require('jsonwebtoken');

const VIDEO_TOKEN_SECRET = process.env.LMS_JWT_SECRET || 'lms-video-secret';
const VIDEO_TOKEN_EXPIRY = '2h';

/**
 * Generate a signed URL token for video streaming.
 * The token embeds the recording ID, user ID, and expiry.
 * @param {string} recordingId - The recording ID
 * @param {string} userId - The authenticated LMS user ID
 * @returns {{ signedUrl: string, expiresAt: Date }}
 */
function createSignedVideoUrl(recordingId, userId) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  const token = jwt.sign(
    {
      recordingId,
      userId,
      type: 'video_stream',
    },
    VIDEO_TOKEN_SECRET,
    { expiresIn: VIDEO_TOKEN_EXPIRY }
  );

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
  const signedUrl = `${baseUrl}/api/v1/video/play?token=${token}`;

  return {
    signedUrl,
    token,
    expiresAt,
  };
}

/**
 * Verify a signed video URL token.
 * @param {string} token - The JWT token from the signed URL
 * @returns {{ recordingId: string, userId: string } | null}
 */
function verifySignedVideoUrl(token) {
  try {
    const decoded = jwt.verify(token, VIDEO_TOKEN_SECRET);
    if (decoded.type !== 'video_stream') {
      return null;
    }
    return {
      recordingId: decoded.recordingId,
      userId: decoded.userId,
    };
  } catch (err) {
    return null;
  }
}

module.exports = { createSignedVideoUrl, verifySignedVideoUrl };
