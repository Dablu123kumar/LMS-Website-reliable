const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');
const { errorResponse } = require('../utils/apiResponse');

/**
 * LMS authentication middleware.
 * Verifies JWT signed with LMS_JWT_SECRET (completely separate from general auth).
 * Attaches the authenticated LMS credential + user info to req.lmsUser.
 */
async function lmsAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No LMS token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.LMS_JWT_SECRET);

    const lmsCredential = await prisma.lmsCredential.findUnique({
      where: { id: decoded.lmsCredentialId },
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

    if (!lmsCredential) {
      return errorResponse(res, 'LMS credentials not found. Token is invalid.', 401);
    }

    if (!lmsCredential.isActive) {
      return errorResponse(res, 'LMS account has been deactivated.', 403);
    }

    req.lmsUser = {
      credentialId: lmsCredential.id,
      generalUserId: lmsCredential.generalUserId,
      lmsUsername: lmsCredential.lmsUsername,
      firstName: lmsCredential.generalUser.firstName,
      lastName: lmsCredential.generalUser.lastName,
      email: lmsCredential.generalUser.email,
      avatarUrl: lmsCredential.generalUser.avatarUrl,
      role: lmsCredential.generalUser.role,
    };


    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid LMS token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'LMS token has expired.', 401);
    }
    return errorResponse(res, 'LMS authentication failed.', 500);
  }
}

module.exports = { lmsAuth };
