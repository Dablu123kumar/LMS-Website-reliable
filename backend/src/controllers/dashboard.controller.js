const prisma = require('../utils/prismaClient');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * GET /api/v1/dashboard/my-courses
 * Get enrolled courses with progress (lmsAuth required)
 */
async function getMyCourses(req, res, next) {
  try {
    const credentialId = req.lmsUser.credentialId;

    const enrollments = await prisma.enrollment.findMany({
      where: { lmsCredentialId: credentialId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            thumbnailUrl: true,
            difficultyLevel: true,
            durationHours: true,
            instructorName: true,
            instructorAvatar: true,
            category: {
              select: { name: true, slug: true },
            },
            _count: {
              select: { recordings: true, liveClasses: true },
            },
          },
        },
      },
    });

    const courses = enrollments.map((e) => ({
      enrollmentId: e.id,
      progressPercent: e.progressPercent,
      enrolledAt: e.enrolledAt,
      course: {
        ...e.course,
        recordingCount: e.course._count.recordings,
        liveClassCount: e.course._count.liveClasses,
      },
    }));

    // Remove _count from nested objects
    courses.forEach((c) => delete c.course._count);

    return successResponse(res, 'Enrolled courses retrieved.', courses);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/dashboard/course/:id
 * Get course content: live classes + recordings (lmsAuth required, enrollment check)
 */
