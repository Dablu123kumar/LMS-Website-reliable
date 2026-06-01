const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * POST /api/v1/auth/signup
 * General user registration
 */
async function signup(req, res, next) {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.generalUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.generalUser.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash,
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

    // Generate general JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.GENERAL_JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(res, 'Account created successfully.', { user, token }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 * General user login (for website browsing/purchasing)
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.generalUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    // Generate general JWT with GENERAL_JWT_SECRET
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.GENERAL_JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(res, 'Login successful.', {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/lms/login
 * LMS dashboard login (completely separate JWT system with LMS_JWT_SECRET)
 */
async function lmsLogin(req, res, next) {
  try {
    const { lmsUsername, lmsPassword } = req.body;

    const credential = await prisma.lmsCredential.findUnique({
      where: { lmsUsername },
      include: {
        generalUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    if (!credential) {
      return errorResponse(res, 'Invalid LMS username or password.', 401);
    }

    if (!credential.isActive) {
      return errorResponse(res, 'LMS account has been deactivated.', 403);
    }

    const isPasswordValid = await bcrypt.compare(lmsPassword, credential.lmsPasswordHash);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid LMS username or password.', 401);
    }

    // Update last login
    await prisma.lmsCredential.update({
      where: { id: credential.id },
      data: { lastLogin: new Date() },
    });

    // Generate LMS JWT with LMS_JWT_SECRET (DIFFERENT from general JWT!)
    const token = jwt.sign(
      {
        lmsCredentialId: credential.id,
        generalUserId: credential.generalUserId,
        lmsUsername: credential.lmsUsername,
      },
      process.env.LMS_JWT_SECRET,
      { expiresIn: '24h' }
    );

    return successResponse(res, 'LMS login successful.', {
      user: {
        lmsUsername: credential.lmsUsername,
        firstName: credential.generalUser.firstName,
        lastName: credential.generalUser.lastName,
        email: credential.generalUser.email,
        avatarUrl: credential.generalUser.avatarUrl,
        role: credential.generalUser.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}


/**
 * GET /api/v1/auth/me
 * Get current general user profile (requires generalAuth)
 */
async function getMe(req, res, next) {
  try {
    const user = await prisma.generalUser.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lmsCredentials: {
          select: {
            id: true,
            lmsUsername: true,
            isActive: true,
            createdAt: true,
            lastLogin: true,
          },
        },
      },
    });

    return successResponse(res, 'User profile retrieved.', user);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/lms/me
 * Get current LMS user profile (requires lmsAuth)
 */
async function getLmsMe(req, res, next) {
  try {
    const credential = await prisma.lmsCredential.findUnique({
      where: { id: req.lmsUser.credentialId },
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

    return successResponse(res, 'LMS profile retrieved.', {
      lmsUsername: credential.lmsUsername,
      isActive: credential.isActive,
      createdAt: credential.createdAt,
      lastLogin: credential.lastLogin,
      user: credential.generalUser,
      enrolledCourses: credential.enrollments.map((e) => ({
        enrollmentId: e.id,
        course: e.course,
        progressPercent: e.progressPercent,
        enrolledAt: e.enrolledAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login, lmsLogin, getMe, getLmsMe };
