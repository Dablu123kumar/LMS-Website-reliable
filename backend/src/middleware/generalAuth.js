const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');
const { errorResponse } = require('../utils/apiResponse');

/**
 * General authentication middleware.
 * Verifies JWT signed with GENERAL_JWT_SECRET.
 * Attaches the authenticated GeneralUser to req.user.
 */
async function generalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    // Read from HttpOnly cookie first, fall back to Authorization header
    const token = req.cookies?.general_token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.GENERAL_JWT_SECRET);

    const user = await prisma.generalUser.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found. Token is invalid.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 500);
  }
}

/**
 * Admin role check middleware. Must be used AFTER generalAuth.
 */
function adminOnly(req, res, next) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'INSTRUCTOR')) {
    return errorResponse(res, 'Access denied. Privileged access required.', 403);
  }
  next();
}


module.exports = { generalAuth, adminOnly };