async function getCourseContent(req, res, next) {
  try {
    const { id } = req.params;
    const credentialId = req.lmsUser.credentialId;

    // Verify enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: id,
        lmsCredentialId: credentialId,
      },
    });

    if (!enrollment) {
      return errorResponse(res, 'You are not enrolled in this course.', 403);
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true, slug: true },
        },
        liveClasses: {
          where: {
            OR: [
              {
                batchId: null,
                studentId: null,
              },
              {
                batch: {
                  students: {
                    some: {
                      id: req.lmsUser.generalUserId,
                    },
                  },
                },
              },
              {
                studentId: req.lmsUser.generalUserId,
              },
            ],
          },
          orderBy: { scheduledAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            scheduledAt: true,
            startedAt: true,
            endedAt: true,
            meetingUrl: true,
            status: true,
            batchId: true,
            studentId: true,
          },
        },
        recordings: {
          where: { status: 'READY' },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            videoUrl: true,
            thumbnailUrl: true,
            durationSeconds: true,
            sortOrder: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!course) {
      return errorResponse(res, 'Course not found.', 404);
    }

    return successResponse(res, 'Course content retrieved.', {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        instructorName: course.instructorName,
        instructorBio: course.instructorBio,
        instructorAvatar: course.instructorAvatar,
        category: course.category,
        syllabus: course.syllabus ? JSON.parse(course.syllabus) : [],
        features: course.features ? JSON.parse(course.features) : [],
      },
      enrollment: {
        id: enrollment.id,
        progressPercent: enrollment.progressPercent,
        enrolledAt: enrollment.enrolledAt,
      },
      liveClasses: course.liveClasses,
      recordings: course.recordings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/dashboard/stats
 * Quick stats for the LMS dashboard (lmsAuth required)
 */
async function getStats(req, res, next) {
  try {
    const credentialId = req.lmsUser.credentialId;

    const enrollments = await prisma.enrollment.findMany({
      where: { lmsCredentialId: credentialId },
      select: { progressPercent: true },
    });

    const enrolledCount = enrollments.length;
    const avgProgress =
      enrolledCount > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / enrolledCount
          )
        : 0;

    const completedCount = enrollments.filter((e) => e.progressPercent >= 100).length;

    const unreadNotifications = await prisma.notification.count({
      where: { userId: credentialId, isRead: false },
    });

    return successResponse(res, 'Dashboard stats retrieved.', {
      enrolledCourses: enrolledCount,
      completedCourses: completedCount,
      averageProgress: avgProgress,
      unreadNotifications,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/dashboard/notifications
 * Get user notifications (lmsAuth required)
 */
async function getNotifications(req, res, next) {
  try {
    const credentialId = req.lmsUser.credentialId;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: credentialId },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where: { userId: credentialId } }),
    ]);

    return successResponse(res, 'Notifications retrieved.', {
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/dashboard/notifications/:id/read
 * Mark a notification as read (lmsAuth required)
 */
async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    const credentialId = req.lmsUser.credentialId;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: credentialId },
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found.', 404);
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse(res, 'Notification marked as read.');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/dashboard/profile
 * Get LMS user profile (lmsAuth required)
 */
async function getProfile(req, res, next) {
  try {
    const credentialId = req.lmsUser.credentialId;

    const credential = await prisma.lmsCredential.findUnique({
      where: { id: credentialId },
      include: {
        generalUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            role: true,
          },
        },

        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
              },
            },
          },
        },
      },
    });

    return successResponse(res, 'Profile retrieved.', {
      lmsUsername: credential.lmsUsername,
      isActive: credential.isActive,
      createdAt: credential.createdAt,
      lastLogin: credential.lastLogin,
      user: credential.generalUser,
      enrollments: credential.enrollments.map((e) => ({
        courseId: e.courseId,
        courseTitle: e.course.title,
        courseSlug: e.course.slug,
        progressPercent: e.progressPercent,
        enrolledAt: e.enrolledAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/dashboard/profile
 * Update LMS user profile (lmsAuth required)
 */
async function updateProfile(req, res, next) {
  try {
    const generalUserId = req.lmsUser.generalUserId;
    const { firstName, lastName, phone, avatarUrl } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const updatedUser = await prisma.generalUser.update({
      where: { id: generalUserId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
      },
    });

    return successResponse(res, 'Profile updated successfully.', updatedUser);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/dashboard/profile/password
 * Change LMS user password (lmsAuth required)
 */
async function changePassword(req, res, next) {
  try {
    const credentialId = req.lmsUser.credentialId;
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    const credential = await prisma.lmsCredential.findUnique({
      where: { id: credentialId },
    });

    const isPasswordValid = await bcrypt.compare(currentPassword, credential.lmsPasswordHash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid current password.', 400);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await prisma.lmsCredential.update({
      where: { id: credentialId },
      data: { lmsPasswordHash: newPasswordHash },
    });

    return successResponse(res, 'Password updated successfully.');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/dashboard/profile/deactivate
 * Deactivate LMS account (lmsAuth required)
 */
async function deactivateAccount(req, res, next) {
  try {
    const credentialId = req.lmsUser.credentialId;

    await prisma.lmsCredential.update({
      where: { id: credentialId },
      data: { isActive: false },
    });

    return successResponse(res, 'Account deactivated successfully.');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/dashboard/live-classes/:id/token
 * Generate Agora token for a student joining a live class (enrolled check)
 */
async function getLiveClassToken(req, res, next) {
  try {
    const { id } = req.params;
    const credentialId = req.lmsUser.credentialId;

    const liveClass = await prisma.liveClass.findUnique({
      where: { id },
      include: {
        batch: {
          select: {
            students: {
              where: { id: req.lmsUser.generalUserId },
              select: { id: true },
            },
          },
        },
        course: {
          select: {
            enrollments: {
              where: { lmsCredentialId: credentialId },
            },
          },
        },
      },
    });

    if (!liveClass) {
      return errorResponse(res, 'Live class not found.', 404);
    }

    if (liveClass.course.enrollments.length === 0) {
      return errorResponse(res, 'You are not enrolled in this course.', 403);
    }

    // Check targeting restriction
    const isTargetedToAll = !liveClass.batchId && !liveClass.studentId;
    const isTargetedToMyBatch = !!(liveClass.batchId && liveClass.batch && liveClass.batch.students.length > 0);
    const isTargetedToMeIndividually = !!(liveClass.studentId && liveClass.studentId === req.lmsUser.generalUserId);

    if (!isTargetedToAll && !isTargetedToMyBatch && !isTargetedToMeIndividually) {
      return errorResponse(res, 'You are not authorized to join this live class.', 403);
    }

    // Generate a random positive integer UID for the student
    const uid = Math.floor(Math.random() * 10000) + 1;
    // Students join as subscribers
    const { getAgoraToken } = require('../utils/agora');
    const tokenData = getAgoraToken(id, uid, false);

    if (tokenData.error) {
      return errorResponse(res, tokenData.error, 500);
    }

    return successResponse(res, 'Agora subscriber token generated successfully.', tokenData);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyCourses,
  getCourseContent,
  getStats,
  getNotifications,
  markNotificationRead,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  getLiveClassToken,
};
