const prisma = require('../utils/prismaClient');
const { createSignedVideoUrl, verifySignedVideoUrl } = require('../utils/signedUrl');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/v1/video/stream/:id
 * Get a signed streaming URL for a recording (lmsAuth required)
 * Verifies the user is enrolled in the course that owns this recording.
 */
async function getSignedStreamUrl(req, res, next) {
  try {
    const { id } = req.params;
    const credentialId = req.lmsUser.credentialId;

    // Find the recording
    const recording = await prisma.recording.findUnique({
      where: { id },
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
    });

    if (!recording) {
      return errorResponse(res, 'Recording not found.', 404);
    }

    if (recording.status !== 'READY') {
      return errorResponse(res, 'Recording is not yet available for streaming.', 400);
    }

    // Verify enrollment in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: recording.courseId,
        lmsCredentialId: credentialId,
      },
    });

    if (!enrollment) {
      return errorResponse(res, 'You are not enrolled in this course.', 403);
    }

    // Generate signed URL with 2hr expiry
    const { signedUrl, token, expiresAt } = createSignedVideoUrl(recording.id, credentialId);

    return successResponse(res, 'Signed streaming URL generated.', {
      recordingId: recording.id,
      title: recording.title,
      courseTitle: recording.course.title,
      durationSeconds: recording.durationSeconds,
      signedUrl,
      token,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/video/play?token=xxx
 * Verify signed URL and redirect to actual video (or return video URL)
 */
async function playVideo(req, res, next) {
  try {
    const { token } = req.query;

    if (!token) {
      return errorResponse(res, 'Video token is required.', 400);
    }

    const decoded = verifySignedVideoUrl(token);

    if (!decoded) {
      return errorResponse(res, 'Invalid or expired video token.', 401);
    }

    const recording = await prisma.recording.findUnique({
      where: { id: decoded.recordingId },
    });

    if (!recording) {
      return errorResponse(res, 'Recording not found.', 404);
    }

    // In production, you would redirect to the actual video storage URL
    // For now, return the video URL
    return successResponse(res, 'Video URL verified.', {
      videoUrl: recording.videoUrl,
      title: recording.title,
      durationSeconds: recording.durationSeconds,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSignedStreamUrl, playVideo };
