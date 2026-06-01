/**
 * Standardized API response helper.
 * Always returns: { success: boolean, message: string, data: any }
 */

function successResponse(res, message = 'Success', data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, message = 'Something went wrong', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
}

function paginatedResponse(res, message, data, pagination) {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
}

module.exports = { successResponse, errorResponse, paginatedResponse };
