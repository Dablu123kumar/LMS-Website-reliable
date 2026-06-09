const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

/**
 * Generate Agora RTC Token for a given channel and user UID
 * @param {string} channelName - Name of the stream channel (usually liveClassId)
 * @param {number} uid - Positive integer user identifier
 * @param {boolean} isPublisher - True if host/instructor (publish tracks), false if student (subscribe only)
 */
const getAgoraToken = (channelName, uid, isPublisher) => {
  const appId = (process.env.AGORA_APP_ID || '').replace(/['"]/g, '');
  const appCertificate = (process.env.AGORA_APP_CERTIFICATE || '').replace(/['"]/g, '');

  if (!appId || !appCertificate) {
    console.warn('[Agora] WARNING: AGORA_APP_ID or AGORA_APP_CERTIFICATE not set in env. Agora calls will run in demo/testing mode.');
    return {
      token: 'demo-token',
      appId: appId || 'demo-app-id',
      uid,
      channelName,
      demoMode: true,
    };
  }

  const role = isPublisher ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expirationTimeInSeconds = 3600 * 2; // 2 hours duration
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );
    return {
      token,
      appId,
      uid,
      channelName,
      demoMode: false,
    };
  } catch (error) {
    console.error('[Agora] Token builder failed:', error);
    return {
      error: error.message,
      token: null,
    };
  }
};

module.exports = { getAgoraToken };
