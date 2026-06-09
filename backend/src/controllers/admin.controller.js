const prisma = require('../utils/prismaClient');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { getAgoraToken } = require('../utils/agora');

/**
 * POST /api/v1/admin/courses
 * Create a new course (admin only)
 */
async function createCourse(req, res, next) {
  try {
    const {
      categoryId,
      title,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      thumbnailUrl,
      previewVideoUrl,
      difficultyLevel,
      durationHours,
      instructorName,
      instructorBio,
      instructorAvatar,
      syllabus,
      features,
    } = req.body;

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return errorResponse(res, 'Category not found.', 404);
    }

    // Auto-generate slug if not provided
    const courseSlug =
      slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const course = await prisma.course.create({
      data: {
        categoryId,
        title,
        slug: courseSlug,
        description,
        shortDescription: shortDescription || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        thumbnailUrl: thumbnailUrl || null,
        previewVideoUrl: previewVideoUrl || null,
        difficultyLevel: difficultyLevel || 'BEGINNER',
        durationHours: parseInt(durationHours) || 0,
        instructorName,
        instructorBio: instructorBio || null,
        instructorAvatar: instructorAvatar || null,
        syllabus: syllabus ? JSON.stringify(syllabus) : null,
        features: features ? JSON.stringify(features) : null,
        status: req.user.role === 'INSTRUCTOR' ? 'PENDING' : 'APPROVED',
      },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    return successResponse(res, 'Course created successfully.', course, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/courses/:id
 * Update a course (admin only)
 */
async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert JSON fields
    if (updateData.syllabus && typeof updateData.syllabus !== 'string') {
      updateData.syllabus = JSON.stringify(updateData.syllabus);
    }
    if (updateData.features && typeof updateData.features !== 'string') {
      updateData.features = JSON.stringify(updateData.features);
    }
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.discountPrice) updateData.discountPrice = parseFloat(updateData.discountPrice);
    if (updateData.durationHours) updateData.durationHours = parseInt(updateData.durationHours);

    // Enforce role-based status logic
    if (req.user.role === 'INSTRUCTOR') {
      delete updateData.status;
      updateData.status = 'PENDING';
    }

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    return successResponse(res, 'Course updated successfully.', course);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/admin/courses/:id
 * Delete a course (admin only)
 */
async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return errorResponse(res, 'Course not found.', 404);
    }

    await prisma.course.delete({ where: { id } });

    return successResponse(res, 'Course deleted successfully.');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/admin/categories
 * Create a new category (admin only)
 */
async function createCategory(req, res, next) {
  try {
    const { name, slug, description, iconUrl, sortOrder } = req.body;

    const categorySlug =
      slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        description: description || null,
        iconUrl: iconUrl || null,
        sortOrder: parseInt(sortOrder) || 0,
      },
    });

    return successResponse(res, 'Category created successfully.', category, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/admin/live-classes
 * Schedule a new live class (admin only)
 */
async function scheduleLiveClass(req, res, next) {
  try {
    const { courseId, title, description, scheduledAt, meetingUrl, batchId, studentId } = req.body;

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return errorResponse(res, 'Course not found.', 404);
    }

    const liveClass = await prisma.liveClass.create({
      data: {
        courseId,
        title,
        description: description || null,
        scheduledAt: new Date(scheduledAt),
        meetingUrl: meetingUrl || null,
        status: 'SCHEDULED',
        batchId: batchId || null,
        studentId: studentId || null,
      },
      include: {
        course: { select: { title: true } },
        batch: { select: { batchName: true } },
        student: { select: { firstName: true, lastName: true } },
      },
    });

    return successResponse(res, 'Live class scheduled successfully.', liveClass, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/live-classes/:id/start
 * Start a live class (admin only)
 */
async function startLiveClass(req, res, next) {
  try {
    const { id } = req.params;
    const { meetingUrl } = req.body;

    const liveClass = await prisma.liveClass.findUnique({ where: { id } });
    if (!liveClass) {
      return errorResponse(res, 'Live class not found.', 404);
    }

    if (liveClass.status === 'COMPLETED') {
      return errorResponse(res, 'This live class has already ended.', 400);
    }

    const updated = await prisma.liveClass.update({
      where: { id },
      data: {
        status: 'LIVE',
        startedAt: new Date(),
        meetingUrl: meetingUrl || liveClass.meetingUrl,
      },
    });

    return successResponse(res, 'Live class started.', updated);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/live-classes/:id/end
 * End a live class (admin only)
 */
async function endLiveClass(req, res, next) {
  try {
    const { id } = req.params;

    const liveClass = await prisma.liveClass.findUnique({ where: { id } });
    if (!liveClass) {
      return errorResponse(res, 'Live class not found.', 404);
    }

    const updated = await prisma.liveClass.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });

    return successResponse(res, 'Live class ended.', updated);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/admin/live-classes/:id/notify
 * Send notification to all targeted students for a live class (admin only)
 */
async function notifyLiveClass(req, res, next) {
  try {
    const { id } = req.params;

    const liveClass = await prisma.liveClass.findUnique({
      where: { id },
      include: {
        course: {
          select: { title: true }
        },
        batch: {
          include: {
            students: {
              include: {
                lmsCredentials: {
                  where: { isActive: true },
                  select: { id: true }
                }
              }
            }
          }
        },
        student: {
          include: {
            lmsCredentials: {
              where: { isActive: true },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!liveClass) {
      return errorResponse(res, 'Live class not found.', 404);
    }

    // Determine target credential IDs
    let targetCredentialIds = [];
    if (liveClass.studentId && liveClass.student) {
      targetCredentialIds = liveClass.student.lmsCredentials.map(c => c.id);
    } else if (liveClass.batchId && liveClass.batch) {
      liveClass.batch.students.forEach(student => {
        student.lmsCredentials.forEach(c => {
          targetCredentialIds.push(c.id);
        });
      });
    } else {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: liveClass.courseId },
        select: { lmsCredentialId: true }
      });
      targetCredentialIds = enrollments.map(e => e.lmsCredentialId);
    }

    const notificationType =
      liveClass.status === 'LIVE' ? 'LIVE_STARTED' : 'LIVE_REMINDER';
    const notificationTitle =
      liveClass.status === 'LIVE'
        ? `🔴 Live Now: ${liveClass.title}`
        : `⏰ Upcoming: ${liveClass.title}`;
    const notificationMessage =
      liveClass.status === 'LIVE'
        ? `${liveClass.title} is live now! Join the class for "${liveClass.course.title}".`
        : `${liveClass.title} for "${liveClass.course.title}" is scheduled at ${liveClass.scheduledAt.toISOString()}.`;

    // Create notifications for targeted students
    const notifications = targetCredentialIds.map((credId) => ({
      liveClassId: id,
      userId: credId,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    // Mark notification as sent
    await prisma.liveClass.update({
      where: { id },
      data: { notificationSent: true },
    });

    // Emit real-time notifications via Socket.IO
    const io = req.app.get('io');
    if (io) {
      targetCredentialIds.forEach((credId) => {
        io.of('/notifications').to(`user:${credId}`).emit('notification', {
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          liveClassId: id,
        });
      });
    }

    return successResponse(res, `Notifications sent to ${notifications.length} students.`, {
      notifiedCount: notifications.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/admin/recordings
 * Upload/add a recording (admin only)
 */
async function addRecording(req, res, next) {
  try {
    const {
      courseId,
      liveClassId,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      durationSeconds,
      sortOrder,
    } = req.body;

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return errorResponse(res, 'Course not found.', 404);
    }

    const recording = await prisma.recording.create({
      data: {
        courseId,
        liveClassId: liveClassId || null,
        title,
        description: description || null,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        durationSeconds: parseInt(durationSeconds) || 0,
        status: 'READY',
        sortOrder: parseInt(sortOrder) || 0,
      },
      include: {
        course: { select: { title: true } },
      },
    });

    // Notify enrolled students about new recording
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { lmsCredentialId: true },
    });

    if (enrollments.length > 0) {
      const notifications = enrollments.map((e) => ({
        userId: e.lmsCredentialId,
        type: 'RECORDING_UPLOADED',
        title: `📹 New Recording: ${title}`,
        message: `A new recording "${title}" has been added to "${course.title}".`,
      }));

      await prisma.notification.createMany({ data: notifications });

      // Real-time notification
      const io = req.app.get('io');
      if (io) {
        enrollments.forEach((e) => {
          io.of('/notifications').to(`user:${e.lmsCredentialId}`).emit('notification', {
            type: 'RECORDING_UPLOADED',
            title: `📹 New Recording: ${title}`,
            message: `A new recording "${title}" has been added to "${course.title}".`,
          });
        });
      }
    }

    return successResponse(res, 'Recording added successfully.', recording, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/students
 * List all students with their enrollment info (admin only)
 */
async function listStudents(req, res, next) {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = { role: 'USER' };

    if (req.user.role === 'INSTRUCTOR') {
      const instructorName = `${req.user.firstName} ${req.user.lastName}`;
      const myCourses = await prisma.course.findMany({
        where: { instructorName: { equals: instructorName } },
        select: { id: true },
      });
      const myCourseIds = myCourses.map((c) => c.id);

      where.enrollments = {
        some: {
          courseId: { in: myCourseIds },
        },
      };
    }


    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.generalUser.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
          lmsCredentials: {
            select: {
              id: true,
              lmsUsername: true,
              isActive: true,
              lastLogin: true,
            },
          },
          enrollments: {
            select: {
              id: true,
              courseId: true,
              progressPercent: true,
              enrolledAt: true,
              course: {
                select: { title: true },
              },
            },
          },
          _count: {
            select: { enrollments: true, payments: true },
          },
        },
      }),
      prisma.generalUser.count({ where }),
    ]);

    return paginatedResponse(res, 'Students retrieved.', students, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/live-classes
 * List all live classes (admin only)
 */
async function listLiveClasses(req, res, next) {
  try {
    const liveClasses = await prisma.liveClass.findMany({
      include: {
        course: { select: { id: true, title: true } },
        batch: { select: { id: true, batchName: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    return successResponse(res, 'Live classes retrieved successfully.', liveClasses);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/recordings
 * List all recordings (admin only)
 */
async function listRecordings(req, res, next) {
  try {
    const recordings = await prisma.recording.findMany({
      include: {
        course: { select: { id: true, title: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    });
    return successResponse(res, 'Recordings retrieved successfully.', recordings);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/courses
 * List all courses (admin sees all, instructor sees only theirs)
 */
async function listCourses(req, res, next) {
  try {
    const where = {};

    if (req.user.role === 'INSTRUCTOR') {
      const instructorName = `${req.user.firstName} ${req.user.lastName}`;
      where.instructorName = instructorName;
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return successResponse(res, 'Courses retrieved successfully.', courses);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/students/:id
 * Update a student's profile (admin only)
 */
async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    const student = await prisma.generalUser.findUnique({ where: { id } });
    if (!student) {
      return errorResponse(res, 'Student not found.', 404);
    }

    // If email changed, check for duplicates
    if (email && email.toLowerCase() !== student.email) {
      const existing = await prisma.generalUser.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existing) {
        return errorResponse(res, 'Email is already in use by another account.', 409);
      }
    }

    const updated = await prisma.generalUser.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(res, 'Student updated successfully.', updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/admin/students/:id
 * Delete a student (admin only — cascades to enrollments, payments, credentials)
 */
async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;

    const student = await prisma.generalUser.findUnique({ where: { id } });
    if (!student) {
      return errorResponse(res, 'Student not found.', 404);
    }

    if (student.role === 'ADMIN') {
      return errorResponse(res, 'Cannot delete an admin account.', 403);
    }

    await prisma.generalUser.delete({ where: { id } });

    return successResponse(res, 'Student deleted successfully.');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/categories
 * List all categories with course count (admin only)
 */
async function listCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { courses: true } },
      },
    });

    return successResponse(res, 'Categories retrieved successfully.', categories);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/categories/:id
 * Update a category (admin only)
 */
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, description, iconUrl, sortOrder, isActive } = req.body;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return errorResponse(res, 'Category not found.', 404);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description || null;
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl || null;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder) || 0;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, 'Category updated successfully.', updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/admin/categories/:id
 * Delete a category (admin only — only if no courses reference it)
 */
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { courses: true } } },
    });

    if (!category) {
      return errorResponse(res, 'Category not found.', 404);
    }

    if (category._count.courses > 0) {
      return errorResponse(
        res,
        `Cannot delete: ${category._count.courses} course(s) still use this category. Reassign or delete them first.`,
        400
      );
    }

    await prisma.category.delete({ where: { id } });

    return successResponse(res, 'Category deleted successfully.');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/live-classes/:id/token
 * Generate Agora token for starting/joining the live class (admin/instructor)
 */
async function getLiveClassToken(req, res, next) {
  try {
    const { id } = req.params;

    const liveClass = await prisma.liveClass.findUnique({
      where: { id },
    });

    if (!liveClass) {
      return errorResponse(res, 'Live class not found.', 404);
    }

    // Generate a random positive integer UID for the admin/instructor
    const uid = Math.floor(Math.random() * 10000) + 1;
    // Admins/Instructors join as publishers
    const tokenData = getAgoraToken(id, uid, true);

    if (tokenData.error) {
      return errorResponse(res, tokenData.error, 500);
    }

    return successResponse(res, 'Agora publisher token generated successfully.', tokenData);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/admin/batches
 * Create a new batch for a course (admin only)
 */
async function createBatch(req, res, next) {
  try {
    const { courseId, batchName, studentIds = [] } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return errorResponse(res, 'Course not found.', 404);
    }

    const batch = await prisma.batch.create({
      data: {
        courseId,
        batchName,
        students: {
          connect: studentIds.map((id) => ({ id })),
        },
      },
      include: {
        students: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return successResponse(res, 'Batch created successfully.', batch, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/courses/:courseId/batches
 * List all batches of a course (admin only)
 */
async function listBatchesForCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const batches = await prisma.batch.findMany({
      where: { courseId },
      include: {
        students: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, 'Batches retrieved successfully.', batches);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/admin/batches/:id
 * Update batch name or student list (admin only)
 */
async function updateBatch(req, res, next) {
  try {
    const { id } = req.params;
    const { batchName, studentIds } = req.body;

    const existing = await prisma.batch.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Batch not found.', 404);
    }

    const updateData = {};
    if (batchName !== undefined) {
      updateData.batchName = batchName;
    }
    if (studentIds !== undefined) {
      updateData.students = {
        set: studentIds.map((sid) => ({ id: sid })),
      };
    }

    const batch = await prisma.batch.update({
      where: { id },
      data: updateData,
      include: {
        students: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return successResponse(res, 'Batch updated successfully.', batch);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/admin/batches/:id
 * Delete a batch (admin only)
 */
async function deleteBatch(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.batch.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Batch not found.', 404);
    }

    await prisma.batch.delete({ where: { id } });

    return successResponse(res, 'Batch deleted successfully.');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/courses/:courseId/students
 * List all students enrolled in a course (admin only)
 */
async function listCourseStudents(req, res, next) {
  try {
    const { courseId } = req.params;
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        generalUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    const students = enrollments.map((e) => e.generalUser);
    return successResponse(res, 'Course students retrieved successfully.', students);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  createCategory,
  scheduleLiveClass,
  startLiveClass,
  endLiveClass,
  notifyLiveClass,
  addRecording,
  listStudents,
  updateStudent,
  deleteStudent,
  listLiveClasses,
  listRecordings,
  listCourses,
  listCategories,
  updateCategory,
  deleteCategory,
  getLiveClassToken,
  createBatch,
  listBatchesForCourse,
  updateBatch,
  deleteBatch,
  listCourseStudents,
};
