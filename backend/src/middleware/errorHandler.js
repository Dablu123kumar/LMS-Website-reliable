const { errorResponse } = require('../utils/apiResponse');

/**
 * Global error handling middleware.
 * Catches all unhandled errors and returns a standardized response.
 */
function errorHandler(err, req, res, _next) {
  console.error('Error:', err);

  // Prisma known request errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return errorResponse(res, `Duplicate value for ${field}. This value already exists.`, 409);
  }

  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found.', 404);
  }

  if (err.code === 'P2003') {
    return errorResponse(res, 'Related record not found. Invalid foreign key.', 400);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File too large. Maximum size is 50MB.', 413);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return errorResponse(res, 'Unexpected file field.', 400);
  }

  // JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return errorResponse(res, 'Invalid JSON in request body.', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token has expired.', 401);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 400);
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    statusCode
  );
}

/**
 * 404 handler for undefined routes.
 */
function notFoundHandler(req, res) {
  return errorResponse(res, `Route ${req.method} ${req.originalUrl} not found.`, 404);
}

module.exports = { errorHandler, notFoundHandler };
