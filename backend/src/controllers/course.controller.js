const prisma = require('../utils/prismaClient');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

/**
 * GET /api/v1/courses
 * Public - Get all published courses with pagination, filtering, and search
 */
async function getAllCourses(req, res, next) {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      difficulty,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = { isPublished: true, status: 'APPROVED' };

    if (category) {
      where.category = { slug: category };
    }

    if (difficulty) {
      where.difficultyLevel = difficulty.toUpperCase();
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { instructorName: { contains: search } },
      ];
    }

    // Build orderBy
    const validSortFields = ['createdAt', 'price', 'title', 'enrollmentCount', 'ratingAvg'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [orderField]: orderDir },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          price: true,
          discountPrice: true,
          thumbnailUrl: true,
          difficultyLevel: true,
          durationHours: true,
          instructorName: true,
          instructorAvatar: true,
          enrollmentCount: true,
          ratingAvg: true,
          createdAt: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return paginatedResponse(res, 'Courses retrieved successfully.', courses, {
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
 * GET /api/v1/courses/categories
 * Public - Get all active categories
 */
async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { courses: { where: { isPublished: true, status: 'APPROVED' } } },
        },
      },
    });

    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      iconUrl: cat.iconUrl,
      sortOrder: cat.sortOrder,
      courseCount: cat._count.courses,
    }));

    return successResponse(res, 'Categories retrieved successfully.', result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/courses/category/:slug
 * Public - Get courses by category slug
 */
async function getCoursesByCategory(req, res, next) {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return errorResponse(res, 'Category not found.', 404);
    }

    const where = { categoryId: category.id, isPublished: true, status: 'APPROVED' };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          price: true,
          discountPrice: true,
          thumbnailUrl: true,
          difficultyLevel: true,
          durationHours: true,
          instructorName: true,
          enrollmentCount: true,
          ratingAvg: true,
          createdAt: true,
        },
      }),
      prisma.course.count({ where }),
    ]);

    return paginatedResponse(
      res,
      `Courses in "${category.name}" retrieved successfully.`,
      { category, courses },
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/courses/:slug
 * Public - Get single course detail
 */
async function getCourseBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        liveClasses: {
          where: { status: { in: ['SCHEDULED', 'LIVE'] } },
          orderBy: { scheduledAt: 'asc' },
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true,
          },
        },
        _count: {
          select: { recordings: true, enrollments: true },
        },
      },
    });

    if (!course || !course.isPublished || course.status !== 'APPROVED') {
      return errorResponse(res, 'Course not found.', 404);
    }

    // Parse JSON fields
    const courseData = {
      ...course,
      syllabus: course.syllabus ? JSON.parse(course.syllabus) : [],
      features: course.features ? JSON.parse(course.features) : [],
      recordingCount: course._count.recordings,
      enrollmentCount: course._count.enrollments,
    };
    delete courseData._count;

    return successResponse(res, 'Course retrieved successfully.', courseData);
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllCourses, getCategories, getCoursesByCategory, getCourseBySlug };
